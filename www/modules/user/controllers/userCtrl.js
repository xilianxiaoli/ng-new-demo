define([_serverURL + 'modules/user/_module.js'], function (module) {
    module.controller('userCtrl', ['$scope', 'iGloab', '$ionicPopup','$timeout','$filter','intDataService','$stateParams','$rootScope','$ionicHistory','userLogic',function ($scope, iGloab, $ionicPopup,$timeout,$filter,intDataService,$stateParams,$rootScope,$ionicHistory,userLogic) {

        /**
         * 修改密码
         */
        $scope.userModify = {};
        $scope.modifyPwd = function(){
            $scope.userModify.phone = $scope.currentUser.phone;
            if($scope.userModify.newPwd != $scope.userModify.reNewPwd){
                plugins.toast.showShortCenter("两次密码不一致");
                return;
            }
            userLogic.loginReg.userModifyPwd($scope.userModify).then(function(){
                plugins.toast.showShortBottom("密码已修改,请重新登录");
                $scope.$emit('logOut');
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true,
                    historyRoot: false
                });
                window.location = "#/home/userLogin";
            });
        };



        /**
         * 初始化查询条件
         */
        $scope.queryCondition = {
            sTime:$filter('date')(new Date().getTime(),'yyyy-MM-dd'),
            eTime:$filter('date')(new Date().getTime(),'yyyy-MM-dd'),
            competype:0
        };
        $scope.scoreList = {};
        /**
         * 显示日期控件
         * @param type
         */
        $scope.datePickerShow = function(type){
            var options = {
                date: new Date(),
                mode: 'date'
            };
            datePicker.show(options, function(returnDate){
                if(returnDate + "" != "Invalid Date"){
                    var t = $filter('date')(returnDate.getTime(),'yyyy-MM-dd');
                    type == 'st' ? $scope.$apply($scope.queryCondition.sTime = t) : $scope.$apply($scope.queryCondition.eTime = t);
                }
            });
        };

        /**
         * 越野成绩查询
         */
        $scope.queryScore = function(){
            $scope.scoreList = [];  //清空
            $scope.noResult = false;
            if ($scope.queryCondition.sTime == "") {
                plugins.toast.showShortCenter('请选择开始日期');
                return
            }
            if ($scope.queryCondition.eTime == "") {
                plugins.toast.showShortCenter('请选择结束日期');
                return
            }
            var queryParam = {
                phone:$scope.currentUser.phone,
                beginDate: $scope.queryCondition.sTime,
                endDate:$scope.queryCondition.eTime,
                competype:$scope.queryCondition.competype
            };
            if($scope.queryCondition.competype == 0){
                delete queryParam.competype;
            }
            intDataService.getRecords(queryParam).then(function(data){
                if(data.count == 0){
                    $scope.noResult = true;
                    return;
                }
                $scope.scoreList = data.record;
            });
        };

        /**
         * 查询单条记录信息
         */
        $scope.oneRecord = {};
        $scope.getOneRecord = function(){
            var beginDateParam = $stateParams.beginDate;
                endDateParam = $stateParams.endDate;
            intDataService.getOneRecord({
                phone:$scope.currentUser.phone,
                beginDate:beginDateParam,
                endDate:endDateParam
            }).then(function(data){
                $scope.oneRecord = data;
            })
        };


        /**
         * 排名查询
         * @type {{}}
         */
        $scope.rankInfo = {};
        var param = {
            id:$stateParams.id,
            competype:$stateParams.competype
        };

        $scope.sameTimeMap = function(){
            intDataService.getTop10InDay(param).then(function(result){
                $scope.rankInfo = result;
                $scope.$broadcast('scroll.refreshComplete');
            },function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.threeMonthMap = function(){
            intDataService.getMySelfTopIn3Months(param).then(function(result){
                $scope.rankInfo = result;
                $scope.$broadcast('scroll.refreshComplete');
            },function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
        }


    }]);


    module.filter('numFilter',[function(){
        return function(input){
            var result = "";
            switch (input){
                case 1:
                    result = "传统模式";
                    break;
                case 2:
                    result = "积分模式";
                    break;
            }
            return result;
        }
    }])
});





