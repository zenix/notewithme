'use strict';
nwmApplication.service('CanvasService', ['$routeParams', '$window', 'SocketIoService', 'UserService', 'Utils', 'FabricService', 'ListenerService', function ($routeParams, $window, SocketIoService, UserService, Utils, FabricService, ListenerService) {
    var self = this;
    var canvasToolOptions = [
        {name: 'None', glyphiconicon: 'glyphicon-off', active: false, fn: canvasToolNone, help: 'Deactivate any tool'},
        {name: 'Write', glyphiconicon: 'glyphicon-font', active: false, fn: canvasToolWrite, help: 'Write text'},
        {name: 'Draw', glyphiconicon: 'glyphicon-pencil', active: false, fn: canvasToolDraw, help: 'Free draw with pencil'},
        {name: 'Rectangle', glyphiconicon: 'glyphicon-unchecked', active: false, fn: canvasToolRect, help:'Add rectangle'},
        {name: 'Arrow', glyphiconicon: 'glyphicon-arrow-right', active: false, fn: canvasToolArrow, help: 'Add arrow'},
        {name: 'Duplicate', glyphiconicon: 'glyphicon-duplicate', active: false, fn: duplicateObject, help: 'Duplicate any object'},
        {name: 'Group/Ungroup', glyphiconicon: 'glyphicon-magnet', active: false, fn: groupUngroupObjects, help: 'Group or Ungroup objects'}
    ];

    this.start = function () {
        FabricService.createCanvas();
        FabricService.pimpFabricPrototypes();
        SocketIoService.send().joinRoom(UserService.user());
        ListenerService.bindListeners();
        FabricService.selectionCreated(selectionCreated);
        FabricService.selectionCleared(selectionCleared);
        function selectionCreated(options) {
            if(options.target.type === 'group') {
                ListenerService.attachListenersToFabricObject(options.target);
            }
            /*
            var fabricObject = options.target;
            fabricObject.objectId = Utils.guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            SocketIoService.send().addObject(fabricObjectJson);
            ListenerService.attachListenersToFabricObject(fabricObject);
            _.forEach(fabricObject._objects, function(object){
                SocketIoService.send().removeObject({objectId: object.objectId})
            });*/
        }

        function selectionCleared(options){
            if(options.target.type === 'group') {
                ListenerService.removeAllListeners(options.target);
            }
           /* var fabricObject = options.target;
            if(fabricObject.type === 'group'){

                SocketIoService.send().removeObject({objectId: fabricObject.objectId});
                _.forEach(fabricObject._objects, function(object){
                    var clone = object.clone();
                    fabricObject._restoreObjectState(clone);
                    var fabricObjectJson = JSON.stringify(clone);
                    SocketIoService.send().addObject(fabricObjectJson);
                });
            }*/
        }
    };

    function groupUngroupObjects(){
        var activeGroup = FabricService.canvas().getActiveGroup();
        if(activeGroup){
            FabricService.canvas().deactivateAll();
            var groupableObjects = [];
            _.forEach(activeGroup._objects, function(object){
                var cloneGroupableObject = object.clone();
               FabricService.removeObject(object.objectId);
                groupableObjects.push(cloneGroupableObject)
            });
            FabricService.canvas().add(FabricService.createGroup(groupableObjects));
            FabricService.canvas().renderAll();
        }

        self.setActiveCanvasTool('None');
    }

    function duplicateObject(){
        var fabricObject = FabricService.canvas().getActiveObject();
        if(fabricObject){
            var clonedFabricObject = fabric.util.object.clone(fabricObject);
            correctPosition(clonedFabricObject, fabricObject);
            clonedFabricObject.objectId = Utils.guid();
            ListenerService.removeAllListeners(clonedFabricObject);
            ListenerService.attachListenersToFabricObject(clonedFabricObject);
            FabricService.canvas().add(clonedFabricObject).renderAll();
            sendOverWire(clonedFabricObject);
        }

        function correctPosition(clonedFabricObject, fabricObject) {
            var random = Math.floor((Math.random() * 50) + 1);
            clonedFabricObject.set("top", fabricObject.top + random);
            clonedFabricObject.set("left", fabricObject.left + random);
        }

        function sendOverWire(clonedFabricObject) {
            var json = JSON.stringify(clonedFabricObject);
            SocketIoService.send().addObject(json);
        }
        self.setActiveCanvasTool('None');

    };
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
                canvas: JSON.stringify(FabricService.canvas().toJSON(['timestamp']))
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