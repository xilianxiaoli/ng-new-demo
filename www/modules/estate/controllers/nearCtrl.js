/**
 * @function:物业租赁“附近”控制器
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/estate/_module.js'], function (module) {
    module.controller('nearCtrl', ['$scope','$ionicScrollDelegate','nearEstateService',function ($scope,$ionicScrollDelegate,nearEstateService) {
        /*todo $scope扩展------------------------------------------------------*/
        $scope.listType = {val: 0};//物业类型:0:出租，1：出售
        $scope.hireCondition={//出租信息初始条件
            type:{chineseName:'类型',range:1,suffix:''}
         //   distance:{chineseName:'距离',range:1000,suffix:'米以内',englishName:'distance'}
        };

        $scope.sellCondition={//出售信息初始条件
            type:{chineseName:'类型',range:2,suffix:''}
        };
        $scope.removeCondition = removeCondition;
        $scope.estateHire = [];//出租数据模型
        $scope.estateSell = [];//出售数据模型
        $scope.currenHirePageIndex = 0;
        $scope.currenSellPageIndex = 0;
        $scope.nextPageEstateChuzu = false;
        $scope.nextPageEstateChuShou = false;
        $scope.appendEstate = appendEstate;
        $scope._xialaRefresh = _xialaRefresh;

        /*todo 函数调用---------------------------------------------------------*/
        _initWholeEstate();
        /*todo 私有函数---------------------------------------------------------*/

        function _xialaRefresh(){
            switch ($scope.listType.val){
                case 0:
                    _refreshHire($scope.conditionConvert($scope.hireCondition)).then(function(){

                    });
                    break;
                case 1:
                    _refreshSell($scope.conditionConvert($scope.sellCondition)).then(function(){
                       // $scope.$broadcast('scroll.refreshComplete');
                    });
                    break;
            }
        }
        /**
         * @function 刷新出租信息
         * condition 条件
         * @private
         */
        function _refreshHire(condition){
            $scope.currenHirePageIndex = 0;
            $scope.nextPageEstateChuzu = false;
            $scope.estateHire = [];
            return nearEstateService.getNearEstateFromDataBase($scope.currenHirePageIndex,condition,$scope.estateHire).then(function(data){
                var PageSize = data.total % 8 == 0 ? data.total / 8 : parseInt((data.total / 8)) + 1;
                if($scope.currenHirePageIndex < PageSize -1 ){
                    $scope.nextPageEstateChuzu = true;//还有下一页
                }
                _scrollTop('estateHireContent');
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        /**
         * @function 刷新出售信息
         * condition 条件
         * @private
         */
        function _refreshSell(condition){
            $scope.currenSellPageIndex = 0;
            $scope.nextPageEstateChuShou = false;
            $scope.estateSell = [];
            return nearEstateService.getNearEstateFromDataBase($scope.currenSellPageIndex,condition,$scope.estateSell).then(function(data){
                var PageSize = data.total % 8 == 0 ? data.total / 8 : parseInt((data.total / 8)) + 1;
                if($scope.currenSellPageIndex < PageSize -1 ){
                    $scope.nextPageEstateChuShou = true;//还有下一页
                }
                _scrollTop('estateSellContent');
                $scope.$broadcast('scroll.refreshComplete');
            });

        }

        /**
         * @function 下拉出租信息
         * condition 条件
         * @private
         */
        function _appendHire(condition){
            console.info("开始下拉出租信息");
            $scope.currenHirePageIndex ++;
            $scope.nextPageEstateChuzu = false;
            return nearEstateService.getNearEstateFromDataBase($scope.currenHirePageIndex,condition,$scope.estateHire).then(function(data){
                var PageSize = data.total % 8 == 0 ? data.total / 8 : parseInt((data.total / 8)) + 1;
                if($scope.currenHirePageIndex < PageSize -1 ){
                    $scope.nextPageEstateChuzu = true;//还有下一页
                }
            });
        }

        /**
         * @function 下拉出售信息
         * condition 条件
         * @private
         */
        function _appendSell(condition){
            console.info("开始下拉出售信息");
            $scope.currenSellPageIndex ++;
            $scope.nextPageEstateChuShou = false;
            return nearEstateService.getNearEstateFromDataBase($scope.currenSellPageIndex,condition,$scope.estateSell).then(function(data){
                var PageSize = data.total % 8 == 0 ? data.total / 8 : parseInt((data.total / 8)) + 1;
                if($scope.currenSellPageIndex < PageSize -1 ){
                    $scope.nextPageEstateChuShou = true;//还有下一页
                }
            });

        }

        /**
         * @function 滚动条滚动到顶部
         * @param scrollId scroll ID标识
         * @private
         */
        function _scrollTop(scrollId){
            $ionicScrollDelegate.$getByHandle(scrollId).scrollTop(true);
        }

        /**
         * @function 页面初始化函数
         */
        function _initWholeEstate(){
            //初始化页码
            $scope.currenHirePageIndex = 0;
            $scope.currenSellPageIndex = 0;

            $scope.ionLoad.show('正在加载...');
            _refreshHire($scope.conditionConvert($scope.hireCondition)).then(function(){
                _refreshSell($scope.conditionConvert($scope.sellCondition)).then(function(){
                    $scope.ionLoad.hide();
                });
            });

            $scope.$on('hMenuData',function(event,data){
                $scope.ionLoad.show('正在查找...');
                var myData=$scope.deleteBUXIANG(data);
                var condition=$scope.conditionConvert(data);
             //   delete condition.
                //console.log('加工过的条件',condition);
                switch ($scope.listType.val){
                    case 0:
                        _refreshHire(condition).then(function(){
                            $scope.ionLoad.hide();
                            $scope.hireCondition=myData;
                        });
                        break;
                    case 1:
                        _refreshSell(condition).then(function(){
                            $scope.ionLoad.hide();
                            $scope.sellCondition=myData;
                        });
                        break;
                }

            });

        }

        /**
         * 删除筛选条件
         * @param englishName
         */
        function removeCondition(englishName){
            switch ($scope.listType.val){
                case 0:
                    delete $scope.hireCondition[englishName];
                    $scope.$emit('hMenuData',$scope.hireCondition);
                    break;
                case 1:
                    delete $scope.sellCondition[englishName];
                    $scope.$emit('hMenuData',$scope.sellCondition);
                    break;
            }
        }

        /**
         * 下拉刷新入口方法
         */
        function appendEstate(){
            switch ($scope.listType.val){
                case 0:
                    _appendHire($scope.conditionConvert($scope.hireCondition)).then(function(){
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        console.info("结束下拉出租信息");
                    });
                    break;
                case 1:
                    _appendSell($scope.conditionConvert($scope.sellCondition)).then(function(){
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        console.info("结束下拉出售信息");
                    });
                    break;
            }

        }

    }]);
});
