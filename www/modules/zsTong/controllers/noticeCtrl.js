define([_serverURL + 'modules/zsTong/_module.js'], function (module) {
    module.controller('noticeCtrl', ['$scope','iGloab','zsTongGloab',function ($scope,iGloab,zsTongGloab) {
            //公告数据
            $scope.notice=zsTongGloab.zst.zstNotice;
        }]
    );
});


