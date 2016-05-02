/**
 * 定向越野业务逻辑服务
 */
define([_serverURL + 'modules/activity/_module.js'], function (module) {
    module.factory('activityLogic', ['$q', 'intDataService', '$cordovaDevice', 'iGloab', function ($q, intDataService, $cordovaDevice, iGloab) {
        function Activity() {
        }

        // 地图详细信息
        var cacheMapDetailInfo = {
            mapUrl: '',
            line: {
                lineArray: [],
                lineObj: {}
            }
        };
        // 继续活动信息
        var continueAcInfo = {
            nextNode: "",
            percent: "",
            userLine: ""
        };

        /**
         * 定向越野首页获取地图相关数据
         * @returns promise
         */
        Activity.prototype.getMapListInfo = function () {
            var deferred = $q.defer(),
                mapListPromise = intDataService.getMapList({}),
                messagePromise = intDataService.getMessage({}),
                result = {};
            mapListPromise.then(function (data, status) {
                result.mapListInfo = data.data;
                messagePromise.then(function (data) {
                    // 越野点(br标签替换 /r/n 换行)
                    result.location = data.location.replace(/\r\n/ig, "<br/>");
                    // 规则玩法
                    result.rule = data.rule.replace(/\r\n/ig, "<br/>");
                    deferred.resolve(result);
                }, function () {
                    deferred.reject();
                });
            }, function (data, status) {
                deferred.reject();
            });
            return deferred.promise;
        };


        /**
         * 获取越野地图详细信息
         * @param id  id标识
         * @returns promise
         */
        Activity.prototype.getMapListDetailInfo = function (id) {
            var deferred = $q.defer(),
                mapListDetailPromise = intDataService.getMapList({
                    mapId: id
                }),
                result = {};
            mapListDetailPromise.then(function (data, status) {
                var serPar = data.data[0];
                result.addr = serPar.mapLocation;                   // 地点
                result.mapLearning = serPar.mapLearning;            // 活动口号
                result.mapUrl = serPar.mapUrl;                      //地图图片地址
                result.mapIntroduction = serPar.mapIntroduction;    //地图文字描述
                result.lineNoList = _strParse(serPar.lineOrder);
                // 对象存储地图信息
                cacheMapDetailInfo.line.lineObj = _strParse(serPar.lineOrder);
                cacheMapDetailInfo.line.lineArray = serPar.lineOrder.split(',');
                cacheMapDetailInfo.mapUrl = serPar.mapUrl;
                deferred.resolve(result);

            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        };


        /**
         * 进入活动
         * @param phone 用户
         * @param mapId 地图ID
         * @param activityType 模式
         */
        Activity.prototype.goToActivity = function (phone, mapId,activityType) {
            // 检查是否有未完成的活动
            _checkUnfinishedActivity(phone).then(function (result) {
                console.log("继续活动");
                continueAcInfo.nextNode = result.nextNode;
                continueAcInfo.percent = result.percent;
                continueAcInfo.userLine = result.userLine;
                _continueActivity(result, phone);
            }, function () {
                console.log("开始新的活动");
                iGloab.confirmPopup('是否进入越野活动?', '取消', '开启').then(function () {
                    _startActivity(phone, mapId,activityType)
                });
            }, function () {
                console.log("上一次活动已失效");
                iGloab.confirmPopup('上一次活动已失效,是否开启新的活动?', '取消', '开启').then(function () {
                    _startActivity(phone, mapId,activityType)
                });
            });
        };

        /**
         * 完成本次定向越野活动
         * @param phone  用户
         * @returns {*}
         */
        Activity.prototype.endActivity = function (phone) {
            var deferred = $q.defer();
            iGloab.confirmPopup('是否结束活动?', '结束', '继续').then(function () {
            }, function () {
                _activityComplete(phone).then(function () {
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });
            });
            return deferred.promise;
        };



        function differenceTime(startT) {
            var resultTime = {
                    hour: "",
                    min: "",
                    sec: ""

                },
                timeDifference = new Date().getTime() - startT,
            //计算出相差天数
                days = Math.floor(timeDifference / (24 * 3600 * 1000)),

            //计算出小时数
                leave1 = timeDifference % (24 * 3600 * 1000),
                hours = Math.floor(leave1 / (3600 * 1000)),


            //计算相差分钟数
                leave2 = leave1 % (3600 * 1000),
                minutes = Math.floor(leave2 / (60 * 1000)),

            //计算相差秒数
                leave3 = leave2 % (60 * 1000),
                seconds = Math.round(leave3 / 1000);
            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            resultTime.hour = hours;
            resultTime.min = minutes;
            resultTime.sec = seconds;
            return resultTime;
        }

        Activity.prototype.recordUpload = function (phone) {
            var deferred = $q.defer();
            _barcodeScannerStation().then(function (scanResult) {
                intDataService.barcodeUpload({
                    phone: phone,
                    id: scanResult
                }).then(function (re) {
                    console.log(re);
                    switch (re.result) {
                        case '01':
                            deferred.resolve(re);
                            break;
                        case '04':
                            plugins.toast.showShortCenter('该站点暂未开通');
                            break;
                        case '12':
                            plugins.toast.showShortCenter('已到达该站点');
                            break;
                        case '13':
                            plugins.toast.showShortCenter('清空之前未按照顺序的点');
                            deferred.reject(re);
                            break;
                        case '55':
                            plugins.toast.showShortCenter('二维码信息识别失败');
                            break;
                        case '56':
                            plugins.toast.showShortCenter('该站点暂未开通');
                            break;
                        default :
                            plugins.toast.showShortCenter('无法识别的二维码信息');
                            break;
                    }
                })
            });
            return deferred.promise;
        };


        /**
         * 扫描二维码
         */
        function _barcodeScannerStation() {
            var deferred = $q.defer();
            cordova.plugins.hxBarcodeScanner.scan(
                function (result) {
                    var scanResult = typeof result == "object" ? result : scanResult = eval("(" + result + ")");
                    if (parseInt(scanResult.cancelled)) {
                        return;
                    }
                    deferred.resolve(scanResult.text);
                }, function (error) {
                    alert("扫描失败!");
                }
            );
            return deferred.promise;
        }

        /**
         *  完成本次定向越野活动
         * @param phone
         * @returns {*}
         * @private
         */
        function _activityComplete(phone) {
            var deferred = $q.defer();
            intDataService.activityComplete({
                phone: phone
            }).then(function (re) {
                if (re.result == "01") {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });
            return deferred.promise;
        }

        /**
         * 检查是否有未完成的活动
         * @param phone   用户
         * @returns {*}  promise
         * @private
         */
        function _checkUnfinishedActivity(phone) {
            var deferred = $q.defer(),
                continueEventPrise = intDataService.activityContinueEvent({
                        phone: phone
                    }
                );
            continueEventPrise.then(function (result) {
                switch (result.result) {
                    case '01':  //有未完成的活动
                        deferred.resolve(result);
                        break;
                    case '32':  // 没有记录
                        deferred.reject();
                        break;
                    case '33':  // 上一次活动超时失效
                        deferred.notify();
                        break
                }
            });
            return deferred.promise;
        }

        /**
         * 继续上一次活动
         * @param result  上一次活动的信息
         * @param phone   用户
         * @private
         */
        var continueActivity = false;

        function _continueActivity(result, phone) {
            iGloab.confirmPopup('上次有未完成的活动,是否继续?', '结束', '继续').then(function () {
                continueActivity = true;
                new Activity().getMapListDetailInfo(result.mapId).then(function () {
                    window.location = "#/home/activityStart/false";
                }, function () {
                    alert("活动继续失败");
                });
            }, function () {
                // 结束活动
                _activityComplete(phone).then(function () {
                }, function () {
                    alert("结束失败!");
                });
            });
        }

        /**
         * 开始新的活动
         * @param phone   用户
         * @param mapId   地图ID
         * @param activityType   模式
         * @private
         */
        function _startActivity(phone, mapId,activityType) {
            if (continueActivity == false) {
                _startActivityImpl(phone, mapId,activityType);
            } else {
                new Activity().getMapListDetailInfo(mapId).then(function (result) {
                    _startActivityImpl(phone, mapId,activityType);
                }, function () {
                    alert("获取地图相关信息失败");
                });
            }
        }

        function _startActivityImpl(phone, mapId,activityType) {
            continueActivity = false;  //
            intDataService.activityStart({
                phone: phone,
                id: mapId,
                competype:activityType
            }).then(function (re) {
                switch (re.result) {
                    case '01':
                        window.location = "#/home/activityStart/true";
                        break;
                    case '02':
                        plugins.toast.showShortCenter('您还未登录!');
                        break;
                    default :
                        plugins.toast.showShortCenter('进入活动失败!');
                        break;
                }
            });
        }

        /**
         * 将线路顺序构造对象形式
         * @param str  字符串
         * @returns {Array}
         * @private
         */
        function _strParse(str) {
            var array = [];
            var strParse = str.split(',');
            for (var i = 0; i < strParse.length; i++) {
                var item = {
                    isScanner: false,
                    lineNo: strParse[i]
                };
                array.push(item);
            }
            return array;
        }


        return {
            Activity: new Activity(),
            cacheMapDetailInfo: cacheMapDetailInfo,
            continueAcInfo: continueAcInfo,
            differenceTime: differenceTime
        }

    }]);
});