/**
 * Created by Administrator on 2015/5/8.
 */
define([_serverURL + 'modules/bus/_module.js'], function (module) {
    module.controller('line-detailCtrl', ['$scope','$stateParams','busGloab',function ($scope,$stateParams,busGloab) {
            console.log('line-detailCtrl');
            $scope.busLineInfo = [];    //公交线路信息
            $scope.showLine = function(){
                var index = $stateParams.lineId;
                var strArr = busGloab.bus.line.allLine[index].pass;
                $scope.busLineInfo = createStaArray(strArr);
            };
            function createStaArray(str){
                return str.split(",");
            }

        }]
    );
});


