'use strict';

nwmApplication.service('CanvasService',['$routeParams', '$window', 'SocketIoService','UserService','Utils','FabricService', function($routeParams, $window, SocketIoService,UserService, Utils, FabricService){
    var self = this;
    var canvasToolOptions = [
        {name: 'None', glyphiconicon: 'glyphicon-off', active: true, isDrawingMode: false},
        {name: 'Write', glyphiconicon: 'glyphicon-font', active: false, isDrawingMode: false},
        {name: 'Draw', glyphiconicon: 'glyphicon-pencil', active: false, isDrawingMode: true}
    ];

    this.canvasTools = function() {
        return canvasToolOptions;
    }

    this.findActiveCanvasTool = function(){
        return canvasToolOptions.filter(function(tool){
            if(tool.active){
                return true;
            }
            return false;
        })[0];
    }

    this.findCanvasTool = function(name){
        return canvasToolOptions.filter(function(tool){
            if(tool.name === name ){
                return true;
            }
            return false;
        })[0];
    }

    this.setActiveCanvasTool = function(name) {
        var activeCanvasTool = this.findActiveCanvasTool();
        if(!name || activeCanvasTool.name === name){
            return;
        }
        activeCanvasTool.active = false;
        var tool = this.findCanvasTool(name);
        tool.active = true;
        FabricService.canvas().isDrawingMode = tool.isDrawingMode;
    }

    this.isDrawingMode = function(value){
        FabricService.canvas().isDrawingMode = value;
    }

    this.calculateOffset = function(){
        FabricService.canvas().calcOffset();
    }

    this.start = function($scope){

        SocketIoService.joinRoom(UserService.user());
        FabricService.createCanvas();
        FabricService.addObjectIdToPrototype();

        SocketIoService.reconnect(connect);
        SocketIoService.syncClient(syncClient);
        SocketIoService.updateCanvas(updateCanvas);
        SocketIoService.writing(writing);
        SocketIoService.moving(moving);
        SocketIoService.rotating(rotating);
        SocketIoService.scaling(scaling);
        SocketIoService.addObject(addObject);

        FabricService.pathCreated(pathCreated);
        FabricService.selectionCreated(selectionCreated);
        FabricService.mouseDown(mouseDown);

        function selectionCreated(options){
            var fabricObject = options.target;
            fabricObject.objectId = Utils.guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            //todo: when sending, do full clear to canvas. So this needs separate function/stream
            SocketIoService.emit('addObject', fabricObjectJson);
            attachCommonListeners(fabricObject);
        }

        function pathCreated(options){
            var fabricObject = options.path;
            fabricObject.objectId = Utils.guid();
            var fabricObjectJson = JSON.stringify(fabricObject);
            SocketIoService.emit('addObject', fabricObjectJson);
            attachCommonListeners(fabricObject)
        }

        function mouseDown(options){
            if (!options.target && self.findActiveCanvasTool().name === 'Write') {
                self.setActiveCanvasTool('None');
                var iText = FabricService.createItext(options);
                var iTextJson = JSON.stringify(iText);
                SocketIoService.emit('addObject', iTextJson);
                attachListenersToText(iText);
                FabricService.canvas().calcOffset();
                FabricService.canvas().add(iText);
                FabricService.canvas().renderAll();
            }
        }


        function attachListenersToText(iText){
            iText.on('changed', function(event){
                SocketIoService.emit('writing', {'objectId':iText.objectId,'text':iText.text});
            });
            attachCommonListeners(iText);
        }

        function attachCommonListeners(fabricObject){
            fabricObject.on('moving', function(event){
                SocketIoService.emit('moving', {'objectId':fabricObject.objectId,'left': fabricObject.left, 'top': fabricObject.top,'originX': fabricObject.originX, 'originY':fabricObject.originY})
            });

            fabricObject.on('rotating', function(event){
                SocketIoService.emit('rotating',{'objectId':fabricObject.objectId, 'angle':fabricObject.angle,'originX': fabricObject.originX, 'originY':fabricObject.originY, 'left': fabricObject.left, 'top': fabricObject.top});
            });

            fabricObject.on('scaling', function(event){
                SocketIoService.emit('scaling', {'objectId': fabricObject.objectId, 'originX': fabricObject.originX, 'originY':fabricObject.originY, 'scaleX': fabricObject.scaleX, 'scaleY':fabricObject.scaleY, 'left': fabricObject.left, 'top': fabricObject.top});
            });
        }


        function connect(){
            SocketIoService.joinRoom(UserService.user());
        }

        function syncClient(message){
            SocketIoService.emit('syncClient', {clientId:message.clientId, canvas:JSON.stringify(FabricService.canvas())});
        }

        function updateCanvas(message){
            FabricService.canvas().loadFromJSON(message.canvas);
            FabricService.canvas().renderAll();
        }

        function writing(message){
            console.log("moi")
            var object = FabricService.findObjectFromCanvasWith(message.objectId);
            object.text = message.text;
            FabricService.canvas().renderAll();
        }

        function moving(message){
            var object = FabricService.findObjectFromCanvasWith(message.objectId);
            object.top = message.top;
            object.left= message.left;
            object.originX = message.originX;
            object.originY = message.originY;
            FabricService.canvas().renderAll();
        }

        function rotating(message){
            var object = FabricService.findObjectFromCanvasWith(message.objectId);
            object.angle = message.angle;
            object.originX = message.originX;
            object.originY = message.originY;
            object.top = message.top;
            object.left= message.left;
            FabricService.canvas().renderAll();
        }

        function scaling(message){
            var object = FabricService.findObjectFromCanvasWith(message.objectId);
            object.scaleX = message.scaleX;
            object.scaleY = message.scaleY;
            object.top = message.top;
            object.left= message.left;
            object.originX = message.originX;
            object.originY = message.originY;
            FabricService.canvas().renderAll();
        }

        function attachFabricObjectListeners(fabricObject) {
            if (fabricObject.type === 'i-text') {
                attachListenersToText(fabricObject);
            } else if (fabricObject.type === 'path') {
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

        function addObject(message){
            var jsonObject = JSON.parse(message);
            fabric.util.enlivenObjects([jsonObject], function(objects){
                var origRenderOnAddRemove = FabricService.canvas().renderOnAddRemove;
                FabricService.canvas().renderOnAddRemove = false;
                objects.forEach(function(fabricObject) {
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