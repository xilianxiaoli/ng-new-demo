define([_serverURL + 'modules/home/_module.js'], function (module) {
    module.controller('menuCtrl', ['$scope', '$rootScope','$ionicModal', 'appUpdate', function ($scope, $rootScope, $ionicModal, appUpdate) {

           /* /!** 消息滚动 **!/
            $scope.myGod = function(id,w,n){
                var box=document.getElementById(id),can=true,w=w||1500,fq=fq||10,n=n==-1?-1:1;
                box.innerHTML+=box.innerHTML;
                box.onmouseover=function(){can=false};
                box.onmouseout=function(){can=true};
                var max=parseInt(box.scrollHeight/2);
                new function (){
                    var stop=box.scrollTop%18==0&&!can;
                    if(!stop){
                        var set=n>0?[max,0]:[0,max];
                        box.scrollTop==set[0]?box.scrollTop=set[1]:box.scrollTop+=n;
                    }
                    setTimeout(arguments.callee,box.scrollTop%18?fq:w);
                };
            };

            $scope.myGod('div4',1500);*/

            // 创建并载入模型
            /*$ionicModal.fromTemplateUrl('new-task.html', function(modal) {
                $scope.taskModal = modal;
            }, {
                scope: $scope,
                animation: 'slide-in-up'
            });

            // 打开新增的模型
            $scope.newTask = function() {
                $scope.taskModal.show();
            };

            // 关闭新增的模型
            $scope.closeNewTask = function() {
                $scope.taskModal.hide();
            };
*/

            $scope.appVersion = "0.1.6";
            if(ionic.Platform.isWebView()){
                cordova.getAppVersion.getVersionNumber().then(function (version) {
                    $scope.appVersion = version;
                });
            }

            /** 功能介绍 **/
            $scope.subtool = function () {
                $('#subtool').slideToggle(30);

            };

            /**
             * 自动检查更新
             */
            if (ionic.Platform.isWebView() &&  localStorage["guideImage"] == "hide") {
                console.log("版本更新操作");
                appUpdate.checkUpdate().then(function () {
                    $rootScope.appNewVersionTip = true;
                });
            }

            /**
             * 手动更新
             */
            $scope.AppUpdate = function(){
                appUpdate.checkUpdate();
            }

        }]
    )
});





