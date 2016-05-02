/**
 * Created by Administrator on 2015/9/16.
 */

define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.directive('ionPercent',[function(){
        return{
            restrict:'E',
            template:'<div class="pie" data-percentage="{{progress}}"></div>',
            scope:{
                progress:'@'
            },
            link:function(scope, element, attr, controller){
                /**
                 * 进度逻辑
                 */
                var percentageDegrees = function (p) {
                    p = ( p >= 100 ? 100 : p );
                    var d = 3.6 * p;
                    return d;
                };
                var createGradient = function (elem, d) {
                    if (d <= 180) {
                        d = 90 + d;
                        elem.css('background', '-webkit-linear-gradient(90deg, #ecf0f1 50%, transparent 50%), -webkit-linear-gradient(' + d + 'deg, #e74c3c 50%, #ecf0f1 50%)');
                        elem.css('background', '-moz-linear-gradient(90deg, #ecf0f1 50%, transparent 50%), -moz-linear-gradient(' + d + 'deg, #e74c3c 50%, #ecf0f1 50%)');
                        elem.css('background', '-ms-transform-gradient(90deg, #ecf0f1 50%, transparent 50%), -moz-linear-gradient(' + d + 'deg, #e74c3c 50%, #ecf0f1 50%)');
                        elem.css('background', '-o-linear-gradient(90deg, #ecf0f1 50%, transparent 50%), -moz-linear-gradient(' + d + 'deg, #e74c3c 50%, #ecf0f1 50%)');
                    } else {
                        d = d - 90;
                        elem.css('background', '-webkit-linear-gradient(-90deg, #e74c3c 50%, transparent 50%), -webkit-linear-gradient(' + d + 'deg, #ecf0f1 50%, #e74c3c 50%)');
                        elem.css('background', '-moz-linear-gradient(-90deg, #e74c3c 50%, transparent 50%), -moz-linear-gradient(' + d + 'deg, #ecf0f1 50%, #e74c3c 50%)');
                        elem.css('background', '-ms-linear-gradient(-90deg, #e74c3c 50%, transparent 50%), -moz-linear-gradient(' + d + 'deg, #ecf0f1 50%, #e74c3c 50%)');
                        elem.css('background', '-o-linear-gradient(-90deg, #e74c3c 50%, transparent 50%), -moz-linear-gradient(' + d + 'deg, #ecf0f1 50%, #e74c3c 50%)');
                    }
                };
                scope.$watch(function(){
                    return scope.progress
                },function(nv,ov){
                    if(nv <=  100){
                        var degrees = percentageDegrees(nv);
                        createGradient(angular.element(document.querySelector('.pie')), degrees);
                    }

                });
            }
        }
    }]);
});
