/**
 *
 * 用户逻辑业务服务
 */
define([_serverURL + 'modules/user/_module.js', 'MD5'], function (module) {
    module.factory("userLogic", ['database', 'intDataService', '$q', '$rootScope', 'iGloab', function (database, intDataService, $q, $rootScope, iGloab) {

        /**
         * 用户本地数据操作
         * @constructor
         */
        function IndexDBUser() {
            // 删除
            this.removeUser = function (key, success, error) {
                database.del("userInfo", key, success, error);
            };
            // 更新
            this.updateUser = function (CustomerInfo) {
                return database.update("userInfo", CustomerInfo);
            };
            // 查询
            this.queryAllUser = function () {
                return database.select("userInfo", null);
            }
        }

        function LoginReg() {
            /**
             * 用户登录
             * @param loginParam
             */
            this.login = function (loginParam) {
                // MD5密码加密处理
                var deferred = $q.defer(),
                    encryptPwd = hex_md5(loginParam.pwd),
                // 登录的工作密钥获取方式为 Phone+password+workKey+“zstlogin” 然后再MD5处理
                    loginWorkKey = hex_md5(loginParam.phone + "" + encryptPwd + $rootScope.appWorkKey + "zstlogin");
                // 调用第三方登录接口进行验证
                intDataService.userLogin({
                    phone: loginParam.phone,
                    password: encryptPwd,
                    workKey: loginWorkKey
                }).then(function (data) {
                    switch (data.result) {
                        case '01': //登录成功
                            //localStorage当前用户信息
                            if (loginParam.isSavePwd) {
                                localStorage['currentUser'] = JSON.stringify(loginParam);
                            } else {
                                loginParam.pwd = ""
                            }
                            //indexDB保存登录的用户信息
                            new IndexDBUser().updateUser(loginParam).then(function () {
                                console.log("用户信息保存成功")
                            }, function () {
                                console.log("用户信息保存失败");
                            });
                            deferred.resolve();
                            break;
                        case '04':
                            plugins.toast.showShortCenter('请输入合法的手机号');
                            break;
                        case '08':
                            plugins.toast.showShortCenter('该手机号未注册!');
                            break;
                        case '09':
                            plugins.toast.showShortCenter('密码错误!');
                            break;
                        case "03":
                        case "05":
                            iGloab.getWorkKey();
                            plugins.toast.showShortCenter("访问失败、请重试!");
                            break;
                        default:
                            plugins.toast.showShortCenter('登录失败');
                    }
                });
                return deferred.promise;
            };

            /**
             * 用户注册
             * @param regParam  登录参数
             * @returns {*}    promise
             */
            this.reg = function (regParam) {
                var deferred = $q.defer(),
                    workKey = hex_md5(regParam.phone + "" + $rootScope.appWorkKey + "zstgetIdentifyCode");
                // 发送手机验证码参数
                    paramObj = {
                        phone: regParam.phone,
                        workKey: workKey
                };
                intDataService.userReg(regParam).then(function (re) {
                    switch (re.result) {
                        case "01":
                            deferred.resolve(paramObj);
                            //执行发送短信验证码
                            break;
                        case "03":
                        case "05":
                            iGloab.getWorkKey();
                            plugins.toast.showShortCenter("访问失败、请重试!");
                            break;
                        case "06":
                            plugins.toast.showShortCenter("验证码错误");
                            break;
                        case"07":
                            plugins.toast.showShortCenter("手机号已经注册");
                            break;
                        case "23":
                            plugins.toast.showShortCenter("请重新生成验证码");
                            break;
                        default :
                            plugins.toast.showShortCenter("请求错误!");
                            break;
                    }
                    deferred.reject();
                });
                return deferred.promise;
            }
        }

        /**
         * 获取手机验证码
         * @param option
         * @returns {*}
         */
        LoginReg.prototype.getIdentifyCode = function (option) {
            var deferred = $q.defer();
            intDataService.getIdentifyCode(option).then(function (re) {
                switch (re.result) {
                    case "01":
                        plugins.toast.showShortCenter("短信验证码已发送");
                        deferred.resolve();
                        break;
                    case "06":
                        plugins.toast.showShortCenter("图形验证码错误");
                        break;
                    default:
                        plugins.toast.showShortCenter("验证码发送失败");
                        break;
                }
                deferred.reject();  //不管验证结果如何、都需要重新生成图形验证码
            });
            return deferred.promise;
        };

        /**
         * 验证手机验证码
         * @param phone
         * @param msgCode
         * @returns {*}
         */
        LoginReg.prototype.valiMsgCode = function (phone,msgCode) {
            var deferred = $q.defer();
            //验证手机短信的工作密钥
                workKey = hex_md5(phone + "" + $rootScope.appWorkKey + "zstidentifyPhone");

            intDataService.identifyPhone({
                phone: phone,
                workKey: workKey,
                code: msgCode
            }).then(function (re) {
                console.log("短信验证码结果====" + re.result);
                    switch (re.result) {
                        case "01":
                            deferred.resolve();
                            break;
                        case "03":
                        case "05":
                            iGloab.getWorkKey();
                            plugins.toast.showShortCenter("访问失败、请重试!");
                            break;
                        case "15":
                            plugins.toast.showShortCenter("短信验证码已过期");
                            break;
                        case "16":
                            plugins.toast.showShortCenter("短信验证码错误");
                            break;
                        default :
                            plugins.toast.showShortCenter("验证失败");
                            break;
                    }
                });
            return deferred.promise;
        };

        /**
         * 重置密码
         * @param resetParam
         * @returns {*}
         */
        LoginReg.prototype.reSetPassword = function (resetParam) {
            var deferred = $q.defer(),
                encryptNewPassword = hex_md5(resetParam.pwd);
                phone = resetParam.phone;
                workKey = hex_md5(phone + "" + encryptNewPassword + "" + $rootScope.appWorkKey + "zstsetNewPassword");
            intDataService.setNewPassword({
                phone: phone,
                newPassword: encryptNewPassword,
                workKey: workKey,
                imageCode: resetParam.imgCode
            }).then(function (re) {
                console.log("结果===" + re.result);
                switch (re.result) {
                    case "01":
                        deferred.resolve();
                        break;
                    case "03":
                    case "05":
                        iGloab.getWorkKey();
                        plugins.toast.showShortCenter("访问失败、请重试!");
                        break;
                    case "06":
                        plugins.toast.showShortCenter("图形验证码错误!");
                        break;
                    case "08":
                        plugins.toast.showShortCenter("用户未注册!");
                        break;
                    default:
                        plugins.toast.showShortCenter("系统繁忙、请稍后再试!");
                        break
                }
                deferred.reject();

            });
            return deferred.promise;
        };

        /**
         * 用户修改密码
         * @param param   参数
         * @returns {*}   promise
         */
        LoginReg.prototype.userModifyPwd = function(param){
            var deferred = $q.defer();
                phone = param.phone;
                oldPwdEncrypt = hex_md5(param.pwd);
                newPwdEncrypt = hex_md5(param.newPwd);
                workKey = hex_md5(phone +""+oldPwdEncrypt+""+ $rootScope.appWorkKey + "zstchangePass");
            intDataService.userModifyPwd({
                phone:phone,
                password:oldPwdEncrypt,
                newPassword:newPwdEncrypt,
                workKey:workKey
            }).then(function(re){
                switch (re.result){
                    case '01':
                        deferred.resolve();
                        break;
                    case '09':
                        plugins.toast.showShortCenter("旧密码错误");
                        break;
                    default:
                        plugins.toast.showShortCenter("连接失败、请稍后再试!");
                        break
                }
            });
            return deferred.promise;
        };

        return {
            indexDBUser: new IndexDBUser(),
            loginReg: new LoginReg()
        }


    }]);
});


