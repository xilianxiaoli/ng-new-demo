/**
 * 全局函数
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.factory("iGloab", ['$ionicHistory', 'intDataService','$ionicPopup','$q','$rootScope','$ionicSideMenuDelegate',
        function ($ionicHistory, intDataService,$ionicPopup,$q,$rootScope,$ionicSideMenuDelegate) {


            //获取工作密钥
            function getWorkKey() {
                var deferred = $q.defer();
                var promise = intDataService.getWorkKey({});
                promise.then(function (data) {
                    $rootScope.appWorkKey = data.workKey;
                    deferred.resolve(data.workKey);
                }, function () {
                    console.log("服务获取密钥失败");
                    deferred.reject();
                });
                return deferred.promise;
            }

            /**
             * 提示模态框
             * @param msg  提示文本
             * @param cancelText  取消按钮
             * @param okText  确定按钮
             * @returns promise
             */
            function confirmPopup(msg,cancelText,okText){
                var deferred = $q.defer();
                var confirmPopup = $ionicPopup.confirm({
                    title: '<strong>中山通</strong>',
                    template: '<div style="text-align: center">'+msg+'</div>',
                    cancelText: cancelText,
                    okText: okText
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        deferred.resolve();
                    } else {
                        //console.log('You are not sure');
                        deferred.reject();
                    }
                });
                return deferred.promise;
            }

            /**
             * 侧滑菜单向右切换
             */
            function toggleRightSideMenu(){
                $ionicSideMenuDelegate.toggleLeft();
            }

            /**
             * 自定义返回按钮
             */
            function goBackView(){
                var currentName = $ionicHistory.currentStateName();
                if (currentName == 'home.userInfo' ||
                    currentName == 'home.about' ||
                    currentName == 'home.userLogin') {
                    location.href = "#/home/menu";
                    toggleRightSideMenu();

                }else {
                    location.href = "#/home/menu";
                }
            }
            $rootScope.$on('$ionicView.beforeEnter', function() {
                $rootScope.hideTabs = false;
                var currentName = $ionicHistory.currentStateName();
                if (currentName == 'estate.detail' ||
                    currentName == 'bike.cardDetail' ||
                    currentName == 'bike.balanceDetail'
                ) {
                    $rootScope.hideTabs = true;
                }
            });
            return {
                //方法
                getWorkKey:getWorkKey,
                confirmPopup:confirmPopup,
                goBackView:goBackView,
                toggleRightSideMenu:toggleRightSideMenu,
            }
        }]);
});


