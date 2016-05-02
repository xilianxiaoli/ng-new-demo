/*
 * 依赖：jquery
 * 功能：头部菜单
 * 用法：
 *      <h-menu ng-model="menuData"></h-menu>
 * 参数：1.menuData(必选)：菜单所需的数据模型，（数组类型）
 *      2.order(必选)：在数据模型里要在菜单里用到的元素的下表，有先后顺序
 *      3.ng-model(必选):菜单将加工好的数据放入这里
 *      4.hx-backCall(必选):数据加工完成后，需要执行的函数
 * 说明：
 *      1.只支持一级菜单，若后续需要，可以升级2级或无穷
 * 开发者：欧渠江
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.directive('hMenu', ['$rootScope','$ionicScrollDelegate', '$ionicPlatform','$timeout', function ($rootScope,$ionicScrollDelegate, $ionicPlatform,$timeout) {
        var scrollTop = function () {//功能：让ion-scroll滑动到顶部
                $ionicScrollDelegate.$getByHandle('firstMenu').scrollTop(true);
                $ionicScrollDelegate.$getByHandle('moreFirstMenu').scrollTop(true);
                $ionicScrollDelegate.$getByHandle('moreSecondMenu').scrollTop(true);
            };

        //功能：绑定指令之外的点击事件
        $(document.body).click(function (event) {
            var mask = $('#hMenuMask'),
                isMenu = $(event.target).parents('.hMenu').length,
                hMenu = $('.hMenu');
            if (!isMenu) {
                mask.remove();
                hMenu.children().not('ul').hide();
                hMenu.find('.activity').removeClass('activity');
                //todo 恢复ionic的硬件返回按钮效果
                //$ionicPlatform.$backButtonActions = backButtonActions;
                //backButtonActions = null;
            }

        });
        /**
         * @function 编译函数
         * @param tElement
         * @param tAttrs
         * @returns {{pre: Function, post: Function}}
         */
        function compile(tElement, tAttrs) {

            return {
                pre: function (scope, element, attrs) {


                },
                post: function (scope, element, attrs) {
                    /*初始化**************************************/
                    (function () {
                        //变量声明
                        scope.btnOrder=eval(scope.btnOrder);
                        scope.btnNum=Number(scope.btnNum);
                        scope.maskIsShown = false;
                        scope.englishName='';
                        scope.returnObj =scope.ngInit;//h-menu指令返回对象
                        element.hMenuMask = null;//用于存放遮罩层（div,jquery）
                        element.lastHitMainButton = null;//鼠标上一次点击过的主按钮（li，jquery）
                        element.lastHitMoreFirstMenuButton = null;//鼠标上一次点击过的更多下一级菜单按钮（li,jquery）
                        element.mainButtons = element.children('ul');//主菜单包裹层(ul,jquery)
                        element.firstMenu = element.children('ion-scroll:first');//一级菜单包裹层(ion-scroll,jquery)
                        element.moreFirstMenu = element.children('ion-scroll:last');//更多下一级菜单包裹层(ion-scroll,jquery)
                        element.moreSecondMenu = element.children('div');//更多下二级菜单包裹层(ion-scroll,jquery)
                        //初始化主菜单的按钮的数据模型
                        (function () {
                            var menuData = scope.ngModel || (function () {
                                    throw '“h-Menu1”指令的“menuData”属性不存在或者为空，请修改!'
                                }());
                            var arr = scope.btnOrder, arrStr = [];
                            (function () {
                                for (var i = 0, len = arr.length; i < len; i++) {
                                    if (arr[i] === '' && typeof arr[i] === 'undefined') {
                                        break
                                    }
                                    arrStr.push(menuData[arr[i]]);
                                }
                                menuData = arrStr;
                            }());
                            scope.showMenuData = menuData.slice(0, scope.btnNum);//需要显示的菜单按钮数据
                            scope.hideMenuData = menuData.slice(scope.btnNum);//在更多里面显示的菜单按钮数据
                        }());
                    }());

                    //函数广播声明
                    scope.broadContent = function () {
                        scope.$emit('hMenuData',scope.returnObj);
                    };

                    //菜单主按钮点击事件
                    element.mainButtons.click(function (event) {
                        var iTarget = $(event.target).parents('li'),//被鼠标点击对的Jquery对象
                            son = iTarget.data('son'),//子菜单数据模型
                            isMore = !!iTarget.data('more');//是否是按钮“更多”
                        //console.log(son);
                        if (!iTarget.is('li')) {
                            return
                        }
                        //激活数据
                        (function () {
                            scope.$apply(function () {
                                if (!isMore) {//不是“更多”按钮
                                    scope.firstMenu = son.include;
                                    scope.suffix=son.suffix;//后缀
                                    scope.englishName=son.englishName;
                                    //console.log(scope.suffix);
                                } else {//是“更多”按钮
                                    scope.moreFirstMenu = son;
                                    //console.log(scope.moreFirstMenu)
                                }
                            });
                        }());
                        //激活视图
                        (function () {
                            scrollTop();
                            //添加遮罩
                            $('#hMenuMask').remove();
                            $(document.body).delay(200).append('<div id="hMenuMask"></div>');
                            element.hMenuMask = $('#hMenuMask');
                            var top   = ionic.Platform.isIOS() ? 106 : 86;
                            element.hMenuMask.css("top",top+300);
                            element.hMenuMask.hide().delay(200).fadeIn(200);

                            //改变本次点击的主菜单视图
                            (function () {
                                (element.lastHitMainButton ? (function () {
                                    element.lastHitMainButton.removeClass('activity')
                                }()) : null);
                                iTarget.addClass('activity');
                                element.lastHitMainButton = iTarget;
                            }());
                            //改变一级菜单视图
                            (function () {
                                if (!isMore) {//不是“更多”按钮
                                    //console.log('显示一次')
                                    element.moreFirstMenu.hide();
                                    element.moreSecondMenu.hide();
                                    element.firstMenu.hide().delay(200).fadeIn(200);

                                } else {//是“更多”按钮
                                    element.firstMenu.hide();
                                    element.moreSecondMenu.hide();
                                    element.moreFirstMenu.delay(200).hide().fadeIn(200);
                                }
                            }());

                        }());

                    });

                    //一级菜单按钮点击事件
                    element.firstMenu.click(function (event) {
                        var iTarget = $(event.target);
                        if (!iTarget.is('li')) {
                            return
                        }
                        //激活数据
                        (function () {
                            //todo  设置输出格式----------------------
                            //var tObj={
                            //    range:iTarget.data('value'),
                            //    chineseName:element.lastHitMainButton.find('b').html(),
                            //    englishName:scope.englishName
                            //};

                            scope.returnObj[scope.englishName]={
                                englishName:scope.englishName,
                                chineseName:element.lastHitMainButton.find('b').html(),
                                suffix:scope.suffix,
                                range:iTarget.data('value')
                            };

                            //scope.returnObj.push(tObj);
                            //scope.returnObj[element.lastHitMainButton.index()] = {
                                //name: element.lastHitMainButton.find('b').html(),
                                //condition: [scope.englishName, iTarget.data('value')]
                            //};
                            scope.englishName = '';
                            scope.suffix = '';
                            scope.broadContent();
                        }());
                        //激活视图
                        (function () {
                            element.firstMenu.hide();
                            //if (iTarget.data('value') !== '不限') {
                            //    element.lastHitMainButton.find('b').html(iTarget.data('value'));
                            //} else {
                            //    element.lastHitMainButton.find('b').html(scope.returnObj[element.lastHitMainButton.index()].name);
                            //}
                            element.lastHitMainButton.removeClass('activity');
                            element.lastHitMainButton = null;
                            (element.hMenuMask !== null ? (function () {
                                element.hMenuMask.remove();
                            }()) : null);
                        }());
                    });

                    //更多下“一级菜单”和“筛选按钮”点击事件
                    element.moreFirstMenu.click(function (event) {
                        var iTarget = (!$(event.target).is('li') && !$(event.target).is('button')) ? $(event.target).parents('li') : $(event.target);
                        switch (true) {
                            case iTarget.is('li')://一级菜单点击事件
                                //激活数据
                                (function () {
                                    var son = iTarget.data('son');
                                    scope.$apply(function () {
                                        scope.moreSecondMenu = son.include;
                                        scope.suffix = son.suffix;
                                        scope.englishName=son.englishName;
                                        //console.log(scope.suffix);
                                    });
                                    element.lastHitMoreFirstMenuButton = iTarget;
                                }());

                                //激活视图
                                (function () {
                                    scrollTop();
                                    element.moreSecondMenu.hide().fadeIn();
                                  //  element.moreSecondMenu.slideToggle(30);
                                }());

                                break;
                            case iTarget.is('button')://筛选按钮点击事件
                                //激活数据
                                (function () {
                                    if (element.lastHitMainButton.index() == scope.btnNum) {
                                        var lis = iTarget.siblings().children();
                                        lis.each(function (data) {
                                            //todo 设置输出格式----------------------
                                            //scope.englishName=$(lis[data]).data('son').englishName;
                                            //var tObj={
                                            //    range:$(lis[data]).find('span').html(),
                                            //    chineseName:$(lis[data]).find('i').html(),
                                            //    englishName:$(lis[data]).data('son').englishName
                                            //};
                                            //scope.returnObj.push(tObj);
                                            //
                                            //预防空数据
                                            if($(lis[data]).find('span').slice(1,2).html() !=''){
                                                scope.returnObj[$(lis[data]).data('son').englishName]={
                                                    englishName:$(lis[data]).data('son').englishName,
                                                    chineseName:$(lis[data]).find('i').html(),
                                                    suffix:$(lis[data]).data('son').suffix,
                                                    range:$(lis[data]).find('span').slice(1,2).html()
                                                };
                                            }
                                            //scope.returnObj[element.lastHitMainButton.index() + data] = {
                                                //name:$(lis[data]).find('i').html(),
                                                //condition:[scope.englishName,$(lis[data]).find('span').html()]
                                            //};
                                        });
                                    }
                                    scope.broadContent();
                                }());
                                //激活视图
                                (function () {
                                    element.moreFirstMenu.hide();
                                    element.lastHitMainButton.removeClass('activity');
                                    element.lastHitMainButton = null;
                                    (element.hMenuMask !== null ? (function () {
                                        element.hMenuMask.remove()
                                    }()) : null);
                                }());
                                break;
                            default:
                                return
                        }
                    });

                    //更多下二级菜单点击事件
                    element.moreSecondMenu.click(function () {
                        var iTarget = $(event.target),
                            iHtml={};
                        switch (true) {
                            case iTarget.is('li'):
                                //激活数据
                                (function () {
                                    iHtml = iTarget.data('value');
                                }());
                                //激活视图
                                (function () {
                                    element.lastHitMoreFirstMenuButton.children('span').slice(1,2).html(iHtml);
                                    element.moreSecondMenu.hide();
                                }());
                                break;
                            case iTarget.is('button'):
                                element.moreSecondMenu.hide();
                                break;
                            default:
                                return
                        }
                    });
                    //指令销毁事件
                    scope.$on("$destroy", function () {
                        (element.hMenuMask !== null ? (function () {
                            element.hMenuMask.remove()
                        }()) : null);
                    });
                    //android硬件返回按钮事件
                    $ionicPlatform.onHardwareBackButton(function () {
                        var hm = $('#hMenuMask');
                        if (hm.length !== 0) {
                            element.firstMenu.hide();
                            element.moreFirstMenu.hide();
                            element.moreSecondMenu.hide();
                            if (element.lastHitMainButton !== null) {
                                element.lastHitMainButton.removeClass('activity');
                            }
                            element.lastHitMainButton = null;
                            hm.remove();
                        }
                    });
                }
            }
        }


        /*返回承诺对象给angular指令编译器*/
        return {
            restrict: 'E',
            replace: 'true',
            scope: {
                ngModel: '=',
                ngInit: '=',
                btnOrder:'@',
                btnNum:'@'
            },
            templateUrl: 'modules/common/directives/hMenu/hMenu.html',
            compile: compile
        };
    }]);
});


