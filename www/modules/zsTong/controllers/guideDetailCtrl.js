define([_serverURL + 'modules/zsTong/_module.js'], function (module) {
    module.controller('guideDetailCtrl', ['$scope','iGloab','zsTongGloab','$stateParams',
            function ($scope,iGloab,zsTongGloab,$stateParams) {
                //显示公告内容
                $scope.guide=zsTongGloab.zst.zstGuide.allGuide[$stateParams.guideId];




            }]
    );
});


