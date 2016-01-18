angular.module('resources.projects', ['mongolabResource']);

angular.module('resources.projects').factory('projects', ['mongolabResource',function(mongolabResource){

    var projects = mongolabResource('projects');  //productsOwner > scrumMater > devMember

    projects.forUser = function(userId, successcb, errorcb){
        return projects.query({},successcb,errorcb);
    };

    projects.prototype.isProductOwner = function(userId){
        return this.productOwner === userId;
    };

    projects.prototype.isScrumMaster = function(userId){
        return this.scrumMaster === userId;
    };

    projects.prototype.isDevTeamMember = function( userId ){
        return this.teamMembers.indexOf(userId) >= 0;
    };

    projects.prototype.canActAsProductOwner = function( userId ){
        return ! this.isScrumMaster(userId) && ! this.isDevTeamMember(userId);
    };

    projects.prototype.canActAsScrumMaster = function( userId ){
        return ! this.isProductOwner(userId);
    };

    projects.prototype.canActAsDevTeamMember = function( userId ){
        return ! this.isProductOwner(userId);
    };

    projects.prototype.getRoles = function( userId ){  //projects中获取当前user的角色
        var roles = [];
        if( this.isProductOwner( userId ) ){
            roles.push('PO');
        } else {
            if( this.isScrumMaster(userId) ){
                roles.push('SM');
            }
            if( this.isDevTeamMember(userId)){
                roles.push('DEV');
            }
        }
        return roles;
    };

    return projects;

}]);