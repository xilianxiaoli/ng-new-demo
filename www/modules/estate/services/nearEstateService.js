/**
 * Created by lenovo on 2015/11/4.
 */
/**
 * 文件下载服务
 */
define([_serverURL + 'modules/estate/_module.js'], function (module) {
    module.factory("nearEstateService", ['$q','$rootScope','map','CONFIG','$http','database',function ($q,$rootScope,map,CONFIG,$http,database) {

        function getNearEstateFromBaidu(pageIndex,range){
            var deferred = $q.defer(),
                data  = {
                    ak:"NQnHa2h6nvqjkdeCW4P3LGkb",   //access_key
                    geotable_id:"124955",  //geotable主键
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
                plugins.toast.showShortCenter("附近物业加载失败！");
                deferred.reject(data, status);
            });
            return deferred.promise;
        }

        /**
         * 从数据库获取附近物业
         * @param pageIndex
         * @param range
         * @param condition
         */
        function getNearEstateFromDataBase(pageIndex,condition,collection){
            var deferred = $q.defer();
            var result = [];
            var range = 7000;
            var mycondition ={};
            angular.copy(condition,mycondition);
            if(condition['distance']) {
                range = condition['distance'];
                delete mycondition.distance;
            }
            if($rootScope.iCurrent.length == 0){
                plugins.toast.showShortCenter("当前位置没有定位成功");
                deferred.reject();
            }else{
                getNearEstateFromBaidu(pageIndex,range).then(function(data){
                    result['total'] = data['total'];
                    result['size'] = data['size'];
                    angular.forEach(data.contents, function (e, i) {
                        var con ={};
                        angular.copy(mycondition,con);
                        con['id'] = parseInt(e.estate_id);
                      //  console.log("数据库筛选条件：",con);
                        database.select('estateData',con).then(function (data2) {
                          //  console.log('数据库查询结果',data2[0]);
                            if(data2[0]){
                                console.log("添加结果",data2[0]);
                                collection.push(data2[0]);
                            }
                        }, function () {

                        })
                    });

                    deferred.resolve(result);
                },function (error){
                    deferred.reject(error);
                });

            }

            return deferred.promise;
        }

        return {
            getNearEstateFromDataBase:getNearEstateFromDataBase
        }

    }]);
});


