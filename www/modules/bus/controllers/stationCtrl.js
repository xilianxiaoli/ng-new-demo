/**
 * Created by Administrator on 2015/5/8.
 */
define([_serverURL + 'modules/bus/_module.js'], function (module) {
    module.controller('stationCtrl', ['$scope','busGloab',function ($scope,busGloab) {
            console.log('stationCtrl.js');


            busGloab.busStationDataLoad(busGloab.bus.station);//载入站点数据

        }]
    );
});


