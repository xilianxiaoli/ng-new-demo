define([_serverURL + 'modules/activity/_module.js'], function (module) {
    module.controller('aHomeCtrl', ['$scope', 'iGloab', '$ionicModal', '$ionicPopover', '$stateParams', 'activityLogic','$ionicActionSheet',function ($scope, iGloab, $ionicModal, $ionicPopover, $stateParams,activityLogic,$ionicActionSheet) {

        /**
         * 获取定向越野数据
         */
        $scope.activityList = {};

        /**
         * 下拉刷新加载地图
         */
        $scope.getMapListInfo = function () {
            activityLogic.Activity.getMapListInfo().then(function(result){
                $scope.activityList = result;
                $scope.$broadcast('scroll.refreshComplete');
            },function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        /**
         * 地图详细信息
         */
        $scope.mapDetailInfo = {};

        $scope.getMapDetailInfo = function(){
            activityLogic.Activity.getMapListDetailInfo($stateParams.mapId).then(function(result){
                $scope.mapDetailInfo = result;
                $scope.$broadcast('scroll.refreshComplete');
            },function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        /**
         * 查看地图
         */
        $scope.mapUrl = "";
        $scope.showActivityMap = function () {
            $scope.mapUrl = activityLogic.cacheMapDetailInfo.mapUrl;
        };


        $scope.showInstroduce = function () {
            $ionicModal.fromTemplateUrl('introduce.html', {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: true
            }).then(function (modal) {
                modal.show();
            });
        };

        $scope.getYueY = function ($event) {
            $ionicPopover.fromTemplateUrl('s-popover.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.popover = popover;
                $scope.popover.show($event);
            });

        };

        $scope.showRule = function () {
            $ionicModal.fromTemplateUrl('templates/rule.html', {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: true
            }).then(function (modal) {
                modal.show();
            });
        };


        /**
         * 查看线路顺序
         * @param $event
         */
        $scope.showStation = function ($event) {
            $ionicPopover.fromTemplateUrl('popover.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.popover = popover;
                $scope.popover.show($event);
            });

        };
        $scope.activityType = {
            value:1
        };
        $ionicModal.fromTemplateUrl('templates/chooseType.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: true
        }).then(function (modal) {
            $scope.chooseModal = modal;
        });
        $scope.chooseTypeModal = function(){
            $scope.chooseModal.show();

        };
        /**
         * 开始本次定向越野
         */

        $scope.starActivity = function () {
            $scope.chooseModal.hide();
            if ($.isEmptyObject($scope.currentUser)) {
                plugins.toast.showShortCenter('用户未登录');
                window.location = '#/home/userLogin';
                return;
            }
            activityLogic.Activity.goToActivity($scope.currentUser.phone,$stateParams.mapId,$scope.activityType.value);
        };



        /**
         * 查看成绩
         */
        $scope.goUserInfo = function () {
            if (!$.isEmptyObject($scope.currentUser)) {
                window.location = '#/home/activityResults';
            } else {
                plugins.toast.showShortCenter('请先登录');
                window.location = '#/home/userLogin';
            }
        };


    }]);
});

