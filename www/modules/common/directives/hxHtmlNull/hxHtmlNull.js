/**
 * @function:空白内容提示指令
 * @created time：2015/08/07
 * @author：欧渠江
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.directive('hxHtmlNull', ['$rootScope','iGloab',function ($rootScope,iGloab) {
            return {
                restrict: 'A',
                scope:{
                    hxHtmlNull:'=hxHtmlNull'
            },
                link: function (scope,element,attr) {
                    $rootScope.$watch(function(){
                        return scope.hxHtmlNull
                    },function(v){
                        v=v||[];
                        if(v.length==0){
                            if(typeof attr.tip!=='undefined'&&$(element).find('.hxHtmlNull').length==0){
                                $(element).append("<div class='hxHtmlNull' style='text-align:center;height: 50%;margin-top: 20%;color: gray;font-size: 150%;'>"+attr.tip+"</div>");
                            }
                            if(typeof attr.tipGo!=='undefined'&&$(element).find('.hxHtmlNull').length==0){
                                $(element).append("<div class='hxHtmlNull' style='text-align:center;height: 50%;margin-top: 20%;color: gray;font-size: 150%;'>"+attr.tipGo+"</div>");
                                $(element).find('.hxHtmlNull').first().click(function(){
                                    location.href='#home/menu';
                                    iGloab.toggleRightSideMenu();
                                });
                            }
                        }else{
                            $(".hxHtmlNull").first().remove()
                        }
                    });
                }
            };
        }]);
});
