'use strict';
nwmApplication.service('CanvasService', ['$routeParams', '$window', 'SocketIoService', 'UserService', 'Utils', 'FabricService', function ($routeParams, $window, SocketIoService, UserService, Utils, FabricService) {
    var self = this;
    var canvasToolOptions = [
        {name: 'None', glyphiconicon: 'glyphicon-off', active: true, fn: canvasToolNone},
        {name: 'Write', glyphiconicon: 'glyphicon-font', active: false, fn: canvasToolWrite},
        {name: 'Draw', glyphiconicon: 'glyphicon-pencil', active: false, fn: canvasToolDraw},
        {name: 'Rectangle', glyphiconicon: 'glyphicon-unchecked', active: false, fn: canvasToolRect},
        {name: 'Arrow', glyphiconicon: 'glyphicon-arrow-right', active: false, fn: canvasToolArrow}
    ];

    function canvasToolNone() {
        FabricService.canvas().isDrawingMode = false;
        FabricService.removeMouseDown();
        FabricService.removePathCreated();
    }

    function canvasToolWrite() {
        FabricService.mouseDown(iTextMouseDown);
        function iTextMouseDown(options) {
            if (!options.target) {
                var iText = FabricService.createItext(options);
                createAndSyncFrom(iText);
                attachListenersToText(iText);
                iText.enterEditing();
                iText.selectionStart = 0;
                iText.selectionEnd = iText.text.length;
                self.setActiveCanvasTool('None');
                FabricService.canvas().renderAll();
            }
        }
    }

    function canvasToolRect() {
        FabricService.mouseDown(rectMouseDown);
        function rectMouseDown(options) {
            if (!options.target) {
                var rect = FabricService.createRect(options);
                createAndSyncFrom(rect);
                attachCommonListeners(rect);
                self.setActiveCanvasTool('None');
                FabricService.canvas().renderAll();
            }
        }
    }

    function canvasToolDraw() {
        FabricService.canvas().isDrawingMode = true;
        FabricService.pathCreated(drawPath);
        function drawPath(options) {
            var fabricObject = options.path;
            fabricObject.objectId = Utils.guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            SocketIoService.emit('addObject', fabricObjectJson);
            attachCommonListeners(fabricObject)
        }
    }

    function canvasToolArrow(){
        FabricService.mouseDown(createArrow);

        function createArrow(options){
            if (!options.target) {
                var arrow = FabricService.createArrow(options);
                createAndSyncFrom(arrow);
                attachCommonListeners(arrow);
                self.setActiveCanvasTool('None');
                FabricService.canvas().renderAll();
            }
        }
    }

    function createAndSyncFrom(fabricObject) {
        var json = JSON.stringify(fabricObject);
        SocketIoService.emit('addObject', json);
        FabricService.canvas().calcOffset();
        FabricService.canvas().add(fabricObject);
        FabricService.canvas().setActiveObject(fabricObject);
    }

    function attachListenersToText(iText) {
        iText.on('changed', function (event) {
            SocketIoService.emit('writing', {'objectId': iText.objectId, 'text': iText.text});
        });
        attachCommonListeners(iText);
    }

    function attachCommonListeners(fabricObject) {
        fabricObject.on('moving', sendObjectInformation);
        fabricObject.on('rotating', sendObjectInformation);
        fabricObject.on('scaling', sendObjectInformation);
        function sendObjectInformation(event) {
            SocketIoService.emit('scaling', {'objectId': fabricObject.objectId, 'angle': fabricObject.angle, 'originX': fabricObject.originX, 'originY': fabricObject.originY, 'scaleX': fabricObject.scaleX, 'scaleY': fabricObject.scaleY, 'left': fabricObject.left, 'top': fabricObject.top});
        }
    }

    this.canvasTools = function () {
        return canvasToolOptions;
    }
    this.findActiveCanvasTool = function () {
        return canvasToolOptions.filter(function (tool) {
            if (tool.active) {
                return true;
            }
            return false;
        })[0];
    }
    this.findCanvasTool = function (name) {
        return canvasToolOptions.filter(function (tool) {
            if (tool.name === name) {
                return true;
            }
            return false;
        })[0];
    }
    this.setActiveCanvasTool = function (name) {
        var activeCanvasTool = this.findActiveCanvasTool();
        if (!name || activeCanvasTool.name === name) {
            return;
        }
        activeCanvasTool.active = false;
        var tool = this.findCanvasTool(name);
        tool.active = true;
        tool.fn();
    }
    this.isDrawingMode = function (value) {
        FabricService.canvas().isDrawingMode = value;
    }
    this.calculateOffset = function () {
        FabricService.canvas().calcOffset();
    }
    this.start = function ($scope) {
        SocketIoService.joinRoom(UserService.user());
        FabricService.createCanvas();
        FabricService.addObjectIdToPrototype();
        SocketIoService.reconnect(connect);
        SocketIoService.syncClient(syncClient);
        SocketIoService.updateCanvas(updateCanvas);
        SocketIoService.writing(writing);
        SocketIoService.moving(updateFabricObject);
        SocketIoService.rotating(updateFabricObject);
        SocketIoService.scaling(updateFabricObject);
        SocketIoService.addObject(addObject);
        //FabricService.selectionCreated(selectionCreated);
        function selectionCreated(options) {
            var fabricObject = options.target;
            fabricObject.objectId = Utils.guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            console.log(fabricObjectJson);
            //todo: when selecting multiple, position might be incorrect in clients
            //todo: sometimes duplication when moving
            SocketIoService.emit('addObject', fabricObjectJson);
            attachCommonListeners(fabricObject);
        }

        function connect() {
            SocketIoService.joinRoom(UserService.user());
        }

        function syncClient(message) {
            SocketIoService.emit('syncClient', {clientId: message.clientId, canvas: JSON.stringify(FabricService.canvas())});
        }

        function updateCanvas(message) {
            FabricService.canvas().loadFromJSON(message.canvas);
            FabricService.findObjects().forEach(function (fabricObject) {
                attachFabricObjectListeners(fabricObject);
            });
            FabricService.canvas().renderAll();
        }

        function writing(message) {
            var object = FabricService.findObjectFromCanvasWith(message.objectId);
            object.text = message.text;
            FabricService.canvas().renderAll();
        }

        function updateFabricObject(message) {
            var object = FabricService.findObjectFromCanvasWith(message.objectId);
            setFabricObjectInfoAndRender(object, message);
            FabricService.canvas().renderAll();
        }

        function setFabricObjectInfoAndRender(fabricObject, message) {
            fabricObject.angle = message.angle;
            fabricObject.scaleX = message.scaleX;
            fabricObject.scaleY = message.scaleY;
            fabricObject.top = message.top;
            fabricObject.left = message.left;
            fabricObject.originX = message.originX;
            fabricObject.originY = message.originY;
        }

        function attachFabricObjectListeners(fabricObject) {
            if (fabricObject.type === 'i-text') {
                attachListenersToText(fabricObject);
            } else if (fabricObject.type === 'path' || fabricObject.type === 'rect') {
                attachCommonListeners(fabricObject);
            } else if (fabricObject.type === 'group') {
                var toRemove = [];
                fabricObject._objects.forEach(function (element) {
                    toRemove.push(FabricService.findObjectFromCanvasWith(element.objectId));
                });
                toRemove.forEach(function (element) {
                    FabricService.canvas().remove(element);
                });
                attachCommonListeners(fabricObject);
            }
        }

        function addObject(message) {
            var jsonObject = JSON.parse(message);
            fabric.util.enlivenObjects([jsonObject], function (objects) {
                var origRenderOnAddRemove = FabricService.canvas().renderOnAddRemove;
                FabricService.canvas().renderOnAddRemove = false;
                objects.forEach(function (fabricObject) {
                    attachFabricObjectListeners(fabricObject);
                    FabricService.canvas().add(fabricObject);
                });
                FabricService.canvas().renderOnAddRemove = origRenderOnAddRemove;
                FabricService.canvas().renderAll();
                FabricService.canvas().calcOffset();
            });
        }
    }
}])