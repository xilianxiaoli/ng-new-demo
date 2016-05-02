define([_serverURL + 'modules/zsTong/_module.js'], function (module) {
    module.controller('mapShowCtrl', ['$scope','iGloab','zsTongGloab','$stateParams',
            function ($scope,iGloab,zsTongGloab,$stateParams) {
                //初始化地图
                $scope.mapInit={
                    opt:zsTongGloab.zst.zstStation[$stateParams.stationType][$stateParams.stationIdx],
                    act:function(){
                    }
                };


        }]
    );
});


