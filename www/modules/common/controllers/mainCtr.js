/**
 * app全局控制器
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.controller('mainCtr', ['$scope', '$location', '$rootScope','$ionicSideMenuDelegate', 'iGloab', '$ionicPopup','$ionicLoading','$cordovaDevice', function ($scope, $location, $rootScope, $ionicSideMenuDelegate, iGloab, $ionicPopup,$ionicLoading,$cordovaDevice) {
        console.log("mainCtr");

        /*todo $scope扩展---------------------------------------------*/
        $rootScope.appWorkKey = "";   //app工作密钥
        $rootScope.iCurrent = [];
        //$rootScope.iCurrent = ["113.406420","22.535877"];      //当前位置的经纬度:[经度，纬度]
        $scope.currentUser = {};      //当前用户
        $rootScope.bikeNotAplly = 0;      //scope里的值与数据库的值不同步为1，同步为0
        $rootScope.appNewVersionTip = false;   //app有新版本提示
        $scope.isShowGuideImage = true;
        $scope.ionConfirm = ionConfirm; //ionic confirm包装
        $scope.ionAlert = ionAlert; //ionic alert包装
        $scope.goBackView = goBackView; //自定义返回按钮
        $rootScope.lngLatRand = lngLatRand;   //根据距离生成经纬度范围
        $scope.showToast = showToast;//提示（webView用toast，win用console）
        $scope.delTheSameId = delTheSameId;//去掉数组中id相同的对象
        $scope.initGuideImage=initGuideImage;
        $rootScope.ionLoad=ionLoad();//重写ionic loading样式
        /*todo 函数调用-----------------------------------------------*/
        _getAppWorkKey();


        /*todo 私有函数-----------------------------------------------*/
        /**
         * 获取全局app工作密钥
         */
        function _getAppWorkKey() {
            var getAppWorkKeyPromise = iGloab.getWorkKey();
            getAppWorkKeyPromise.then(function (result) {
                $rootScope.appWorkKey = result;
                $scope.$broadcast('workKeyComplete', result);
                console.log("首页得到的密钥" + $rootScope.appWorkKey);
            })
        }

        /*todo 公有函数-----------------------------------------------*/

        /**
         * 自定义返回按钮
         */
        function goBackView() {
            iGloab.goBackView();
        }

        /**
         * @function 根据距离得出经纬度范围
         * @param distance 距离 (单位：千米)
         * @returns {boolean}
         */
        function lngLatRand(distance){
            distance=Number(distance)||(function(){throw "lngLatRand参数不存在！";}());
            if($scope.iCurrent.length!=0){
                var lngUp=Number($scope.iCurrent[0])+0.009736*distance;
                var lngDown=Number($scope.iCurrent[0])-0.009736*distance;
                var latUp=Number($scope.iCurrent[1])+0.009736*distance;
                var latDown=Number($scope.iCurrent[1])-0.009736*distance;
                return {lng:[lngDown,lngUp],lat:[latDown,latUp]}
            }
            return false;
        }

         /**
         * @function 提示（webView用toast，win用console）
         * @param msg 信息内容
         */
        function showToast(msg) {
            try {
                plugins.toast.showShortCenter(msg)
            } catch (e) {
                console.log(msg)
            }
        }

        /**
         * @function 去掉数组中相同id的对象
         * @param arr
         * @returns {Array}
         */
        function delTheSameId(arr){
            var tempJson={};
            var tempArr=[];
            angular.forEach(arr,function(each){
                tempJson['t'+each.id]=each
            });
            angular.forEach(tempJson,function(val){
                tempArr.push(val)
            });
            return tempArr;
        }

        /**
         * @function ionic alert包装
         * @param msg 需要显示的消息
         * @returns {*}
         */
        function ionAlert(msg) {
            msg = msg || '';
            return $ionicPopup.alert({
                title: '中山通',
                template: msg,
                okText: '确定'
            });

        }

        /**
         * @function ionic confirm包装
         * @param msg 需要显示的消息
         * @returns {*}
         */
        function ionConfirm(msg) {
            msg = msg || '确定继续，取消返回';
            return $ionicPopup.confirm({
                title: '中山通',
                template: msg,
                buttons: [
                    {
                        text: '取消',
                        onTap: function(e) {
                            return false;
                        }
                    },
                    {
                        text: '确定',
                        type: 'button-positive',
                        onTap: function(e) {
                            return true;
                        }
                    }
                ]
            });
        }

        function initGuideImage() {
            if (localStorage["guideImage"] == undefined) {
                console.log($scope.activeSlide);
            } else {
                $scope.isShowGuideImage = false;
            }

            $scope.onDragLeft = function () {
                $scope.bounceOutLeft = 'bounceOutLeft';
                setTimeout(function () {
                    $scope.isShowGuideImage = false;
                    localStorage["guideImage"] = "hide"
                }, 1300);
            };
        }

        function ionLoad() {
            return {
                show: function (msg) {
                    msg=msg||'';
                    $ionicLoading.show({
                        template: '<ion-spinner icon="ios-small"></ion-spinner><h6>' + msg + '</h6>'
                    });
                },
                showNoBg: function (msg) {
                    msg=msg||'';
                    $ionicLoading.show({
                        template: '<ion-spinner icon="ios-small"></ion-spinner><h6>' + msg + '</h6>',
                        noBackdrop:false
                    });
                },
                hide: function () {
                    $ionicLoading.hide();
                }
            }
        }

        alert($cordovaDevice.getVersion());
        if(ionic.Platform.isIOS()){
            if($cordovaDevice.getVersion() < 7.0){
            setTimeout(function(){
                    angular.element(document.getElementsByTagName("body")).removeClass("platform-ios").addClass("platform-android");
            },1000);
            }
        }
    }])
});





