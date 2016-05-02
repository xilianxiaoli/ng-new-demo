/**
 * @function:物业租赁“详细信息”控制器
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/estate/_module.js'], function (module) {
    module.controller('detailCtrl', ['$scope', '$stateParams', '$timeout', '$ionicSlideBoxDelegate', 'database', function ($scope, $stateParams, $timeout, $ionicSlideBoxDelegate, database) {
        console.log('detailCtrl');
        /*todo 全局变量----------------------------------------------------*/
        var houseId = Number($stateParams.houseId);//本条物业信息的id号
        var imgPreFix='http://218.204.174.24:8052/ZST/images/house/';
        /*todo $scope扩展--------------------------------------------------*/
        $scope.houseDetail = {};//本条物业信息对象
        $scope.imgs = [];//本条物业图片添加了前缀的集合数组
        $scope.type = $stateParams.type;//物业类型
        $scope.goBackView = goBackView;//返回重写
        $scope.nowIdx = 0;//默认其实图片轮播下标
        $scope.setIdx = setIdx;//设置图片轮播右下角的图片张数标签
        /*todo 函数调用----------------------------------------------------*/
        _init();
        /*todo 私有函数----------------------------------------------------*/
        /**
         * @function 从本地数据库读取单条物业信息
         * @private
         */
        function _init() {
            $scope.ionLoad.show('正在加载...');
            database.select('estateData', {id: houseId})
                .then(
                function (data) {
                    $scope.houseDetail = data[0];
                    $scope.imgs = _addPreFixed($scope.houseDetail.pictureUrl.split(','));
                    $ionicSlideBoxDelegate.$getByHandle('detailImgs').update()
                    $scope.ionLoad.hide()
                },
                function () {
                    $scope.ionLoad.hide()
                }
            )
        }

        /**
         * @function 为图片地址添加前缀
         * @param imgs 图片数组容器
         * @returns {Array} 添加好前缀的图片数组
         * @private
         */
        function _addPreFixed(imgs){
            imgs=imgs||[];
            var temArr=[];
            angular.forEach(imgs,function(each){
                temArr.push(imgPreFix+each)
            });
            return temArr
        }


        /*todo 公共函数----------------------------------------------------*/

        /**
         * @function 重写全局返回功能
         */
        function goBackView() {
            window.history.back();
        }

        /**
         * @function 设置图片轮播右下角的图片张数标签
         * @param idx 下标
         */
        function setIdx(idx) {
            $scope.nowIdx = idx;
        }



    }]);
});
