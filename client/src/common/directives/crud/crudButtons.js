angular.module('directives.crud.buttons', []);

angular.module('crudButtons',function(){

    return {
        restrict : 'E',
        replace : true,
        template :
            '<div>' +
                ' <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()">保存</button>  ' +
                ' <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()">撤销更改</button> ' +
                ' <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()">删除</button> ' +
            '</div>'
    };

});