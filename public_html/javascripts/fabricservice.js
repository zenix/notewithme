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
                    objectId: this.objectId
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
    this.findObjects = function () {
        return canvas.getObjects();
    };
    this.selectionCreated = function (fn) {
        canvas.on('selection:created', fn);
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
}]);