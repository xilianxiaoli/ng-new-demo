define([_serverURL + 'modules/home/_module.js'], function (module) {
    module.controller('homeCtrl', ['$scope', '$timeout', 'userLogic', 'iGloab', '$ionicModal', 'downloadService', '$rootScope', '$q','$ionicHistory', function ($scope, $timeout, userLogic, iGloab, $ionicModal, downloadService, $rootScope, $q,$ionicHistory) {
            $scope.userIsOnline = false;  //用户是否在线
            $scope.isAndroid = ionic.Platform.isAndroid();  //判断平台

            $scope.toggleRightSideMenu = function () {
                iGloab.toggleRightSideMenu();
            };

            $scope.$on('workKeyComplete', function (event, data) {
                console.log("首页获取了工作密钥" + data);
                initApplogin(data);
            });

            $scope.$on('loginSuccess', function (event, currentUser) {
                console.log("收到登录");
                $scope.currentUser = currentUser;
                $scope.userIsOnline = true;
            });


            $scope.$on('logOut', function (event) {
                $scope.currentUser = {};
                $scope.userIsOnline = false;
            });


            /**
             * 首次运行下载更新
             */
            (function () {
                if(ionic.Platform.isWebView()){
                    //判断首次运行是否更新成功
                    if (localStorage['appFirstRunUpdateSuc'] == undefined) {
                        if (navigator.onLine === true) {
                            appFirstRunUpdate();
                        } else {
                            $scope.dataUpdateNewTip = true;
                        }
                    }
                }
            })();
            function appFirstRunUpdate(){
                $scope.dataUpdateNewTip = false;
                downloadService.bikeDataDownLoad().then(function () {
                    downloadService.estateDataDownLoad().then(function () {
                        console.log("首次更新完成");
                        localStorage['appFirstRunUpdateSuc'] = true;
                        $rootScope.$broadcast('downLoadSuccessFirst');
                        //记录首次更新时间
                        localStorage['dataUpdateFirstTime'] = new Date().getTime();
                    },function(){
                        $scope.dataUpdateNewTip = true;
                    });
                });
            }

            /**
             * 每隔3天提示用户下载
             */
            if (localStorage['dataUpdateFirstTime'] != undefined) {
                var dataUpdateFirstTime = localStorage['dataUpdateFirstTime'],
                    dataUpdateNowTime = new Date().getTime();
                var days = Math.floor((dataUpdateNowTime - dataUpdateFirstTime) / (24 * 3600 * 1000));
                if (days >= 5) {
                    console.log("大于5天更新");
                    var confirmUpdate = iGloab.confirmPopup('基础数据更新', '取消', '更新');
                    $scope.dataUpdateNewTip = true;   //更新
                    confirmUpdate.then(function () {
                        $scope.refreshData();
                    });
                }
            }



            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                plugins.toast.showShortCenter('网络已恢复!');
                $ionicHistory.clearCache();
                if (localStorage['dataUpdateFirstTime'] == undefined) {
                    console.log("首次网络运行更新");
                    appFirstRunUpdate();
                }
            });


            /**
             * 判断用户是否保存密码、首页初始化登录
             */
            function initApplogin(workKey) {
                if (localStorage['currentUser'] != undefined) {  //判断是否存在当前用户
                    var currentUser = JSON.parse(localStorage['currentUser']);
                    userLogic.loginReg.login(currentUser).then(function () {
                        console.log("首页登录成功");
                        $scope.currentUser = currentUser;  //绑定当前用户在线状态
                        $scope.userIsOnline = true;  //用户是否在线
                    });
                }
            }


            /**
             * 注销账号
             */
            $scope.logOut = function () {
                $scope.currentUser = {};
                $scope.userIsOnline = false;
                window.location = "#/home/userLogin";
            };


            //退出应用
            $scope.appExit = function () {
                iGloab.confirmPopup('是否退出中山通?', '取消', '退出').then(function () {
                    navigator.app.exitApp();
                });
            };


            $scope.downLoadProgress = 0;
            /**
             * 更新数据
             */
            $scope.refreshData = function () {
                if (navigator.onLine === false) {
                    plugins.toast.showShortCenter('请连接网络再重试!');
                    return;
                }
                $scope.modal.show();
                if (localStorage['downLoading'] == undefined) {
                    localStorage['downLoading'] = "downLoading";
                    /**
                     * 房屋数据下载
                     */
                    bikeDataDownLoad().then(function () {
                        $scope.estateDownLoad = true;
                        var promise2 = downloadService.estateDataDownLoad();
                        promise2.then(function () {
                            $scope.dataUpdateNewTip = false;
                            $scope.closeRefreshData();
                            if (localStorage['downLoading'] != undefined) {
                                localStorage.removeItem("downLoading");
                            }
                            $rootScope.$broadcast('downLoadSuccess');
                            $('.progress-bar').width('0%');
                            plugins.toast.showShortCenter("房屋数据更新完成");
                            $scope.estateDownLoad = false;
                            //记录下载时间
                            localStorage['dataUpdateFirstTime'] = new Date().getTime();  //开始时间
                        }, function () {
                            alert('下载失败、请重试!');
                            if (localStorage['downLoading'] != undefined) {
                                localStorage.removeItem("downLoading");
                            }
                            $scope.closeRefreshData();
                        }, function (progress) {
                            $scope.downLoadProgress = progress;
                            $('.progress-bar').width(progress + '%');
                        });
                    });
                }
                /**
                 * 自行车数据下载
                 * @returns {*}
                 */
                function bikeDataDownLoad() {
                    $scope.bikeDownLoad = true;
                    var deferred = $q.defer();
                    var promise = downloadService.bikeDataDownLoad();
                    promise.then(function () {
                        deferred.resolve();
                        $('.progress-bar').width('0%');
                        plugins.toast.showShortCenter("自行车数据更新完成");
                        $scope.bikeDownLoad = false;
                    }, function () {
                        alert('下载失败、请重试!');
                        if (localStorage['downLoading'] != undefined) {
                            localStorage.removeItem("downLoading");
                        }
                        $scope.closeRefreshData();
                    }, function (progress) {
                        $scope.downLoadProgress = progress;
                        $('.progress-bar').width(progress + '%');
                    });
                    return deferred.promise;
                }
            };

            $ionicModal.fromTemplateUrl('modules/home/templates/refreshData.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.closeRefreshData = function () {
                $scope.modal.hide();
            };

            $scope.sideGoLogin = function () {
                window.location = '#/home/userLogin';
            };
        }]
    )
});





