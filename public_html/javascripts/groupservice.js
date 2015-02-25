'use strict';
nwmApplication.service('GroupService', ['FabricService', 'ListenerService', function (FabricService, ListenerService) {

    this.ungroup = function(activeObject){
        var objects = activeObject._objects;
        FabricService.canvas().deactivateAll();
        activeObject._restoreObjectsState();
        ListenerService.removeAllListeners(activeObject);
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
        ListenerService.attachListenersToFabricObject(group);
        FabricService.canvas().add(group);
        FabricService.canvas().renderAll();
    }
}]);