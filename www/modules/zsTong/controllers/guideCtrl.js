define([_serverURL + 'modules/zsTong/_module.js'], function (module) {
    module.controller('guideCtrl', ['$scope','iGloab','zsTongGloab',function ($scope,iGloab,zsTongGloab) {
            //返回按钮
            $scope.guide=zsTongGloab.zst.zstGuide;
        }]
    );
});


