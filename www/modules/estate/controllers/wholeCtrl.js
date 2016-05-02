/**
 * @function:物业租赁“全城”控制器
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/estate/_module.js'], function (module) {
    module.controller('wholeCtrl', ['$scope','$ionicScrollDelegate',function ($scope,$ionicScrollDelegate) {
        /*todo $scope扩展------------------------------------------------------*/
        $scope.listType = {val: 0};//物业类型:0:出租，1：出售
        $scope.hireCondition={//出租信息初始条件
            sourceFrom:{chineseName:'来源',range:'城建',suffix:'',englishName:'sourceFrom'},
            type:{chineseName:'类型',range:1,suffix:''}
        };
        $scope.sellCondition={//出售信息初始条件
            sourceFrom:{chineseName:'来源',range:'城建',suffix:'',englishName:'sourceFrom'},
            type:{chineseName:'类型',range:2,suffix:''}
        };
        $scope.removeCondition = removeCondition;
        $scope.estateHire = [];//出租数据模型
        $scope.estateSell = [];//出售数据模型
        /*todo 函数调用---------------------------------------------------------*/
        _initWholeEstate();
        /*todo 私有函数---------------------------------------------------------*/
        /**
         * @function 刷新出租信息
         * condition 条件
         * @private
         */
        function _refreshHire(condition){
            return $scope.getEstateData(condition).then(function(data){
                $scope.estateHire=data;
                //console.log('出租数据',data);
                _scrollTop('estateHireContent');
            });
        }

        /**
         * @function 刷新出售信息
         * condition 条件
         * @private
         */
        function _refreshSell(condition){
            return $scope.getEstateData(condition).then(function(data){
                $scope.estateSell=data;
                //console.log('出售数据',data);
                _scrollTop('estateSellContent');
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
         * @页面初始化函数
         */
        function _initWholeEstate(){
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
    }]);
});
