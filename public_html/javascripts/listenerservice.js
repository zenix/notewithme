'use strict';
nwmApplication.service('ListenerService', ['$window', 'FabricService', 'SocketIoService', 'Utils','UserService', function ($window, FabricService, SocketIoService, Utils, UserService) {
    var self = this;
    var copiedObjects = new Array();
    var pastePixelsToAddComparedToOriginal = 20;
    this.bindListeners = function () {
        document.onkeydown = onKeyDownHandler;
        $window.addEventListener('paste',pasteImage);
        SocketIoService.receive().syncClient(syncClient);
        SocketIoService.receive().updateCanvas(updateCanvas);
        SocketIoService.receive().writing(writing);
        SocketIoService.receive().moving(updateFabricObject);
        SocketIoService.receive().rotating(updateFabricObject);
        SocketIoService.receive().scaling(updateFabricObject);
        SocketIoService.receive().addObject(addObject);
        SocketIoService.receive().removeObject(removeObject);
        SocketIoService.receive().reconnect(UserService.user());

    };

    function pasteImage(event) {
        var cbData=event.clipboardData;
        for(var i=0;i<cbData.items.length;i++){
            var cbDataItem = cbData.items[i];
            var type = cbDataItem.type;
            if (type.indexOf("image")!=-1) {
                var imageData = cbDataItem.getAsFile();
                var fileReader = new FileReader();

                fileReader.onload = function(event){
                    FabricService.createImage(event.target.result, function(image){
                        self.attachListenersToFabricObject(image);
                        FabricService.canvas().add(image).renderAll();
                        var fabricObjectJson = JSON.stringify(image);
                        SocketIoService.send().addObject(fabricObjectJson);
                    });
                };
                fileReader.readAsDataURL(imageData);
            }
        }
    };

    function onKeyDownHandler(event) {
        var key;
        if (window.event) {key = window.event.keyCode;}
        else {key = event.keyCode;}


        switch (key) {
            case 67: // Ctrl+C
                if (ableToShortcut()) {
                    if (event.ctrlKey) {
                        event.preventDefault();
                        copy();
                    }
                }
                break;
            case 86: // Ctrl+V
                if (ableToShortcut()) {
                    if (event.ctrlKey) {
                        event.preventDefault();
                        paste();
                    }
                }
                break;
            case 46: //delete
                event.preventDefault();
                removeActiveObjectAndSync();
                break;
            default:
                break;
        }
    }

    function ableToShortcut() {
        /*
         TODO check all cases for this

         if($("textarea").is(":focus")){
         return false;
         }
         if($(":text").is(":focus")){
         return false;
         }
         */
        return true;
    }

    function copy() {
        /*if(FabricService.canvas().getActiveGroup()){
         for(var i in FabricService.canvas().getActiveGroup().objects){
         var object = fabric.util.object.clone(FabricService.canvas().getActiveGroup().objects[i]);
         object.set("top", object.top+5);
         object.set("left", object.left+5);
         copiedObjects[i] = object;
         }
         }
         */
        if (FabricService.canvas().getActiveObject()) {
            copiedObjects[0] = FabricService.canvas().getActiveObject();
            pastePixelsToAddComparedToOriginal = 20;
        }
    }

    function paste() {
        function correctPosition(clonedFabricObject, fabricObject) {
            clonedFabricObject.set("top", fabricObject.top + pastePixelsToAddComparedToOriginal);
            clonedFabricObject.set("left", fabricObject.left + pastePixelsToAddComparedToOriginal);
            pastePixelsToAddComparedToOriginal = pastePixelsToAddComparedToOriginal + 20;
        }

        function sendOverWire(clonedFabricObject) {
            var json = JSON.stringify(clonedFabricObject);
            SocketIoService.send().addObject(json);
        }

        if (copiedObjects.length > 0) {
            copiedObjects.forEach(function (fabricObject) {
                var clonedFabricObject = fabricObject.clone();
                correctPosition(clonedFabricObject, fabricObject);
                clonedFabricObject.objectId = Utils.guid();
                removeAllListeners(clonedFabricObject);
                self.attachListenersToFabricObject(clonedFabricObject);
                FabricService.canvas().add(clonedFabricObject);
                sendOverWire(clonedFabricObject);
            })
        }
        FabricService.canvas().renderAll();
    }

    function removeAllListeners(fabricObject) {
        fabricObject.off('moving');
        fabricObject.off('rotating');
        fabricObject.off('scaling');
        fabricObject.off('changed');
    }

    this.attachListenersToFabricObject = function (fabricObjectToAttach) {
        fabricObjectToAttach.on('moving', movingMessage);
        fabricObjectToAttach.on('rotating', rotatingObject);
        fabricObjectToAttach.on('scaling', scalingObject);

        if (fabricObjectToAttach.type === 'i-text') {
            fabricObjectToAttach.on('changed', function (event) {
                SocketIoService.send().writing({'objectId': fabricObjectToAttach.objectId, 'text': fabricObjectToAttach.text});
            });
        }
        function movingMessage(event) {
            SocketIoService.send().moving(createMessage(fabricObjectToAttach));
        }

        function rotatingObject(event) {
            SocketIoService.send().rotating(createMessage(fabricObjectToAttach));
        }

        function scalingObject(event) {
            SocketIoService.send().scaling(createMessage(fabricObjectToAttach));
        }

        function createMessage(fabricObject) {
            return {
                'objectId': fabricObject.objectId,
                'angle': fabricObject.angle,
                'originX': fabricObject.originX,
                'originY': fabricObject.originY,
                'scaleX': fabricObject.scaleX,
                'scaleY': fabricObject.scaleY,
                'left': fabricObject.left,
                'top': fabricObject.top
            };
        }
    }


    function removeActiveObjectAndSync() {
        var objectId = FabricService.removeActiveObject();
        SocketIoService.send().removeObject({objectId: objectId});
        FabricService.canvas().renderAll();
    }

    function syncClient(message) {
        SocketIoService.send().syncClient({
            clientId: message.clientId,
            canvas: JSON.stringify(FabricService.canvas())
        });
    }

    function updateCanvas(message) {
        var canvas = FabricService.canvas();
        canvas.loadFromJSON(message.canvas, canvas.renderAll.bind(canvas),
            function(fabricObject, fabricObjectClass){
                self.attachListenersToFabricObject(fabricObjectClass);
            });

    }

    function writing(message) {
        var object = FabricService.findObjectFromCanvasWith(message.objectId);
        object.text = message.text;
        FabricService.canvas().renderAll();
    }

    function updateFabricObject(message) {
        var object = FabricService.findObjectFromCanvasWith(message.objectId);
        setFabricObjectInfo(object, message);
        FabricService.canvas().renderAll();
    }

    function setFabricObjectInfo(fabricObject, message) {
        fabricObject.angle = message.angle;
        fabricObject.scaleX = message.scaleX;
        fabricObject.scaleY = message.scaleY;
        fabricObject.top = message.top;
        fabricObject.left = message.left;
        fabricObject.originX = message.originX;
        fabricObject.originY = message.originY;
    }

    function addObject(message) {
        var jsonObject = JSON.parse(message);
        fabric.util.enlivenObjects([jsonObject], function (objects) {
            objects.forEach(function (fabricObject) {
                self.attachListenersToFabricObject(fabricObject);
                FabricService.canvas().add(fabricObject);
            });
            FabricService.canvas().renderAll();
            FabricService.canvas().calcOffset();
        });
    }

    function removeObject(message) {
        FabricService.removeObject(message.objectId);
        FabricService.canvas().renderAll();
    }

}]);