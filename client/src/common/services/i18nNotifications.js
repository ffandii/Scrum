angular.module('services.i18nNotifications',['services.notifications','services.localizedMessages']);

angular.module('services.i18nNotifications').factory('i18nNotifications',['localizedMessages', 'notifications', function(localizedMessages, notifications){

    var prepareNotifications = function( msgKey, type, interpolateParams, otherProperties ){
        return angular.extend({
            message : localizedMessages.get(msgKey, interpolateParams),
            type : type
        },otherProperties);
    };

    var i18nNotifications = {
        pushSticky : function(msgKey, type, interpolateParams, otherProperties){
            return notifications.pushSticky(prepareNotifications(msgKey, type, interpolateParams, otherProperties));
        },
        pushForCurrentRoute : function(msgKey, type, interpolateParams, otherProperties){
            return notifications.pushForCurrentRoute(prepareNotifications(msgKey, type, interpolateParams, otherProperties));
        },
        pushForNextRoute : function(msgKey, type, interpolateParams, otherProperties){
            return notifications.pushForNextRoute(prepareNotifications(msgKey, type, interpolateParams, otherProperties));
        },
        getCurrent : function(){
            return notifications.getCurrent();
        },
        remove : function(notification){
            return notifications.remove(notification);
        }
    };

    return i18nNotifications;

}]);