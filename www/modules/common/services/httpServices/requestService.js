/**
 * @desc   用户模块和定向越野http数据通信服务
 * @author ...
 * @date   2015-07-09
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.factory('intDataService', ['$http','$q','$rootScope','CONFIG','database',function ($http,$q,$rootScope,CONFIG,database) {


        /**
         * @function post请求
         * @param url  请求地址
         * @param data 请求参数对象
         */
        function postData(url, data) {
            data = data || {};
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: url,
                data: data,
                timeout: 10000
            }).success(function (data, status) {
                console.log(data);
                deferred.resolve(data, status);
            }).error(function (data, status) {
                deferred.reject(data, status);
            });
            return deferred.promise;
        }


        /**
         * 定向越野，用户数据接口服务方法
         * @param ctrlType     操作类型
         * @param param     操作类型
         * @param isShowLoading  是否显示加载动画
         * @param tipText        加载提示文本
         * @param isShowErrorMsg        请求错误消息
         */
        function activityUserPost(ctrlType, param,isShowLoading,tipText,isShowErrorMsg){
            console.log(CONFIG.activityUserServerUrl+ctrlType+_objParseStr(param));
            var deferred = $q.defer(),
                url = CONFIG.activityUserServerUrl+ctrlType+_objParseStr(param);
            if(isShowLoading){
                $rootScope.ionLoad.show(tipText);
            }
            postData(url).then(function(data, status){
                console.log(data);
                $rootScope.ionLoad.hide();
                deferred.resolve(data, status);
            },function(data, status){
                $rootScope.ionLoad.hide();
                console.log("请求错误");
                if(isShowErrorMsg){
                    if (navigator.onLine === false) {
                        plugins.toast.showShortCenter('网络已断开!');
                    } else {
                        plugins.toast.showShortCenter('请求失败,请重试');
                    }
                }
                deferred.reject(data, status);
            });
            return deferred.promise;
        }


        var ONE_BIKE = CONFIG.ONE_BIKE,
            BORROW_URL =CONFIG.BORROW_URL,
            Balance_URL = CONFIG.Balance_URL;

        /**
         * 自行车，物业数据请求服务
         * @constructor
         */
        function RequestEstateBike(){
            /**
             * @function 请求自行车卡查询数据
             * @param option
             * @returns {*} 链式调用承诺对象promise
             */
            this.getBikeCard = function(option) {
                var rootOption = {
                    "head": {},
                    "body": option
                };
                return postData(BORROW_URL, rootOption)
            };

            /**
             * @function 请求自行车卡余额数据
             * @param option
             * @returns {*} 链式调用承诺对象promise
             */
            this.getBalance = function(option){
                var rootOption = {
                    "head": {},
                    "body": option
                };
                return postData(Balance_URL, rootOption)
            };


            this.getOneBike = function(id){
                if(!id){
                    console.error('调用getOneBike请求单辆自行车数据是没有id参数，无法完成');
                    return
                }
                var opt=ONE_BIKE+'?id='+id;
                return postData(opt)
            };
            /**
             * 将实施数据添加到数组中的每个对象上，并返回该数组
             * @function  getRealBikesByArr
             * @param data {array} data 对象组成的数组
             * @returns {Object}
             */
            this.getRealBikesByArr = function(data){
                //console.log(data);
                var isFirst = true;
                var values =data;
                angular.forEach(data,function(e,i){
                    getRealBikes(e,i).then(function(json){
                        values = json;
                    },function(){
                        if(isFirst){
//                        console.info('服务器请求错误，无法获取最新信息！');
                            plugins.toast.showShortCenter('服务器请求错误，无法获取最新信息！');
                            isFirst  = false;
                        }
                    });
                });
                return values;
            }
        }

        /**
         * 获取远程自行车实时数据
         * @function _getRealBikes
         * @param {array} e 对象组成的数组
         * @param num 对象在data中的下标
         * @returns {Object} promise
         * @private
         */
        function getRealBikes(e,num){
            //console.log(e);
            //console.log(num);
            var getRealBikesDeferred=$q.defer();
            $http({
                method: 'POST',
                url: ONE_BIKE+'?id='+e.id,
                timeout: 10000
            }).success(function (re, status) {
                var str = re.substr(re.indexOf('=')+1);
                var result = eval("(" + str + ")").station[0];
                e.availBike=result.availBike;
                e.capacity=result.capacity;
               /* eval(result.data);
                isinglebike=isinglebike.station[0];
                data[num].availBike=isinglebike.availBike;
                data[num].capacity=isinglebike.capacity;*/
                //将实时的可借可停数据保存到数据库
                database.update('bikeStation',e,e.id);
                getRealBikesDeferred.resolve(e);
                //getRealBikesDeferred.resolve(data, status);
            }).error(function (data, status) {
                getRealBikesDeferred.reject(data, status);
            });



            return getRealBikesDeferred.promise;
        }


        /**
         * 将对象构成字符串方式提交
         * @param obj
         * @returns {string}
         */
        function _objParseStr(obj) {
            var str = "";
            for (var s in obj) {

                str += s + "=" + obj[s] + "&";
            }
            return str == "" ? "" : "?"+str.substr(0, str.length-1);
        }

        return {

            /**
             * 注册中山通用户
             * @param param   参数
             */
            userReg: function (param) {
                return activityUserPost('register', param,false,'',true);
            },

            /**
             * 登录
             * @param param
             * 登录参数
             * {
             *      phone  手机号
                    password  密码
                    workKey  密钥
             * }
             */
            userLogin: function (param) {
                return activityUserPost('login', param,true,'正在登录',true);
            },

            /**
             * 修改密码
             * @param param   参数
             */
            userModifyPwd: function (param) {
                return activityUserPost('changePass', param,true,'请稍后',true);
            },

            /**
             * 忘记密码
             * @param param   参数
             */
            setNewPassword: function (param) {
                return activityUserPost('setNewPassword', param,false,'',true);
            },

            /**
             * 获取越野点和玩法信息
             * @param param   参数
             */
            getMessage: function (param) {
                return activityUserPost('getMessage', param,false,'',false);
            },


            /**
             * 获取地图信息
             * @param param   参数
             */
            getMapList:function(param){
                return activityUserPost('getMapUrl', param,true,'加载中...',true);
            },

            /**
             * 开始本次定向越野
             * @param param   参数
             */
            activityStart:function(param){
                return activityUserPost('start', param,true,'即将开启...',true);
            },

            activityContinueEvent:function(param){
                return activityUserPost('continueEvent', param,false,'',true);
            },

            /**
             * 完成本次定向越野
             * @param param   参数
             */
            activityComplete:function(param){
                return activityUserPost('complete', param,true,'结束中,请稍后',true);
            },

            /**
             * 二维码信息上传
             * @param param   参数
             */
            barcodeUpload:function(param){
                return activityUserPost('record', param,true,'记录中...',true);
            },

            /**
             * 查询定向越野成绩
             * @param param   参数
             */
            getOneRecord:function(param){
                return activityUserPost('getOneRecord', param,true,'正在查询...',true);
            },

            /**
             * 查询定向越野某时间段内成绩记录数目
             * @param param   参数
             */
            getRecords:function(param){
                return activityUserPost('getRecords', param,true,'正在查询...',true);
            },

            /**
             * 获取当天同一地图参数人数排名
             */
            getTop10InDay:function(param){
                return activityUserPost('getTop10InDay', param,true,'加载中...',true);
            },

            /**
             * 取当前用户近3个月同一地图活动的记录排名
             */
            getMySelfTopIn3Months:function(param){
                return activityUserPost('getMySelfTopIn3Months', param,true,'加载中...',true);
            },

            /**
             * 获取工作密钥 32位字符串
             * @param param   参数  为空、不需要参数
             */
            getWorkKey:function(param){
                return activityUserPost('getWorkKey', param,false,'',false);
            },

            /**
             * 获取图形验证码
             * @param param   参数  为空、不需要参数
             */
            getImageCode:function(param){
                return activityUserPost('getImageCode', param,false,'',true);
            },

            /**
             * 获取手机验证码
             * @param param   参数
             */
            getIdentifyCode:function(param){
                return activityUserPost('getIdentifyCode', param,true,'短信验证码发送中...',true);
            },

            /**
             * 验证手机短信
             * @param param   参数
             */
            identifyPhone:function(param){
                return activityUserPost('identifyPhone', param,false,'',true);
            },

            requestEstateBike:new RequestEstateBike(),
            postData:postData,
            getRealBikes:getRealBikes

        };
    }]);
});