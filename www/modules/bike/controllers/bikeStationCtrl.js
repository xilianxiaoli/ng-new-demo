/**
 * @function:自行车“站点”控制器
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/bike/_module.js'], function (module) {
    module.controller('bikeStationCtrl', ['$scope', '$rootScope', '$q', '$ionicPopup', '$http', 'database', '$ionicScrollDelegate', 'map', 'CONFIG', 'intDataService', '$ionicLoading','$ionicHistory', function ($scope, $rootScope, $q, $ionicPopup, $http, database, $ionicScrollDelegate, map, CONFIG, intDataService, $ionicLoading,$ionicHistory) {
        console.log('bikeStationCtrl');
        /*todo $scope扩展--------------------------------------------------*/
        $scope.range = {
            rangeName: 1000
        };
        $scope.areas = CONFIG.area;//区域数组
        $scope.areaCondition = null;//分区自行车查找条件
        $scope.areaBike = [];//分区自行车
        $scope.allStation = [];//所有自行车
        $scope.nearStationObj = {
            nearStation: [],
            nearStationArr: []
        };
        $scope.areaName = "所有站点";
        $scope.oftenStation = [];//收藏自行车
        $scope.bikeToggle = ['active', '', ''];//控制页面切换
        $scope.showNum = 0;//默认显示第一个（收藏自行车）
        $scope.tab = tab;//切换函数
        $scope.nearInfinitDown = true;//附近自行车站点的动态载入指令执行标志
        $scope.allInfinitDown = true;//所有自行车站点的动态载入指令执行标志
        $scope.areaInfinitDown = true;//区域自行车站点的动态载入指令执行标志
        $scope.initBike = initBike;//页面初始化函数
        $scope.appendNearBike = appendNearBike;//动态加载附近自行车数据
        $scope.appendAllBike = appendAllBike;//动态加载全部自行车数据
        $scope.appendAreaBike = appendAreaBike;//动态加载分区自行车数据
        $scope.tiggleOften = tiggleOften;//将车站点加为常用站点或者从中去掉
        $scope.areaChange = areaChange;//区域发生变化是执行的函数
        $scope.rangeChange = rangeChange;//距离区域发生变化是执行的函数

        $scope.multiBikeMap = multiBikeMap;//显示海量自行车点

        $scope.nearBikePageSize = 0;  //附近自行车站点总页数
        var pageIndex = 0;  //当前索引页

        var isLoopSelectSuc = true;
        /*todo 公有函数----------------------------------------------------*/
        /**
         * @function 显示海量自行车点
         */
        function multiBikeMap() {
            map.multiBikeMap().then(function (result) {
                var arrIds = [];
                if (ionic.Platform.isAndroid()) {
                    arrIds = eval("(" + result.value + ")");
                } else {
                    var re = eval("(" + result + ")");
                    var re1 = eval("(" + re.value + ")");
                    arrIds = re1;
                }
                for (var i = 0; i < arrIds.length; i++) {
                    updateBikeStation(arrIds[i], 1);
                    // 标注附近站点已经收藏
                    _addNearMarkStyle(arrIds[i]);
                }
            });
        }

        // 附近定位添加收藏
        $scope.nearAddOften = function (id, index) {
            tiggleOften(id, 1);
            $scope.nearStationObj.nearStation[index].often = 1;
            /*if ($scope.areaName = "所有站点") {
                _refreshScope(1);
            } else {
                _refreshScope(2);
            }*/

        };
        // 区域收藏标识附近收藏
        $scope.markNear = function (id) {
            _addNearMarkStyle(id);
        };

        $scope.removeNearStyle = function (id) {
            var index = $scope.nearStationObj.nearStationArr.indexOf(id);
            if (index >= 0) {
                $scope.nearStationObj.nearStation[index].often = 0;
            }
        };

        /*todo 函数调用-----------------------------------------------------*/
        $scope.$on('$ionicView.beforeEnter', function () {
            if ($rootScope.bikeNotAplly == 1) {
                initBike();
                $rootScope.bikeNotAplly = 0
            }
            // 视图view切换刷新
            var currentName = $ionicHistory.currentStateName();
            if (currentName == 'bike.station') {
                viewLoadRefresh($scope.showNum);
            }

        });
        /*todo 私有函数-----------------------------------------------------*/
        /**
         * @function 刷新scope变量
         * @param which 需要刷新的scope变量:1--allStation,2--areaStation
         * @private
         */
        function _refreshScope(which) {
            switch (which) {
                case 1:
                    return _getOftenBike()
                        .then(function () {
                            _getInitialStation($scope.allStation.length);
                            console.log('刷新全部')
                        });
                    break;
                case 2:
                    return _getOftenBike()
                        .then(function () {
                            areaChange($scope.areaCondition.address, $scope.allStation.length);
                            console.log('刷新分区')
                        });
                    break;
                default:
                    return _getOftenBike();
            }

        }

        /**
         * @function 获取附近自行车
         * @private
         */
        function _getNearBike(index) {
            $rootScope.ionLoad.show("数据加载中....");
            map.getNearbyBikeStation($scope.range.rangeName, index).then(function (res) {
                console.log(res+"-----------");
                if(res.contents.length == 0){
                    $rootScope.ionLoad.hide();
                    return;
                }
                if(isLoopSelectSuc){
                    isLoopSelectSuc = false;
                    angular.forEach(res.contents, function (e,i) {
                    console.log("我要查询的ID==="+e.bike_id);
                       database.select('bikeStation', {'id': parseInt(e.bike_id)}).then(function (data) {
                            // 判断本地是否缓存该数据
                            if(data[0]){
                                $http({
                                    method: 'POST',
                                    url: CONFIG.ONE_BIKE+'?id='+e.bike_id,
                                    timeout: 10000
                                }).success(function (re, status) {
                                    var str = re.substr(re.indexOf('=')+1);
                                    var result = eval("(" + str + ")").station[0];
                                    data[0].capacity = result.capacity;
                                    data[0].availBike = result.availBike;
                                    data[0].distance = e.distance;
                                    $scope.nearStationObj.nearStation.push(data[0]);
                                    $scope.nearStationObj.nearStationArr.push(data[0].id);
                                    //将实时的可借可停数据保存到数据库
                                    database.update('bikeStation',data[0],data[0].id);
                                    // 循环到最后一个
                                    if(i == res.contents.length - 1){
                                        pageIndex++;
                                        if (pageIndex > $scope.nearBikePageSize - 1) {
                                            plugins.toast.showShortBottom("附近站点加载完毕");
                                            console.log("数据加载完毕");
                                            $scope.nearInfinitDown = false;
                                        } else{
                                            $scope.nearInfinitDown = true;
                                        }
                                        isLoopSelectSuc = true;
                                    }
                                    $rootScope.ionLoad.hide();
                                    $scope.$broadcast('scroll.infiniteScrollComplete');
                                }).error(function (data, status) {
                                    isLoopSelectSuc = true;
                                    $rootScope.ionLoad.hide();
                                    plugins.toast.showShortCenter("附近站点加载失败！");
                                    $scope.$broadcast('scroll.infiniteScrollComplete');
                                });
                            } else{
                                isLoopSelectSuc = true;
                                $scope.$broadcast('scroll.infiniteScrollComplete');
                                $rootScope.ionLoad.hide();
                            }
                        }, function () {
                            isLoopSelectSuc = true;
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $rootScope.ionLoad.hide();
                            plugins.toast.showShortCenter("附近站点加载失败！");
                        })
                    });
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function () {
                $rootScope.ionLoad.hide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });

        }


        /**
         * @function 获取常用自行车
         * @private
         */
        function _getOftenBike() {
            return database.select('bikeStation', {often: 1}).then(function (data) {
                $scope.oftenStation = data;
            })
        }

        /**
         * @function 初始化的时候获得全部自行车里面前面10条数据，供页面显示
         * @private
         */
        function _getInitialStation(num) {
            num = num || 10;
            return database.select('bikeStation', null, 0, num).then(function (data) {
                console.log('全部自行车站点：', data.length);
                $scope.allStation = data;
            });
        }

        /**
         * @function 检测站点是否已经收藏
         * @param id 站点id
         * @returns {boolean}
         * @private
         */
        function _hasOften(id) {
            var iReturn = false;
            angular.forEach($scope.oftenStation, function (each) {
                if (each.id == id) {
                    iReturn = true;
                }
            });
            return iReturn
        }

        /**
         * @function 添加收藏和删除收藏操作
         * @param id
         * @param oftenValue
         * @param which 需要刷新的scope变量:1--allStation,2--areaStation
         * @private
         */
        function _oftenDoIt(id, oftenValue, which) {
            which = which || 3;
            var msg = oftenValue == 0 ? '删除收藏成功！' : '添加收藏成功！';
            if (oftenValue == 1 && _hasOften(id)) {
                $scope.showToast('此站点已经收藏！');
                return;
            }
            updateBikeStation(id, oftenValue, which, msg);
        }


        /**
         * @function 地图
         */
        $scope.toMap = function (data) {
            map.singleBikeMap(data).then(function (result) {
                var arrIds = [];
                if (ionic.Platform.isAndroid()) {
                    arrIds = eval("(" + result.value + ")");
                } else {
                    var re = eval("(" + result + ")");
                    var re1 = eval("(" + re.value + ")");
                    arrIds = re1;
                }
                for (var i = 0; i < arrIds.length; i++) {
                    updateBikeStation(arrIds[i], 1);
                    // 标注附近站点已经收藏
                    _addNearMarkStyle(arrIds[i]);
                }
            });
        };
        /**
         * @function 下拉刷新
         * index: 0 刷新收藏站点;1 刷新附近站点;2 刷新所有站点;3 刷新分区站点
         */
        $scope.doRefresh = function (index, area) {
            if (navigator.onLine) {
                switch (index) {
                    case 0:
                        _getOftenBike().then(function () {
                            intDataService.requestEstateBike.getRealBikesByArr($scope.oftenStation)
                        });
                        break;
                    case 1:
                        //$scope.nearInfinitDown = true;
                        rangeChange();
                        break;
                    case 2:
                        _getInitialStation().then(function () {
                            intDataService.requestEstateBike.getRealBikesByArr($scope.allStation)
                        });
                        break;
                    case 3:
                        areaChange(area).then(function () {
                            intDataService.requestEstateBike.getRealBikesByArr($scope.areaStation)
                        });
                        break;
                }
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.refreshComplete');
                plugins.toast.showShortCenter('网络已断开！');
            }
        };


        /*todo 公共函数-----------------------------------------------------*/
        /**
         * $function 视图切换
         * @param num 页面序号
         */
        var oldNum = -1;
        function tab(num) {
            $scope.showNum = num;
            $scope.bikeToggle = [];
            $scope.bikeToggle[num] = 'active';
            if(oldNum != num){
                viewLoadRefresh(num)
            }
            oldNum = num;
        }

        function viewLoadRefresh(num){
            console.log("执行刷新"+$scope.areaName);
            if(num == 2){
                if($scope.areaName == '所有站点'){
                    $scope.doRefresh(num);
                } else{
                    $scope.doRefresh(3,$scope.areaName);
                }
            } else{
                $scope.doRefresh(num);
            }
        }

        /**
         * @function 初始化自行车数据
         */
        function initBike() {
            $scope.ionLoad.show('数据加载中...');
            _getOftenBike()
                .then(function () {
                    _getInitialStation();
                })
                .then(function () {
                    //rangeChange()
                })
                .then(function () {
                    $scope.ionLoad.hide();
                });
        }

        /**
         * @function 动态加载附近自行车
         */
        function appendNearBike() {
            /* if (pageIndex > $scope.nearBikePageSize - 1) {
             plugins.toast.showShortBottom("数据加载完毕");
             $scope.nearInfinitDown = false;
             $scope.$broadcast('scroll.infiniteScrollComplete');
             } else {*/
            if (navigator.onLine) {
                if(isLoopSelectSuc){
                    console.log("下拉追加数据");
                    _getNearBike(pageIndex);
                }
            } else{
                $scope.nearInfinitDown = false;
            }

            //}
        }

        /**
         * @function 动态加载所有自行车
         */
        function appendAllBike() {
            if (!navigator.onLine) {
                plugins.toast.showShortCenter('网络已断开！');
                return;
            }
            var skip = $scope.allStation.length;
            if (skip < 10) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return
            }
            database.select('bikeStation', null, skip, 10).then(function (data) {
                if (data.length) {
                    $scope.allStation = $scope.allStation.concat(intDataService.requestEstateBike.getRealBikesByArr(data));
                    $scope.allInfinitDown = true;
                } else {
                    $scope.areaInfinitDown = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        /**
         * @function 动态加载分区自行车
         */
        function appendAreaBike() {
            if (!navigator.onLine) {
                plugins.toast.showShortCenter('网络已断开！');
                return;
            }
            var skip = $scope.areaStation.length;
            if (skip < 10) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return
            }
            database.select('bikeStation', $scope.areaCondition, skip, 10).then(function (data) {
                if (data.length) {
                    $scope.areaStation = $scope.areaStation.concat(intDataService.requestEstateBike.getRealBikesByArr(data));
                    $scope.areaInfinitDown = true;
                    console.log('全部自行车站点：', $scope.areaStation.length);
                } else {
                    $scope.areaInfinitDown = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        /**
         * @function 距离发生变化是执行的函数
         */

        // 距离发生改变
        function rangeChange() {
            console.log("距离发生改变");
            // 定位失败
            if ($rootScope.iCurrent.length == 0) {
                $scope.nearInfinitDown = false;
                return;
            }
            $scope.nearInfinitDown = false;
            $ionicScrollDelegate.$getByHandle('nearBike').scrollTop();
            $scope.nearStationObj = {
                nearStation: [],
                nearStationArr: []
            };
            pageIndex = 0;
            console.log("距离=="+$scope.range.rangeName);
            map.getNearbyBikeStation($scope.range.rangeName, 0).then(function (data) {
                $scope.nearBikePageSize = data.total % 8 == 0 ? data.total / 8 : parseInt((data.total / 8)) + 1;
                console.log("===============================================================");
                console.log("总共有" + data.total + "条数据，分成" + $scope.nearBikePageSize + "页显示");

            });
            _getNearBike(0);

        }

        /**
         * 定位失败，重新定位
         */

        $scope.reGetLocation = function () {
            $scope.locationIsOpen = true;
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner><h6>获取当前位置...</h6>'
            });
            map.getLocation().then(function (result) {
                setTimeout(function () {
                    $ionicLoading.hide();
                }, 500);
                rangeChange();
            }, function (err) {
                setTimeout(function () {
                    alert("请前往-->【设置】开启定位服务");
                    $ionicLoading.hide();
                }, 500);
                $scope.locationIsOpen = false;
            });
            setTimeout(function () {
                if ($scope.locationIsOpen) {
                    if ($rootScope.iCurrent.length == 0) {
                        alert("网络信号较差,获取当前位置失败");
                    }
                }
                $ionicLoading.hide();
            }, 5000);
        };

        /**
         * @function 区域发生变化时执行的函数
         */
        function areaChange(area, num) {
            $scope.areaName = area;
            console.log(area+"========="+num);
            num = num || 10;
            $scope.ionLoad.show('正在加载...');
            $scope.areaCondition = {address: area};
            if (area == '所有站点') {
                $scope.areaCondition = {address: null};
            }
            return database.select('bikeStation', $scope.areaCondition, 0, num).then(function (data) {
                console.log(data);
                if (data.length) {
                    $scope.areaInfinitDown = true;
                } else{
                    $scope.areaInfinitDown = false;
                }
                console.log('分区自行车站点：', data.length);
                if (area == '所有站点') {
                    $scope.allStation = data;
                } else {
                    $scope.areaStation = data;
                }
                $scope.ionLoad.hide();
                $ionicScrollDelegate.$getByHandle('areaBike').scrollTop();
            });
        }

        function updateBikeStation(id, oftenValue, which, msg) {
            if ($scope.areaName == "所有站点") {
                which = 1;
            } else {
                which = 2;
            }
            if (msg) {
                $scope.ionLoad.show('操作中...');
            }
            database.update('bikeStation', {often: oftenValue}, id)
                .then(function () {
                    setTimeout(function () {//todo fuck,perverted!，小米的数据库访问居然慢了一些，所以只能这样了。
                        _refreshScope(which).then(function () {
                            if (msg) {
                                $scope.showToast(msg);
                                $scope.ionLoad.hide();
                            }
                        })
                    }, 100)
                });
        }

        /**
         * @function 设置站点为收藏或不收藏
         * @param id 站点id
         * @param oftenValue often的值 1/0表示是否为常用站点
         * @param which 需要刷新的scope变量:1--allStation,2--areaStation
         */
        function tiggleOften(id, oftenValue, which) {
            if (oftenValue == 0) {//去掉收藏
                $scope.ionConfirm('你将从收藏中删除此站点！').then(function (res) {
                    if (res) {

                        _oftenDoIt(id, oftenValue, which);


                    }
                }, function () {
                })
            } else {//加入书藏
                _oftenDoIt(id, oftenValue, which);
            }
        }

        /**
         * 删除已收藏的标识
         * @param index
         * @private
         */
        function _addNearMarkStyle(index) {
            var indexOf = $scope.nearStationObj.nearStationArr.indexOf(index);
            if (indexOf >= 0) {
                $scope.nearStationObj.nearStation[indexOf].often = 1;
            }
        }
    }]);
});

