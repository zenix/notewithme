'use strict';
nwmApplication.service('GroupService', ['FabricService', function (FabricService) {

    //TODO: move to FabricService
    this.ungroup = function(activeObject){
        var objects = activeObject._objects;
        FabricService.canvas().deactivateAll();
        activeObject._restoreObjectsState();
        FabricService.removeObject(activeObject.objectId);
        _.forEach(objects, function (object) {
            FabricService.canvas().add(object);
        });
        FabricService.canvas().renderAll();
    }
    this.group = function(activeGroup) {
        FabricService.canvas().deactivateAll();
        var groupableObjects = [];
        _.forEach(activeGroup._objects, function (object) {
            var cloneGroupableObject = object.clone();
            FabricService.removeObject(object.objectId);
            groupableObjects.push(cloneGroupableObject)
        });
        var group = FabricService.createGroup(groupableObjects);
        FabricService.canvas().add(group);
        FabricService.canvas().renderAll();
        return group;
    }
}]);