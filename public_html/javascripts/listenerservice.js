'use strict';
nwmApplication.service('ListenerService', ['$window', 'FabricService', 'SocketIoService', 'Utils', 'UserService', function ($window, FabricService, SocketIoService, Utils, UserService) {
    var self = this;
    this.bindListeners = function () {
        document.onkeydown = onKeyDownHandler;
        $window.addEventListener('paste', pasteImage);
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
        var cbData = event.clipboardData;
        for (var i = 0; i < cbData.items.length; i++) {
            var cbDataItem = cbData.items[i];
            var type = cbDataItem.type;
            if (type.indexOf("image") != -1) {
                var imageData = cbDataItem.getAsFile();
                var fileReader = new FileReader();

                fileReader.onload = function (event) {
                    FabricService.createImage(event.target.result, function (image) {
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
            case 46: //delete
                event.preventDefault();
                removeActiveObjectAndSync();
                break;
            default:
                break;
        }
    }

     this.removeAllListeners = function(fabricObject) {
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
                SocketIoService.send().writing({
                    'objectId': fabricObjectToAttach.objectId,
                    'text': fabricObjectToAttach.text
                });
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
            function (fabricObject, fabricObjectClass) {
                self.attachListenersToFabricObject(fabricObjectClass);
            });
        FabricService.createTimestampToCanvas();
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