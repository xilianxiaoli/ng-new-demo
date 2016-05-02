/*
 * 依赖：jquery
 * 功能：扳机功能
 * 示例：
 *      <hx-toggle ng-model="listType.val" ng-click="screening({type:listType.val+1})"></hx-toggle>
 * 参数：1.ng-model：扳机的数据双向绑定，必须是对象
 *      2.ng-click：扳机切换时执行事件
 * 开发者：欧渠江
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.directive('hxToggle', [function () {

        /*link函数************************************************************/
        function link(scope, element, attrs) {
            //初始化
            (function(){
                element.lastHit=$(element.children()[scope.ngModel]);
                element.lastHit.addClass('activity');

            }());
            //元素点击事件
            element.click(function(event){
                var iTarget=$(event.target);
                //激活数据
                (function(){
                    scope.$apply(
                        function(){
                            scope.ngModel=iTarget.index();
                        }
                    );
                }());
                //激活视图
                (function(){
                    element.lastHit.removeClass('activity');
                    iTarget.addClass('activity');
                    element.lastHit=iTarget;
                }());
            });

            /*指令销毁事件********************************/
            scope.$on("$destroy", function () {
                //cssToggle(0);
            });
        }


        /*返回承诺对象给angular指令编译器*/
        return {
            restrict: 'E',
            replace: true,
            scope:{
                ngModel:'='
            },
            templateUrl: 'modules/common/directives/hxToggle/hxToggle.html',
            link: link
        };


    }]);
});


