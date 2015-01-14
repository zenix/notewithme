'use strict';
nwmApplication.service('FabricService', ['$window','Utils',function ($window, Utils) {
    var canvas;

    this.createCanvas = function() {
        canvas = new fabric.Canvas('mainCanvas');
        canvas.setWidth($window.innerWidth);
        canvas.setHeight($window.innerHeight);
        canvas.selection = false;
        canvas.calcOffset();
    }

    this.addObjectIdToPrototype = function () {
        fabric.Object.prototype.toObject = (function (toObject) {
            return function () {
                return fabric.util.object.extend(toObject.call(this), {
                    objectId: this.objectId
                });
            };
        })(fabric.Object.prototype.toObject);
    }


    this.createItext = function(options){
        var iText = new fabric.IText('edit',{
            left: options.e.offsetX ? options.e.offsetX : options.e.layerX,
            top: options.e.offsetY ? options.e.offsetY : options.e.layerY,
            backgroundColor: '#FFFFFF',
            fill: '#000000',
            fontSize: '14',
            fontFamily: 'Arial'
        });

        iText.objectId = Utils.guid();
        return iText;
    }

    this.canvas = function(){
        return canvas;
    }

    this.findObjectFromCanvasWith = function(objectId){
        return canvas.getObjects().filter(function (object) {
            if (object.objectId === objectId) {
                return true;
            }
            return false;
        })[0];
    }
    this.findObjects = function(){
        return canvas.getObjects();
    }

    this.selectionCreated = function(fn){
        canvas.on('selection:created', fn);
    }

    this.pathCreated = function(fn){
        canvas.on('path:created', fn);
    }

    this.mouseDown =  function(fn){
        canvas.on('mouse:down', fn);
    }
}]);