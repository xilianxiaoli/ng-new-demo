/**
 * @function:自行车“卡查询”控制器
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/bike/_module.js'], function (module) {
    module.controller('bikeCardCtrl', ['$scope','$state','intDataService','bikeStation','$filter','$rootScope', function ($scope,$state,intDataService,bikeStation,$filter,$rootScope) {
        console.log('bikeCardCtrl');
        /*todo $scope扩展----------------------------------------------------*/
        $scope.queryObj = {
            "TBVipNo": "",
            "TBCertNo": "",
            "tb_startTime": "",
            "tb_endTime": ""
        };
        $scope.queryBalanceParam = {
            "TBVipNo": "",
            "TBCertNo": ""
        };
        $scope.queryResult = bikeStation.bikeCardResult;
        $scope.balanceInfo = bikeStation.balanceResult;
        $scope.datePickerShow = datePickerShow;
        $scope.queryBikeCard = queryBikeCard;
        $scope.queryBalanceInfo = queryBalanceInfo;
        /*todo 公共函数-------------------------------------------------------*/
        /**
         * 显示日期控件
         * @param type
         */
        function datePickerShow(type){
            var options = {
                date: new Date(),
                mode: 'date'
            };
            datePicker.show(options, function(returnDate){
                if(returnDate + "" != "Invalid Date"){
                    var t = $filter('date')(returnDate.getTime(),'yyyy-MM-dd');
                    type == 'st' ? $scope.$apply($scope.queryObj.tb_startTime = t) : $scope.$apply($scope.queryObj.tb_endTime = t);
                }
            });
        }
        function queryBikeCard() {
            console.log($scope.queryObj);
            $scope.ionLoad.show('正在查询...');
            var promise = intDataService.requestEstateBike.getBikeCard($scope.queryObj);
            promise.then(function(data){
                $scope.ionLoad.hide();
                if(data.head.resultCode == "Success"){
                    bikeStation.bikeCardResult = data.body.resultDatas;
                    $state.go('bike.cardDetail');
                }else if(data.head.resultCode == "Error"){
                    plugins.toast.showShortCenter('输入信息有误!');
                }

                console.log(data);
            },function(data){
                $scope.ionLoad.hide();
                if(!iGloab.netWork.IsOnLine){
                    alert("请检查网络连接是否正确");
                }else{
                    plugins.toast.showShortCenter('服务器连接失败');
                }
            });


        }
        function queryBalanceInfo(){
            $scope.ionLoad.show('正在查询...');
            var promise = intDataService.requestEstateBike.getBalance($scope.queryBalanceParam);
            promise.then(function(data){
                $scope.ionLoad.hide();
                if(data.head.resultCode == "Success"){
                    $state.go('bike.balanceDetail');
                    bikeStation.balanceResult = data.body.resultDatas[0];
                    console.log( bikeStation.balanceResult);
                }else if(data.head.resultCode == "Error"){
                    plugins.toast.showShortCenter('输入信息有误!');
                }

                console.log(data);
            },function(data){
                $scope.ionLoad.hide();
                if(!iGloab.netWork.IsOnLine){
                    alert("请检查网络连接是否正确");
                }else{
                    plugins.toast.showShortCenter('服务器连接失败');
                }
            });
        }
    }]);
});

