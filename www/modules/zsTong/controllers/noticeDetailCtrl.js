define([_serverURL + 'modules/zsTong/_module.js'], function (module) {
    module.controller('noticeDetailCtrl', ['$scope','iGloab','zsTongGloab','$stateParams',
            function ($scope,iGloab,zsTongGloab,$stateParams) {

                //显示公告内容
                $scope.notice=zsTongGloab.zst.zstNotice.allNotice[$stateParams.noticeId];




        }]
    );
});


