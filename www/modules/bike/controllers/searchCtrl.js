/**
 * @function:自行车“自行车站点搜索”控制器
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/bike/_module.js'], function (module) {
    module.controller('searchCtrl', ['$scope', '$ionicModal', 'database', 'intDataService',function ($scope, $ionicModal, database,intDataService) {
        /*todo $scope扩展------------------------------------------------*/
        $scope.modal = null;//模态
        $scope.closeModal = closeModal;//关闭模态框
        $scope.search = search;//执行查询操作并打开模态框
        $scope.keyWork = '';//输入框关键字
        $scope.result = [];//查询结果
        $scope.addOften = addOften;//收藏
        /*todo 函数调用--------------------------------------------------*/
        _initModal();
        /*todo 私有函数--------------------------------------------------*/
        /**
         * @function 初始化模态框
         * @private
         */
        function _initModal() {
            $ionicModal.fromTemplateUrl('modules/bike/templates/searchHtml.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });

        }

        /*todo 公共函数--------------------------------------------------*/

        /**
         * @function 关闭模态框
         */
        function closeModal() {
            $scope.modal.hide();
        }

        /**
         * @function 查询本地数据库
         */
        function search() {
            if (!$scope.keyWork) {
                plugins.toast.showShortCenter('关键字不为空!');
                return;
            }
            $scope.ionLoad.show('正在查询...');
            var conditionByName = {name: $scope.keyWork};
            var conditionByAddress = {address: $scope.keyWork};
            var iResult = [];
            console.time('查询耗时：');
            database.select('bikeStation', conditionByName)
                .then(function (data) {
                    iResult = data;
                    return database.select('bikeStation', conditionByAddress);
                })
                .then(function (data) {
                    $scope.result = $scope.delTheSameId(iResult.concat(data));
                    console.log($scope.result);
                    $scope.ionLoad.hide();
                    $scope.modal.show();
                    console.timeEnd('查询耗时：');
                    return  $scope.result;
                }).then(function (){
                    intDataService.requestEstateBike.getRealBikesByArr($scope.result)
            });
        }

        function addOften(each){
            each.often=1;
            $scope.tiggleOften(each.id,1)

        }
    }]);

});

