define([_serverURL + 'modules/zsTong/_module.js'], function (module) {
    module.controller('websiteCtrl', ['$scope','slide','zsTongGloab',function ($scope,slide,zsTongGloab) {
            /*//变量声明
            $scope.iCurrent=BMap.iCurrent;
             //$scope.distance=iGloab.baiduMap.distance;
            //初始化页面下拉菜单
            $scope.slideMenu=function(){
                slide('slide');
            };

            //站点数据
            $scope.station=zsTongGloab.zst.zstStation;


            /!*说明：暂时函数，以后升级使用索引查询，就不再需要这个函数
             * 功能：将自行车站点数据进行分类
             * *!/
            (function(){
                $scope.$watch(
                    function(){return  $scope.station.allStation.length},
                    function(){
                        //console.log($scope.station)
                        for(var i= 0,len=$scope.station.allStation.length;i<len;i++){
                            var item=$scope.station.allStation[i];
                            $scope.station.fuJin.push(item);
                            switch (true){
                                case item.area==='东区':
                                    $scope.station.dongQu.push(item);
                                    break;
                                case item.area==='南区':
                                    $scope.station.nanQu.push(item);
                                    break;
                                case item.area==='西区':
                                    $scope.station.xiQu.push(item);
                                    break;
                                case item.area==='石岐区':
                                    $scope.station.shiQiQu.push(item);
                                    break;
                                case item.area==='五桂山区':
                                    $scope.station.wuGuiShanQu.push(item);
                                    break;
                            }
                        }
                        //console.log($scope.station)
                    });
            }());










*/








        }]
    );
});


