define([
    'ionic',
    'ngCordova',
    _serverURL + 'modules/common/namespace.js',
    _serverURL + 'modules/home/namespace.js',
    _serverURL + 'modules/zsTong/namespace.js',
    _serverURL + 'modules/bus/namespace.js',
    _serverURL + 'modules/bike/namespace.js',
    _serverURL + 'modules/estate/namespace.js',
    _serverURL + 'modules/activity/namespace.js',
    _serverURL + 'modules/user/namespace.js'
], function () {
    'use strict';
    return angular.module('app', ['ionic', 'ngCordova', 'app.common', 'app.home', 'app.zsTong', 'app.bus', 'app.bike', 'app.estate', 'app.activity', 'app.user'], ['$compileProvider', '$sceProvider',function ($compileProvider, $sceProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|tel|mailto|file|cdvfile|data):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|tel|mailto|file|cdvfile|data):/);
        $sceProvider.enabled(false);
    }])
        .run(['$ionicPlatform','initBikeEstate','intDataService', 'iGloab', '$rootScope', '$ionicHistory', '$cordovaNetwork','$cordovaDevice',function ($ionicPlatform,initBikeEstate,intDataService, iGloab, $rootScope, $ionicHistory,$cordovaNetwork,$cordovaDevice) {


            $ionicPlatform.ready(function () {

                ionic.Platform.isFullScreen = true;
				$rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                plugins.toast.showShortCenter('网络已断开!');

                });

            });

            /**
             * ionic 监听返回BackButton按钮
             */
            $ionicPlatform.registerBackButtonAction(function (e) {
                if ($ionicHistory.currentStateName() == 'home.menu') {
                    if ($rootScope.backButtonPressedOnceToExit) {
                        ionic.Platform.exitApp();
                    } else {
                        showConfirm()
                    }
                    e.preventDefault();
                    return false;
                }
                else if ($ionicHistory.backView()) {
                    if($ionicHistory.currentStateName() == 'home.userLogin' && $ionicHistory.backView().stateName == "home.menu"){
                        iGloab.toggleRightSideMenu();
                    }
                    $ionicHistory.goBack();
                }
                else{
                    iGloab.goBackView();
                }
                e.preventDefault();
                return false;
            }, 101);

            function showConfirm() {
                $rootScope.backButtonPressedOnceToExit = true;
                plugins.toast.showShortCenter("再按一次退出应用");
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }

            /**
             * 监听菜单键
             */
            document.addEventListener("menubutton", function () {
                if ($ionicHistory.currentStateName() == 'home.menu') {
                    iGloab.toggleRightSideMenu();
                }
            }, false);

            /**
             * cordova 重写Alert
             */
            if(ionic.Platform.isWebView()){
                window.alert = function(msg) {
                    navigator.notification.alert(
                        msg,  // message
                        null,         // callback
                        '中山通',            // title
                        '确定'                  // buttonName
                    );
                };
            }

        }])
        .config(['$stateProvider', '$urlRouterProvider','$ionicConfigProvider','$httpProvider', function ($stateProvider, $urlRouterProvider,$ionicConfigProvider,$httpProvider) {//配置路由
            $stateProvider
                //缺省页面
                .state('home', {
                    url: "/home",
                    abstract: true,
                    templateUrl:  _serverURL + "modules/home/home.html",
                    controller: 'homeCtrl'
                })
                .state('home.menu', {
                    url: '/menu',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/home/templates/menu.html',
                            controller: 'menuCtrl'
                        }
                    }

                })

                .state('home.about', {
                    url: '/about',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/home/templates/about.html',
                            controller: 'menuCtrl'
                        }
                    }

                })

                //中山通服务
                .state('zsTong', {
                    url: '/zsTong',
                    abstract: true,
                    templateUrl:  _serverURL + "modules/zsTong/zsTong.html",
                    controller: 'zsTongCtrl'
                })
                .state('zsTong.website', {
                    url: '/website',
                    views: {
                        'zsTong-website': {
                            templateUrl:  _serverURL + 'modules/zsTong/templates/website.html',
                            controller: 'zsTongCtrl'

                        }
                    }
                })
                /*.state('zsTong.mapShow', {
                    url: '/mapShow/:stationType/:stationIdx',
                    views: {
                        'zsTong-website': {
                            templateUrl: 'modules/zsTong/templates/mapShow.html',
                            //controller: 'mapShowCtrl'
                        }
                    }
                })
                .state('zsTong.notice', {
                    url: '/notice',
                    views: {
                        'zsTong-notice': {
                            templateUrl: 'modules/zsTong/templates/notice.html',
                            //controller: 'noticeCtrl'
                        }
                    }
                })
                .state('zsTong.noticeDetail', {
                    url: '/noticeDetail/:noticeId',
                    views: {
                        'zsTong-notice': {
                            templateUrl: 'modules/zsTong/templates/noticeDetail.html',
                            //controller: 'noticeDetailCtrl'
                        }
                    }
                })
                .state('zsTong.serviceGuide', {
                    url: '/guide',
                    views: {
                        'zsTong-guide': {
                            templateUrl: 'modules/zsTong/templates/guide.html',
                            controller: 'guideCtrl'
                        }
                    }
                })
                .state('zsTong.guideDetail', {
                    url: '/guideDetail/:guideId',
                    views: {
                        'zsTong-guide': {
                            templateUrl: 'modules/zsTong/templates/guideDetail.html',
                            controller: 'guideDetailCtrl'
                        }
                    }
                })*/

                //-----------公交服务
                .state('bus', {
                    url: '/bus',
                    abstract: true,
                    templateUrl:  _serverURL + "modules/bus/bus.html",
                    controller: 'busCtrl'
                })
                //-----------公交服务(换乘)
                .state('bus.transfer', {
                    url: '/transfer',
                    views: {
                        'bus-transfer': {
                            templateUrl:  _serverURL + 'modules/bus/templates/transfer.html',
                            controller: 'busCtrl'
                        }
                    }
                })
                //-----------公交服务(线路)
                /*.state('bus.line', {
                    url: '/line',
                    views: {
                        'bus-line': {
                            templateUrl: 'modules/bus/templates/line.html',
                            controller: 'lineCtrl'
                        }
                    }
                })
                .state('bus.line-detail', {
                    url: '/line-detail/:lineId',
                    views: {
                        'bus-line': {
                            templateUrl: 'modules/bus/templates/line-detail.html',
                            controller: 'line-detailCtrl'
                        }
                    }
                })
                .state('bus.line-all', {
                    url: '/line-all',
                    views: {
                        'bus-line': {
                            templateUrl: 'modules/bus/templates/line-all.html',
                            controller: 'lineCtrl'
                        }
                    }
                })
                //-----------公交服务(站点)
                .state('bus.station', {
                    url: '/station',
                    views: {
                        'bus-station': {
                            templateUrl: 'modules/bus/templates/station.html',
                            controller: 'stationCtrl'
                        }
                    }
                })
                .state('bus.station-line', {
                    url: '/station-line',
                    views: {
                        'bus-station': {
                            templateUrl: 'modules/bus/templates/station-line.html',
                            controller: 'stationCtrl'
                        }
                    }
                })
                .state('bus.station-detail', {
                    url: '/station-detail',
                    views: {
                        'bus-station': {
                            templateUrl: 'modules/bus/templates/station-detail.html',
                            controller: 'stationCtrl'
                        }
                    }
                })

                .state('bus.transfer-map', {
                    url: '/transfer-map',
                    views: {
                        'bus-transfer': {
                            templateUrl: 'modules/bus/templates/transfer-map.html',
                            controller: 'transferCtr'
                        }
                    }
                })
                .state('bus.choose-position', {
                    url: '/choose-position',
                    views: {
                        'bus-transfer': {
                            templateUrl: 'modules/bus/templates/choose-position.html',
                            controller: 'transferCtr'
                        }
                    }
                })
                //-----------公交服务(更多)
                .state('bus.more', {
                    url: '/more',
                    views: {
                        'bus-more': {
                            templateUrl: 'modules/bus/templates/more.html'
                            //controller: 'busCtrl'
                        }
                    }
                })*/
                //自行车服务
                .state('bike', {
                    url: '/bike',
                    abstract: true,
                    templateUrl:  _serverURL + 'modules/bike/bike.html',
                    controller: 'bikeStationCtrl'

                })
                .state('bike.station', {
                    url: '/station',
                    views: {
                        'bike-station': {
                            templateUrl:  _serverURL + 'modules/bike/templates/station.html'
                            //controller: 'bikeStationCtrl'
                        }
                    }
                })
                .state('bike.card', {
                    url: '/card',
                    views: {
                        'bike-card': {
                            templateUrl:  _serverURL + 'modules/bike/templates/card.html',
                            controller: 'bikeCardCtrl'
                        }
                    }
                })
                .state('bike.cardDetail', {
                    url: '/cardDetail',
                    views: {
                        'bike-card': {
                            templateUrl:  _serverURL + 'modules/bike/templates/cardDetail.html',
                            controller: 'bikeCardCtrl'
                        }
                    }
                })
                .state('bike.balanceDetail', {
                    url: '/balanceDetail',
                    views: {
                        'bike-card': {
                            templateUrl:  _serverURL + 'modules/bike/templates/balanceDetails.html',
                            controller: 'bikeCardCtrl'
                        }
                    }
                })
                .state('bike.guide', {
                    url: '/guide',
                    views: {
                        'bike-guide': {
                            templateUrl:  _serverURL + 'modules/bike/templates/guide.html'
                        }
                    }
                })
                //物业租售
                .state('estate', {
                    url: '/estate',
                    abstract: true,
                    templateUrl:  _serverURL + 'modules/estate/estate.html',
                    controller: 'estateCtrl'

                })
                .state('estate.whole', {
                    url: '/whole',
                    views: {
                        'estate-whole': {
                            templateUrl:  _serverURL + 'modules/estate/templates/whole.html',
                            controller: 'wholeCtrl'
                        }
                    }
                })
                .state('estate.near', {
                    url: '/near',
                    views: {
                        'estate-near': {
                            templateUrl:  _serverURL + 'modules/estate/templates/near.html',
                            controller: 'nearCtrl'
                        }
                    }
                })
                .state('estate.detail', {
                    url: '/detail/:houseId/:type',
                    views: {
                        'estate-detail': {
                            templateUrl:  _serverURL + 'modules/estate/templates/detail.html',
                            controller: 'detailCtrl'
                        }
                    }
                })
                //定向越野
                .state('home.activityHome', {
                    url: '/activityHome',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/activity/templates/home.html',
                            controller: 'aHomeCtrl'
                        }
                    }

                })
                .state('home.activityDetail', {
                    url: '/activityDetail/:mapId',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/activity/templates/detail.html',
                            controller: 'aHomeCtrl'
                        }
                    }

                }).state('home.activityMap', {
                    url: '/activityMap',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/activity/templates/showMap.html',
                            controller: 'aHomeCtrl'
                        }
                    }

                })
                .state('home.activityStart', {
                    url: '/activityStart/:newActivity',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/activity/templates/start.html',
                            controller: 'aStartCtrl'
                        }
                    }

                })

            /** 用户模块 **/
                //登录
                .state('home.userLogin', {
                    url: '/userLogin',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/login.html',
                            controller: 'login-registerCtrl'
                        }
                    }

                })
                //忘记密码
                .state('home.setNewPassword', {
                    url: '/setNewPassword',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/setNewPassword.html',
                            controller: 'login-registerCtrl'
                        }
                    }
                })
                //注册步骤一
                .state('home.userReg', {
                    url: '/userReg',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/register.html',
                            controller: 'login-registerCtrl'
                        }
                    }

                })
                .state('home.userReg2', {
                    url: '/userReg2/:phone',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/msgValidate.html',
                            controller: 'login-registerCtrl'
                        }
                    }

                })
                .state('home.userReg3', {
                    url: '/userReg3',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/validateSuc.html',
                            controller: 'login-registerCtrl'
                        }
                    }
                })
                .state('home.userInfo', {
                    url: '/userInfo',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/userInfo.html',
                            controller: 'userCtrl'
                        }
                    }

                })

                .state('home.activityResults', {
                    url: '/activityResults',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/activityResults.html',
                            controller: 'userCtrl'
                        }
                    }

                })
                .state('home.scoreDetail', {
                    url: '/scoreDetail/:beginDate/:endDate',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/scoreDetail.html',
                            controller: 'userCtrl'
                        }
                    }
                })
                .state('home.ranking', {
                    url: '/ranking/:id/:competype',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/ranking.html',
                            controller: 'userCtrl'
                        }
                    }
                })
                .state('home.ranking1', {
                    url: '/ranking1/:id/:competype',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/ranking1.html',
                            controller: 'userCtrl'
                        }
                    }
                })
                .state('home.alterInfo', {
                    url: '/alterInfo',
                    views: {
                        'menuContent': {
                            templateUrl:  _serverURL + 'modules/user/templates/alterInfo.html',
                            controller: 'userCtrl'
                        }
                    }
                });
            $urlRouterProvider.otherwise('/home/menu');
            $ionicConfigProvider.views.swipeBackEnabled(false); //禁用ios独特手势返回功能
            $ionicConfigProvider.tabs.position('bottom'); //ios 默认在底部、android默认在顶部
            $ionicConfigProvider.tabs.style('standard');
            $ionicConfigProvider.navBar.alignTitle('center'); //ios 默认居中、android默认左边
            $ionicConfigProvider.backButton.text('').icon('ion-reply').previousTitleText(false);
        }])
        .constant("CONFIG", {
            activityUserServerUrl:"http://218.204.174.24:8052/ZST/orienteering/",    //定向越野，用户接口服务地址
            bikeDataFileUrl:"http://220.231.153.66:8009/SmartExchangeG/zstData/bicyclexy.json",  // 自行车数据下载地址
            houseDataFileUrl:"http://220.231.153.66:8009/SmartExchangeG/zstData/housexy.json",  // 房屋数据下载地址
            appDownLoadUrl_android:"http://220.231.153.66:8009/SmartExchangeG/zstData/com.hxsmart.zhongSTapp.apk",  // 安卓版app下载地址
            appDownLoadUrl_ios:"http://fir.im/zstapp",   // ios app下载地址
            getNearbyBikeData:"http://api.map.baidu.com/geosearch/v3/nearby",   //获取附近自行车数据接口地址
            appUpdateUrl:"http://220.231.153.66:8009/SmartExchangeG/webresources/version/GetAppVersion",  // app监测更新接口
            area:[
                '石岐区',
                '坦洲镇',
                '东区',
                '港口镇',
                '火炬区',
                '三角镇',
                '西区',
                '横栏镇',
                '南区',
                '南头镇',
                '小榄镇',
                '阜沙镇',
                '黄圃镇',
                '南朗镇',
                '民众镇',
                '三乡镇',
                '东凤镇',
                '板芙镇',
                '东升镇',
                '大涌镇',
                '古镇镇',
                '神湾镇',
                '沙溪镇',
                '五桂山镇'
            ],   // 分区常量数组
            ONE_BIKE:"http://www.zhongshantong.net/zsbicycle/zsmap/ibikestation.asp",//单辆自行车数据服务地址
            BORROW_URL: "http://192.168.169.217:8009/SmartExchange/lendRecordIbik1",   //借车记录数据服务地址
            Balance_URL :"http://192.168.169.217:8009/SmartExchange/overageRecord1" , //余额查询
            zipFileDownloadUrl:"http://192.168.160.248:8891/www.zip"
        });
});
