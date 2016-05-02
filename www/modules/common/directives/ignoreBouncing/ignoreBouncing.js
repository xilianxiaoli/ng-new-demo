/**
 * @created time：2015/08/07
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.directive('ignoreBouncing',['$ionicGesture',function($ionicGesture){
        return{
            restrict:'A',
            scope:{
                ignoreBouncing:'@'
            },
            link:function(scope, element, attr, controller){
                var gesture = scope.ignoreBouncing;
                var ionicGesture = $ionicGesture.on('drag'+gesture,function(){
                    var eventType = scope.ignoreBouncing == 'left' ? 'dragright' : 'dragleft';
                    $ionicGesture.off(ionicGesture, eventType);
                    element.css({'transform': 'translate(0px, 0px)'}).css({'-webkit-transform': 'translate(0px, 0px)'});
                },element);
            }
        }
    }]);
});
