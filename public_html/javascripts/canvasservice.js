'use strict';
nwmApplication.service('CanvasService', ['$routeParams', '$window', 'SocketIoService', 'UserService', 'Utils', 'FabricService', 'ListenerService', function ($routeParams, $window, SocketIoService, UserService, Utils, FabricService, ListenerService) {
    var self = this;
    var canvasToolOptions = [
        {name: 'None', glyphiconicon: 'glyphicon-off', active: false, fn: canvasToolNone},
        {name: 'Write', glyphiconicon: 'glyphicon-font', active: false, fn: canvasToolWrite},
        {name: 'Draw', glyphiconicon: 'glyphicon-pencil', active: false, fn: canvasToolDraw},
        {name: 'Rectangle', glyphiconicon: 'glyphicon-unchecked', active: false, fn: canvasToolRect},
        {name: 'Arrow', glyphiconicon: 'glyphicon-arrow-right', active: false, fn: canvasToolArrow}
    ];

    function pasteImage(event) {

        var cbData=event.clipboardData;
        for(var i=0;i<cbData.items.length;i++){
            var cbDataItem = cbData.items[i];
            var type = cbDataItem.type;
            if (type.indexOf("image")!=-1) {
                var imageData = cbDataItem.getAsFile();
                console.log(imageData);
                var imageURL=window.webkitURL.createObjectURL(imageData);
                FabricService.createImage(imageURL, function(img){
                    var oImg = img.set({ left: 50, top: 100, angle: 0 }).scale(0.2);
                    FabricService.canvas().add(oImg).renderAll();
                    ListenerService.attachListenersToFabricObject(oImg);
                    var fabricObjectJson = JSON.stringify(oImg);
                    SocketIoService.send().addObject(fabricObjectJson);
                });

            }
        }
    }
    this.start = function () {
        SocketIoService.send().joinRoom(UserService.user());
        FabricService.createCanvas();
        FabricService.addObjectIdToPrototype();
        $window.addEventListener('paste',pasteImage);
        ListenerService.bindListeners();

        //FabricService.selectionCreated(selectionCreated);
        function selectionCreated(options) {
            var fabricObject = options.target;
            fabricObject.objectId = Utils.guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            //todo: when selecting multiple, position might be incorrect in clients
            //todo: sometimes duplication when moving
            SocketIoService.send().addObject(fabricObjectJson);
            ListenerService.attachListenersToFabricObject(fabricObject);
        }
    }

    this.getCanvasAsBase64 = function(imagetype){
        return FabricService.canvas().toDataURL(imagetype);
    };
    this.canvasTools = function () {
        return canvasToolOptions;
    };
    this.saveCanvas = function(){
        SocketIoService.send().saveCanvas(
            {
                randomString: UserService.user().randomString,
                room: UserService.user().room,
                canvas: JSON.stringify(FabricService.canvas())
            });
    };
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
                ListenerService.attachListenersToFabricObject(iText);
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
                ListenerService.attachListenersToFabricObject(rect);
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
            SocketIoService.send().addObject(fabricObjectJson);
            ListenerService.attachListenersToFabricObject(fabricObject)
        }
    }

    function canvasToolArrow() {
        FabricService.mouseDown(createArrow);

        function createArrow(options) {
            if (!options.target) {
                var arrow = FabricService.createArrow(options);
                createAndSyncFrom(arrow);
                ListenerService.attachListenersToFabricObject(arrow);
                self.setActiveCanvasTool('None');
                FabricService.canvas().renderAll();
            }
        }
    }

    function createAndSyncFrom(fabricObject) {
        var json = JSON.stringify(fabricObject);
        SocketIoService.send().addObject(json);
        FabricService.canvas().calcOffset();
        FabricService.canvas().add(fabricObject);
        FabricService.canvas().setActiveObject(fabricObject);
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
        if (activeCanvasTool) {
            if (!name || activeCanvasTool.name === name) {
                return;
            }
            activeCanvasTool.active = false;
        }
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

}])