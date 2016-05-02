define([_serverURL + 'modules/activity/_module.js', 'cycle', 'carousel'], function (module) {
    module.controller('aStartCtrl', ['$scope', '$ionicHistory', '$interval', '$ionicPlatform','activityLogic','$stateParams', function ($scope, $ionicHistory, $interval, $ionicPlatform,activityLogic,$stateParams) {
        $scope.startLineList = {};
        $scope.progressVal = 0;
        $scope.clock = {
            sec: "00",
            min: "00",
            hour: "00"
        };
        var timeClock;
        $scope.initStart = function () {
            $scope.startLineList = angular.copy(activityLogic.cacheMapDetailInfo.line);
            $scope.nextLine = $scope.startLineList.lineArray[0]; //下一个要扫描的点
            var startTime = "";
            // 清空缓存时间
            if($stateParams.newActivity == "true"){
                startTime = new Date().getTime();
                // 缓存开始时间
                localStorage[$scope.currentUser.phone+'startTime'] = new Date().getTime();
            } else{
                // 继续活动
                startTime = localStorage[$scope.currentUser.phone + 'startTime'];
                // 判断本地是否有缓存
                if (startTime == undefined) {
                    startTime = new Date().getTime();
                    localStorage[$scope.currentUser.phone+'startTime'] = startTime;    //开始时间
                 }
                _markLine(activityLogic.continueAcInfo);
            }
            timeClock = $interval(function () {
                //计算时间差
                var resultTime = activityLogic.differenceTime(startTime);
                $scope.clock.hour = resultTime.hour;
                $scope.clock.min= resultTime.min;
                $scope.clock.sec = resultTime.sec;
            }, 1000);

            setTimeout(function () {
                $scope.skyCarousel = $('#character-slider').carousel({
                    itemWidth: 92,
                    itemHeight: 92,
                    enableMouseWheel: false,
                    gradientOverlayVisible: true,
                    gradientOverlayColor: '#404E55',
                    gradientOverlaySize: 300,
                    distance: 1,
                    startIndex: 0,   //开始位置
                    selectedItemDistance: 80,
                    selectByClick: true,
                    selectedItemZoomFactor: 0.8,
                    unselectedItemZoomFactor: 0.4,
                    navigationButtonsVisible: false,
                    showPreloader: true,
                    autoSlideshow: false
                });
            }, 500);
        };




        /**
         * 扫描条码
         */
        $scope.barcodeScanner = function () {
            activityLogic.Activity.recordUpload($scope.currentUser.phone).then(function(result){
                var lineIndex = $scope.startLineList.lineArray.indexOf(result.lineNo.toString());
                $scope.skyCarousel.select(lineIndex, 0.1);
                _markLine(result);
                // 结果01
            },function(result){
                var lineIndex = $scope.startLineList.lineArray.indexOf(result.lineNo.toString());
                $scope.skyCarousel.select(lineIndex, 0.1);
                _markLine(result);
                // 结果31
            });
        };

        // 标记已经扫描的点为红色
        function _markLine(result){
            $scope.nextLine = result.nextNode;

            $scope.progressVal = result.percent;
            // 清空
            for(var j = 0; j<$scope.startLineList.lineObj.length; j++){
                $scope.startLineList.lineObj[j].isScanner = false;
            }
            // 标记
            if(result.userLine == ""){
                return;
            }
            var userLine = result.userLine.split(',');
            for(var i = 0;i<userLine.length;i++){
                var index = $scope.startLineList.lineArray.indexOf(userLine[i].toString());
                $scope.startLineList.lineObj[index].isScanner = true;
            }
        }

        var activityCancel = $ionicPlatform.registerBackButtonAction(function (e) {
            if ($ionicHistory.currentStateName() == 'home.activityStart') {
                $scope.activityGoBack();
                e.stopPropagation();
            } else {
                $ionicHistory.goBack();
            }
        }, 101);


        /**
         * 结束活动
         */
        $scope.endActivity = function () {
            $scope.activityGoBack();
        };



        /**
         * 导航栏返回结束活动提示
         */
        $scope.activityGoBack = function () {
            activityLogic.Activity.endActivity($scope.currentUser.phone).then(function(){
                $interval.cancel(timeClock);
                $ionicHistory.goBack();
            },function(){
                alert("结束失败、请重试");
            });
        };
        $scope.$on('$destroy', activityCancel);

    }]);
});

