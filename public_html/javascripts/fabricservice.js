'use strict';
nwmApplication.service('FabricService', ['$window', 'Utils', function ($window, Utils) {
    var self = this;
    var canvas;
    this.createTimestampToCanvas = function(){
        if (!Date.now) {
           Date.now = function() { return new Date().getTime(); }
        }
        canvas.timestamp = Date.now();
    };
    this.getCanvasTimestamp = function(){
        return canvas.timestamp;
    };
    this.createCanvas = function () {
        canvas = new fabric.Canvas('mainCanvas');
        canvas.renderOnAddRemove = false;
        canvas.setWidth($window.innerWidth - 39);
        canvas.setHeight($window.innerHeight - 39);
        //canvas.selection = false;
        canvas.backgroundColor = '#ffffff';
        canvas.calcOffset();
    };
    this.pimpFabricPrototypes = function () {
        fabric.Object.prototype.toObject = (function (toObject) {
            return function () {
                return fabric.util.object.extend(toObject.call(this), {
                    objectId: this.objectId,
                    isPersistent: this.isPersistent
                });
            };
        })(fabric.Object.prototype.toObject);
    };
    this.createItext = function (options) {
        var iText = new fabric.IText('edit', {
            left: options.e.offsetX ? options.e.offsetX : options.e.layerX,
            top: options.e.offsetY ? options.e.offsetY : options.e.layerY,
            backgroundColor: '#FFFFFF',
            fill: '#000000',
            fontSize: '14',
            fontFamily: 'Arial'
        });
        iText.objectId = Utils.guid();
        return iText;
    };
    this.createRect = function (options) {
        var rect = new fabric.Rect({
            left: options.e.offsetX ? options.e.offsetX : options.e.layerX,
            top: options.e.offsetY ? options.e.offsetY : options.e.layerY,
            fill: '',
            stroke: '#000000',
            strokeWidth: 1,
            width: 50,
            height: 50
        });
        rect.objectId = Utils.guid();
        return rect;
    };
    this.createArrow = function(options){
        var path = new fabric.Path('M 0 0 L 50 0 M 0 0 L 4 -3 M 0 0 L 4 3 z', {
            left: options.e.offsetX ? options.e.offsetX : options.e.layerX,
            top: options.e.offsetY ? options.e.offsetY : options.e.layerY,
            stroke: 'black',
            strokeWidth: 1,
            fill: false
        });
        path.objectId = Utils.guid();
        return path;
    };
    this.createImage = function(url,fn){
        return new fabric.Image.fromURL(url,function(img){
            var oImg = img.set({ left: 50, top: 100, angle: 0 }).scale(0.3);
            oImg.objectId = Utils.guid();
            fn(oImg);
        });
    };
    this.createGroup = function(objectList){
        var group = new fabric.Group(objectList);
        group.objectId = Utils.guid();
        group.isPersistent = true;
        return group;
    }
    this.canvas = function () {
        return canvas;
    };
    this.findObjectFromCanvasWith = function (objectId) {
        return canvas.getObjects().filter(function (object) {
            if (object.objectId === objectId) {
                return true;
            }
            return false;
        })[0];
    };
    this.findObjectAndGroupFromAllGroups = function(objectId){
        var returnable = {'group':'', 'object': ''};
        _.forEach(self.findObjects(),function(possibleGroup){
            if(possibleGroup.type === 'group'){
                return _.forEach(possibleGroup._objects, function(objectToFind){
                    if(objectToFind.objectId == objectId){
                        returnable.group = possibleGroup;
                        returnable.object = objectToFind;
                    }
                });
            }
        });
        return returnable;

    };
    this.findObjects = function () {
        return canvas.getObjects();
    };
    this.selectionCreated = function (fn) {
        canvas.on('selection:created', fn);
    };

    this.selectionCleared = function (fn) {
        canvas.on('before:selection:cleared', fn);
    };
    this.pathCreated = function (fn) {
        canvas.on('path:created', fn);
    };
    this.mouseDown = function (fn) {
        canvas.on('mouse:down', fn);
    };
    this.removeSelectionCreated = function (fn) {
        canvas.off('selection:created');
    };
    this.removePathCreated = function (fn) {
        canvas.off('path:created');
    };
    this.removeMouseDown = function (fn) {
        canvas.off('mouse:down');
    };
    this.getActiveObjectOrGroup = function(){
        var singleObject = self.canvas().getActiveObject();
        var singleGroup = self.canvas().getActiveGroup();
        if(singleObject){
            return singleObject;
        }else if(singleGroup){
            return singleGroup;
        }else {
            return null;
        }
    }
    this.bringActiveObjectGroupUpOneLayer = function(){
        var activeObject = self.getActiveObjectOrGroup();
        if(activeObject) {
            self.canvas().bringForward(activeObject);
            return activeObject.objectId;
        }
        return "";
    };

    this.sendDownActiveObjectGroupOneLayer = function(){
        var activeObject = self.getActiveObjectOrGroup();
        if(activeObject){
            self.canvas().sendBackwards(activeObject);
            return activeObject.objectId;
        }
        return "";
    };

    this.bringUpOneLayerByObjectId = function(objectId){
        var activeObject = self.findObjectFromCanvasWith(objectId);
        if(activeObject) {
            self.canvas().bringForward(activeObject);
        }
    };

    this.sendDownOneLayerByObjectId = function(objectId){
        var activeObject = self.findObjectFromCanvasWith(objectId);
        if(activeObject){
            self.canvas().sendBackwards(activeObject);
        }
    };

    this.removeActiveObject = function(){
        var activeObject = self.canvas().getActiveObject();
        var objectId = activeObject.objectId;
        self.canvas().remove(activeObject);
        return objectId;
    };
    this.removeObject = function(objectId){
        var object = self.findObjectFromCanvasWith(objectId);
        self.canvas().remove(object);
    };

    //TODO: remove callback
    this.ungroup = function(activeObject, fn){
        var objects = activeObject._objects;
        self.canvas().deactivateAll();
        activeObject._restoreObjectsState();
        self.removeObject(activeObject.objectId);
        _.forEach(objects, function (object) {
            fn(object);
            self.canvas().add(object);
        });
        self.canvas().renderAll();
    }

    this.group = function(activeGroup){
        self.canvas().deactivateAll();
        var groupableObjects = getAndRemoveObjects(activeGroup, []);
        var group = self.createGroup(groupableObjects);
        self.canvas().add(group);
        self.canvas().renderAll();
        return group;
    }
    function getAndRemoveObjects(activeGroup, acc) {
        _.forEach(activeGroup._objects, function (object) {
            if(object.type === 'group'){
                object._restoreObjectsState();
                self.removeObject(object.objectId);
                getAndRemoveObjects(object,acc);
            }else {
                var cloneGroupableObject = object.clone();
                self.removeObject(object.objectId);
                acc.push(cloneGroupableObject);
            }
        });

        return acc;
    }
}]);