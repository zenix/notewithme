'use strict';
nwmApplication.service('ListenerService', ['$window', 'FabricService','SocketIoService','Utils', function ($window, FabricService,SocketIoService, Utils) {
    var self = this;
    var copiedObjects = new Array();
    var pastecount = 20;
    this.bindKyboardListener = function(){
        document.onkeydown = onKeyDownHandler;
    }

    function onKeyDownHandler(event) {
        var key;
        if(window.event){ key = window.event.keyCode; }
        else{ key = event.keyCode;}

        switch(key){
            case 67: // Ctrl+C
                if(ableToShortcut()){
                    if(event.ctrlKey){
                        event.preventDefault();
                        copy();
                    }
                }
                break;
            case 86: // Ctrl+V
                if(ableToShortcut()){
                    if(event.ctrlKey){
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

    function ableToShortcut(){
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

    function copy(){
        /*if(FabricService.canvas().getActiveGroup()){
         for(var i in FabricService.canvas().getActiveGroup().objects){
         var object = fabric.util.object.clone(FabricService.canvas().getActiveGroup().objects[i]);
         object.set("top", object.top+5);
         object.set("left", object.left+5);
         copiedObjects[i] = object;
         }
         }
         */
        if(FabricService.canvas().getActiveObject()){
            copiedObjects[0] = FabricService.canvas().getActiveObject();
            pastecount = 20;
        }
    }

    function paste(){
        if(copiedObjects.length > 0){
            copiedObjects.forEach(function(fabricObject){
                var clonedFabricObject = fabricObject.clone();
                clonedFabricObject.set("top", fabricObject.top + pastecount);
                clonedFabricObject.set("left", fabricObject.left + pastecount);
                pastecount = pastecount + 20;
                clonedFabricObject.objectId = Utils.guid();
                removeAllListeners(clonedFabricObject);
                self.attachListenersToFabricObject(clonedFabricObject);
                FabricService.canvas().add(clonedFabricObject);
                var json = JSON.stringify(clonedFabricObject);
                SocketIoService.emit('addObject', json);
            })
        }
        FabricService.canvas().renderAll();
    }

    function removeAllListeners(fabricObject){
        fabricObject.off('moving');
        fabricObject.off('rotating');
        fabricObject.off('scaling');
        fabricObject.off('changed');
    }

    this.attachListenersToFabricObject = function(fabricObjectToAttach) {
        fabricObjectToAttach.on('moving', movingMessage);
        fabricObjectToAttach.on('rotating', rotatingObject);
        fabricObjectToAttach.on('scaling', scalingObject);

        if(fabricObjectToAttach.type === 'i-text' ){
            fabricObjectToAttach.on('changed', function (event) {
                SocketIoService.emit('writing', {'objectId': fabricObjectToAttach.objectId, 'text': fabricObjectToAttach.text});
            });
        }
        function movingMessage(event) {
            SocketIoService.emit('moving',createMessage(fabricObjectToAttach));
        }
        function rotatingObject(event) {
            SocketIoService.emit('rotating',createMessage(fabricObjectToAttach));
        }
        function scalingObject(event) {
            SocketIoService.emit('scaling',createMessage(fabricObjectToAttach));
        }

        function createMessage(fabricObject){
            return {'objectId': fabricObject.objectId, 'angle': fabricObject.angle, 'originX': fabricObject.originX, 'originY': fabricObject.originY, 'scaleX': fabricObject.scaleX, 'scaleY': fabricObject.scaleY, 'left': fabricObject.left, 'top': fabricObject.top};
        }
    }


    function removeActiveObjectAndSync(){
        var objectId = FabricService.removeActiveObject();
        SocketIoService.emit('removeObject', {objectId:objectId});
        FabricService.canvas().renderAll();
    }


}]);