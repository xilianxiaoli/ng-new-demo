/**
 * Created by Administrator on 2015/5/8.
 */
define([_serverURL + 'modules/bus/_module.js'], function (module) {
    module.controller('lineCtrl', ['$scope','iGloab','busGloab',function ($scope,iGloab,busGloab) {
            console.log('lineCtrl.js');
            //历史线路
            $scope.historyLine = [
                {lineId:"M428",destination:"火车站西广场"},
                {lineId:"M332",destination:"燕村公交总站"},
                {lineId:"338",destination:"皇岗口岸"},
                {lineId:"327",destination:"沙井建材市场"}
            ];
            //所有线路
           /* $scope.allLine = [
                {lineId:"M428",destination:"火车站西广场"},
                {lineId:"M332",destination:"燕村公交总站"},
                {lineId:"338",destination:"皇岗口岸"},
                {lineId:"362",destination:"松岗塘下涌"},
                {lineId:"327",destination:"沙井建材市场"},
                {lineId:"339",destination:"南山科技园总站"},
                {lineId:"237",destination:"田心村"}
            ];*/


            $scope.busLineSearch = function(param){
                busGloab.busDataInfo = {
                    container:'l-map',   //显示地图的容器
                    position:{
                        lon:'114.0205165',
                        lat:'22.5352081'
                    },
                    keyword:param
                };
                window.location = "#/bus/line-detail";
            };



            $scope.allLine = busGloab.bus.line.allLine;
            console.log(busGloab.bus.line.allLine);
            busGloab.busLineDataLoad(busGloab.bus.line);//载入站点数据

        }]
    );
});


