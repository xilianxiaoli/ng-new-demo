/*
 * 功能：地图接口包装
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.factory("map", ['$rootScope', '$http','$q','CONFIG', function ($rootScope, $http,$q,CONFIG) {
        /*todo 变量声明-------------------------------------------------------*/
        var isMobile=ionic.Platform.isWebView();

        // app首次运行 每隔3s定位
        if(isMobile){
            var intervalGetPosition = setInterval(function(){
                if($rootScope.iCurrent.length == 0){
                    getLocation().then(function(){},function(){
                        clearInterval(intervalGetPosition);
                    });
                } else{
                    clearInterval(intervalGetPosition);
                }
            },3000);
        }


        /*todo 私有函数-------------------------------------------------------*/
        /**
         * @function 放入自行车地图数据
         * @returns {*}
         * @private
         */
        function _setBikeInfo() {
            var setBikeInfoDeferred=$q.defer();
            hxSmartMap.setBikeInfo(
                function () {setBikeInfoDeferred.resolve();},
                function (e) {setBikeInfoDeferred.reject(e);},
                {}
            );
            return setBikeInfoDeferred.promise;
        }

        /**
         * @function 放入房屋地图数据
         * @returns {*}
         * @private
         */
        function _setEstateInfo() {
            var _setEstateInfoDeferred=$q.defer();
            hxSmartMap.setLeaseInfo(
                function () {_setEstateInfoDeferred.resolve();},
                function (e) {_setEstateInfoDeferred.reject(e);},
                {}
            );
            return _setEstateInfoDeferred.promise;
        }

        /*todo 公共函数-------------------------------------------------------*/

        /**
         * @function 单点自行车地图
         * @each 需要显示的单点对象
         * @returns {*}
         */
        function singleEstateMap(each) {
            var singleEstateMapDeferred=$q.defer();
            hxSmartMap.startSingleLease(
                function () {singleEstateMapDeferred.resolve();},
                function (e) {singleEstateMapDeferred.reject(e);},
                each
            );
            return singleEstateMapDeferred.promise;
        }

        /**
         * @function 单点自行车地图
         * @each 需要显示的单点对象
         * @returns {*}
         */
        function singleBikeMap(each) {
            var startSingleBikeDeferred=$q.defer();
            hxSmartMap.startSingleBike(
                function (result) {
                    startSingleBikeDeferred.resolve(result);},
                function (e) {startSingleBikeDeferred.reject(e);},
                each
            );
            return startSingleBikeDeferred.promise;
        }

        /**
         * @function 多点自行车地图
         * @returns {*}
         */
        function multiBikeMap() {
            var startBikeMapDeferred=$q.defer();
            hxSmartMap.startBikeMap(
                function (result) {startBikeMapDeferred.resolve(result);},
                function (e) {startBikeMapDeferred.reject(e);},
                {}
            );
            return startBikeMapDeferred.promise;
        }

        /**
         * function 多点房屋地图
         * @returns {*}
         */
        function multiEstateMap() {
            var startLeaseMapDeferred=$q.defer();
            hxSmartMap.startLeaseMap(
                function () {startLeaseMapDeferred.resolve();},
                function (e) {startLeaseMapDeferred.reject(e);},
                {}
            );
            return startLeaseMapDeferred.promise;
        }

        /**
         * function 定位
         * @returns {*}
         */
        function getLocation() {
            var getLocationDeferred = $q.defer();
            hxSmartMap.getLocation(function (data) {
                var dataResult = typeof data == "object" ? data :  eval("(" + data + ")");
                var result = [];
                result[0] = dataResult.lng;
                result[1] = dataResult.lat;
                 //result = ["113.349599","22.527274"];
                console.log("当前经纬度信息"+result.join(','));
                $rootScope.$apply(function(){
                    $rootScope.iCurrent = result;
                });
                getLocationDeferred.resolve(result);
            }, function (err) {
                getLocationDeferred.reject(err);

            });
            return getLocationDeferred.promise;
        }


        /**
         * @function 将数据注入android uiView
         */
        function fillBikeEstateDataInView() {
            _setBikeInfo();
            _setEstateInfo();
        }

        /**
         * 定位成功后获取附近站点数据、借用百度接口获取
         * @param range   距离
         * @param pageIndex  页面索引
         */
        function getNearbyBikeStation(range,pageIndex) {
            var deferred = $q.defer(),
                data  = {
                ak:"NQnHa2h6nvqjkdeCW4P3LGkb",   //access_key
                geotable_id:"124075",  //geotable主键
//              q:"富丽路",   //检索关键字
                location:$rootScope.iCurrent[0]+","+$rootScope.iCurrent[1],   // 检索的中心点
                coord_type:3,  // 坐标系
                radius:range,  // 检索半径
                page_index: pageIndex,   //当前页标，从0开始
                page_size:"8",   //可选默认为10，最多为50
                sortby:"distance:1"  // 条件筛选  距离升序
            };
            $http({
                method: 'GET',
                url: CONFIG.getNearbyBikeData,
                params: data,
                timeout: 10000
            }).success(function (data, status) {
                deferred.resolve(data, status);
            }).error(function (data, status) {
                plugins.toast.showShortCenter("附近站点加载失败！");
                deferred.reject(data, status);
            });
            return deferred.promise;
        }


        /*todo 暴露接口-------------------------------------------------------*/
        return {
            singleBikeMap:isMobile?singleBikeMap:angular.noop, //单点自行车地图
            multiBikeMap:isMobile?multiBikeMap:angular.noop, //多点自行车地图
            singleEstateMap:isMobile?singleEstateMap:angular.noop, //单点房屋地图
            multiEstateMap:isMobile?multiEstateMap:angular.noop, //多点房屋地图
            getLocation:isMobile?getLocation:angular.noop, //多点房屋地图
            fillBikeEstateDataInView:isMobile?fillBikeEstateDataInView:angular.noop, //将数据注入View
            getNearbyBikeStation:getNearbyBikeStation
        };
    }
    ]);
});


