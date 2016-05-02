/**
 * 用户登录、注册控制器
 */
define([_serverURL + 'modules/user/_module.js', 'MD5'], function (module) {
    module.controller('login-registerCtrl', ['$scope', 'iGloab', 'intDataService', '$ionicPopup', '$state', '$interval', '$stateParams', '$ionicHistory', '$ionicModal','$rootScope','userLogic',function ($scope, iGloab, intDataService, $ionicPopup, $state, $interval, $stateParams, $ionicHistory, $ionicModal,$rootScope,userLogic) {



        $scope.loginUser = {
            phone: '',
            pwd: '',
            isSavePwd: false
        };
        $scope.localUser = {};

        $scope.phone = $stateParams.phone;

        //初始化登录用户
        if (localStorage['currentUser'] != undefined) {
            $scope.loginUser = JSON.parse(localStorage['currentUser']);
        }

        $scope.hideUserList = false;

        $scope.userLogin = function () {
            if ($scope.loginUser.phone == "" || !$scope.loginUser.phone) {
                plugins.toast.showShortCenter('手机号不为空!');
                return
            }
            if ($scope.loginUser.pwd == "" || !$scope.loginUser.pwd) {
                plugins.toast.showShortCenter('密码不为空!');
                return
            }
            userLogic.loginReg.login($scope.loginUser).then(function(){
                $scope.$emit('loginSuccess', $scope.loginUser);  //发送广播
                if($ionicHistory.backView()){
                    $ionicHistory.goBack();
                } else{
                    location.href = "#/home/menu";
                }
            });

        };


        /**
         * 清除用户记录
         */
        $scope.clearHis = function (loginUser) {
            iGloab.confirmPopup('确认删除该用户记录?','取消','确定').then(function(){
                userLogic.indexDBUser.removeUser(loginUser.phone, function () {
                    $scope.$apply($scope.loginUser = {});
                }, function () {
                    alert("删除失败");
                });
            })
        };

        /**
         * 选中用户登录
         */
        $scope.chooseUser = function (data) {
            $scope.loginUser = data;
            $scope.hideUserList = !$scope.hideUserList;
            $("#uhl").slideUp(50);
        };

        /**
         * 查询本地已记录的用户账号
         */
        $scope.showUserHisList = function () {
            $scope.hideUserList = !$scope.hideUserList;
            userLogic.indexDBUser.queryAllUser().then(function (data) {
                $scope.localUser = data;
                $("#uhl").slideToggle(50);
            });
        };


        $(document).bind('click', function (e) {
            if ($ionicHistory.currentStateName() == 'home.userLogin' && $scope.hideUserList && $scope.localUser.length !=0) {
                var e = e || window.event; //浏览器兼容性
                var elem = e.target || e.srcElement;
                var isHide = true;
                while (elem) { //循环判断至跟节点，防止点击的是div子元素
                    if (elem.id && elem.id === 'uhl' || elem.id && elem.id === 'showBtn') {
                        isHide = false;
                        return;
                    }
                    elem = elem.parentNode;
                }
                if (isHide) {
                    $scope.$apply($scope.hideUserList = false);
                    $("#uhl").slideUp(50);
                }
            }
        });

        $scope.loginGoBackView  = function(){
            if($ionicHistory.backView()){
                if($ionicHistory.backView().stateName == "home.menu"){
                    iGloab.toggleRightSideMenu();
                }
                $ionicHistory.goBack();
            } else{
                iGloab.toggleRightSideMenu();
                location.href = "#/home/menu";
            }
        };


        $scope.resetUser = {};
        $scope.reSetPassword = function () {
            userLogic.loginReg.reSetPassword($scope.resetUser).then(function(){
                //发送短信验证码 获取手机验证码的工作密钥
                var phone = $scope.resetUser.phone,
                    workKey = hex_md5(phone + "" + $rootScope.appWorkKey + "zstgetIdentifyCode"),
                    reSetoption = {
                        phone: phone,
                        workKey: workKey
                };
                userLogic.loginReg.getIdentifyCode(reSetoption).then(function(){
                    $state.go('home.userReg2', {phone: phone})
                },function(){
                    $scope.getImgCode();
                });
            },function(){
                $scope.getImgCode();  //重新获取验证码
            });

        };



        $scope.regUser = {};
        $scope.userRegister1 = function () {
            if (!_checkMobile($scope.regUser.phone)) {
                plugins.toast.showShortCenter("手机号不合法");
                return;
            } else if ($scope.regUser.pwd.length < 6 || $scope.regUser.pwd.length > 16) {
                plugins.toast.showShortCenter("密码长度6~16位");
                return;
            } else if ($scope.regUser.rePwd != $scope.regUser.pwd) {
                plugins.toast.showShortCenter("两次密码输入不一致");
                return;
            }

            var encryptPwd = hex_md5($scope.regUser.pwd),   //MD5密码加密处理
                workKey = hex_md5($scope.regUser.phone + "" + encryptPwd + $rootScope.appWorkKey + "zstregister"),
                /**
                 * 判断是否已经填写中山通卡号
                 */
                option = {
                    phone: $scope.regUser.phone,
                    card: $scope.regUser.card,
                    password: encryptPwd,
                    imageCode: $scope.regUser.imgCode,
                    workKey: workKey
                };
            if ($scope.regUser.card == null || $scope.regUser.card == undefined) {
                delete option.card;
            } else if($scope.regUser.card.toString().length != 9) {
                plugins.toast.showShortCenter('中山通卡号长度不正确');
                return;
            }
            userLogic.loginReg.reg(option).then(function(result){
                userLogic.loginReg.getIdentifyCode(result).then(function(){
                    $state.go('home.userReg2', {phone: $scope.regUser.phone})
                },function(){
                    $scope.getImgCode();
                });
            },function(){
                $scope.getImgCode();
            });
        };

        /**
         * 正则表达式判断手机号码合法性
         * @param phone
         * @returns {boolean}
         * @private
         */
        function _checkMobile(phone) {
            var reg = /^0?1[3|4|5|8][0-9]\d{8}$/;
            var re = new RegExp(reg);
            if (re.test(phone)) {
                return true;
            } else {
                return false;
            }
        }

        $ionicModal.fromTemplateUrl('modules/user/templates/protocol.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });


        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

        $scope.closeProtocol = function () {
            $scope.modal.hide();
        };


        /**
         * 查看用户注册协议
         */
        $scope.readProtocol = function () {
            $scope.modal.show();
        };

        $scope.msgValidate = {
            msgCode: '',
            imgCodeStr: ''
        };

        //60s倒计时效果
        $scope.timeStr = "(60)";
        $scope.clock = function () {
            $scope.reSend = true;
            var num = 60;
            var temp = $interval(function () {
                num--;
                if (num < 10) {
                    num = "0" + num;
                    $scope.timeStr = "(" + num + ")";
                }
                if (num == "00") {
                    $scope.timeStr = "";
                    $scope.reSend = false;
                    $interval.cancel(temp);
                } else {
                    $scope.timeStr = "(" + num + ")";
                }
            }, 1000);
        };


        /**
         * 对短信验证码进行校验 6位手机数字验证码
         */
        $scope.valiMsgCode = function () {
            console.log($scope.msgValidate.msgCode);
            userLogic.loginReg.valiMsgCode($stateParams.phone,$scope.msgValidate.msgCode).then(function(){
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true,
                    historyRoot: false
                });
                $state.go('home.userReg3');
            });
        };


        /**
         * 重新发送短信验证码
         */
        $scope.reSendMsgCode = function () {
            //显示对话框重新发送
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="msgValidate.imgCodeStr" placeholder="填写图形验证码" class="popupInput"><img ng-src="{{imgCodeSrc}}" class="imgCodeRe" alt="点击刷新" ng-init="getImgCode()" ng-click="getImgCode()"/>',
                title: '获取短信验证码',
                scope: $scope,
                buttons: [
                    {text: '取消'},
                    {
                        text: '发送',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!$scope.msgValidate.imgCodeStr) {
                                e.preventDefault();
                            } else {
                                return $scope.msgValidate.imgCodeStr;
                            }
                        }
                    }
                ]
            });
            myPopup.then(function (res) {
                if (!$scope.msgValidate.imgCodeStr || $scope.msgValidate.imgCodeStr == "") {
                    return;
                }
                var workKey = hex_md5($stateParams.phone + "" + $rootScope.appWorkKey + "zstgetIdentifyCode");
                    reOption = {
                    phone: $stateParams.phone,
                    workKey: workKey,
                    imageCode: $scope.msgValidate.imgCodeStr   //图形验证码
                };
                userLogic.loginReg.getIdentifyCode(reOption).then(function(){
                    $scope.clock();
                });
            });


        };


        /**
         * 获取图片验证码
         */
        $scope.getImgCode = function () {
            $scope.imgCodeSrc = "";
            intDataService.getImageCode({}).then(function () {
                $scope.imgCodeSrc = "http://218.204.174.24:8052/ZST/orienteering/getImageCode/t=" + Date.parse(new Date());
            });
        };


        $scope.goLogin = function(){
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true,
                historyRoot: true
            });
            window.location = '#/home/userLogin';
        }

    }]);

});




