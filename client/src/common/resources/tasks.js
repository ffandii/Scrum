angular.module('resources.tasks', ['mongolabResource']);

angular.module('resources.tasks').factory('Tasks', ['mongolabResource', function(mongolabResource){

    var Tasks = mongolabResource('tasks');
    Tasks.statesEnum = ['TODO','IN_DEV','BLOCKED','IN_TEST','DONE'];  //任务进度

    Tasks.forProductBacklogItem = function(productBacklogItem){  //待办列表任务
        return Tasks.query({productBacklogItem : productBacklogItem});
    };

    Tasks.forSprint = function(sprintId){  //冲刺任务
        return Tasks.query({sprintId : sprintId});
    };

    Tasks.forUser = function(userId){  //开发人员任务
        return Tasks.query({ userId : userId });
    };

    Tasks.forProject = function(projectId){
        return Tasks.query({ projectId : projectId });
    };

    return Tasks;

}]);