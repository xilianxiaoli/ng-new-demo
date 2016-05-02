/*
 * 功能：数据库服务
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.factory("database", ['$rootScope', '$q', function ($rootScope, $q) {
        /*todo 变量声明-------------------------------------------------------*/
        var db = null,//数据库对象
            dbRequest = null;//数据库请求对象
        /*todo 函数调用-------------------------------------------------------*/

        _createDB();

        /*todo 私有函数-------------------------------------------------------*/

        /**
         * @function 创建数据库
         * @returns {*}链式调用承诺对象
         * @private
         */
        function _createDB() {
            var dbVersion = 1;
            var dbDefer = $q.defer();
            //"||window.shimIndexedDB"是为了修复ios8.1.1的bug (indexedDB被置为null，且权限为只读，这种搞法太恶心了)
            var indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
            //检查兼容性
            if (typeof indexDB == "undefined") {
                alert("Your system does not support webSQL and indexdDB!");
                return
            }
            dbRequest = indexDB.open("zsTong", dbVersion);
            //创建数据库
            dbRequest.onsuccess = function (event) {
                db = event.target.result;
                dbDefer.resolve();
                console.log("打开数据库完成!");
                $rootScope.$broadcast('dbOpened');
            };
            dbRequest.onerror = function () {
                console.error("打开数据库时发生未知异常！");
                dbDefer.reject();
            };
            dbRequest.onupgradeneeded = function (event) {
                db = event.target.result;
                //创建数据库及引索
                (function () {
                    /*//中山通——网点
                     if (!db.objectStoreNames.contains("zstStation")) {
                     db.createObjectStore("zstStation", {keyPath: "id"});
                     }
                     //中山通——公告
                     if (!db.objectStoreNames.contains("zstNotice")) {
                     db.createObjectStore("zstNotice", {keyPath: "id"});
                     }
                     //中山通——服务指南
                     if (!db.objectStoreNames.contains("zstGuide")) {
                     db.createObjectStore("zstGuide", {keyPath: "id"});//中山通公告，无索引
                     }
                     //公交——线路
                     if (!db.objectStoreNames.contains("busLine")) {
                     db.createObjectStore("busLine", {keyPath: "id"});
                     }
                     //公交——站点
                     if (!db.objectStoreNames.contains("busStation")) {
                     db.createObjectStore("busStation", {keyPath: "id"});
                     }*/
                    //自行车——站点
                    if (!db.objectStoreNames.contains("bikeStation")) {
                        db.createObjectStore("bikeStation", {keyPath: "id"});
                    }
                    //房产信息
                    if (!db.objectStoreNames.contains("estateData")) {
                        db.createObjectStore("estateData", {keyPath: "id"});
                    }
                    //用户登录账号
                    if (!db.objectStoreNames.contains("userInfo")) {
                        db.createObjectStore('userInfo', {keyPath: "phone"});
                    }
                }());
                console.log("创建数据库完成!");
                $rootScope.$broadcast('dbCreated');

            };
            return dbDefer.promise;
        }

        /**
         * @function 解析条件JSON
         * @param condition 条件 json，如：{'id':[1,20],'name':'Micheal Jordan'}
         * @returns {string} 条件字符串
         * @private
         */
        function _condition(condition) {
            var conStr = '';
            angular.forEach(condition, function (value, key) {
                switch (true){
                    case angular.isArray(value) && value.length == 2://数组，代表范围
                        conStr += "(each." + key + ">=" + value[0] + "&&each." + key + "<=" + value[1] + ")";
                        break;
                    case angular.isString(value)://字符串
                        conStr += "(each." + key + "=='" + value+"'||each."+key+".indexOf('"+value+"')>=0)";
                        break;
                    case angular.isNumber(value)://数字
                        conStr += "(each." + key + "==" + value+")";
                        break;
                }
                if(conStr!==''){
                    conStr += "&&"
                }
            });
            conStr = conStr.substring(0, conStr.length - 2);
            return conStr;
        }

        /**
         * @function 将json格式的属性值设置到对应的对象上
         * @param valueJson json格式的属性值, 如：{name:'香格里拉酒店1',address:'广东省中山市中山市市辖区豪杰街'}
         * @private
         */
        function _setValue(valueJson) {
            var _self = this;
            angular.forEach(valueJson, function (value, key) {
                _self[key] = value;
            })
        }

        /**
         * @function 查询所有
         * @param tName 表名
         * @param key 主键/可选
         * @returns {*} promise
         * @private
         */
        function _select(tName, key) {
            /*var tempResult = [];
             var selectDeferred = $q.defer(),
             transaction = db.transaction([tName], "readonly");
             var stores = transaction.objectStore(tName);
             var request = stores.openCursor();
             request.onsuccess = function (e) {
             var cursor = e.target.result;
             if (cursor) {
             tempResult.push(cursor.value);
             cursor.continue();
             } else {
             selectDeferred.resolve(tempResult);
             }
             };
             request.onerror = function (e) {
             selectDeferred.reject(e);
             };
             return selectDeferred.promise;*/
            //---------
            var tempResult = [];
            var _selectDeferred = $q.defer(),
                transaction = db.transaction([tName], "readonly");
            var stores = transaction.objectStore(tName),
                request = null;
            if (!key) {//查询全部
                request = stores.openCursor();
                request.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        tempResult.push(cursor.value);
                        cursor.continue();
                    } else {
                        _selectDeferred.resolve(tempResult);
                    }
                };
            } else {//主键单值查询
                request = stores.get(key);
                request.onsuccess = function (e) {
                    _selectDeferred.resolve(request.result);
                };
            }
            request.onerror = function (e) {
                _selectDeferred.reject(e);
            };
            return _selectDeferred.promise;
        }

        /**
         * @function 改
         * @param tName 表名/必选
         * @param obj 数据对象/必选
         * @returns {*}链式调用承诺对象
         * @explain 如果不存在需要更新的数据，则添加进去
         * @private
         */
        function _update(tName, obj) {
            var _updateDeferred = $q.defer(),
                transaction = db.transaction([tName], "readwrite");
            transaction.oncomplete = function () {
                _updateDeferred.resolve()
            };
            transaction.onerror = function () {
                _updateDeferred.reject();
            };
            transaction.objectStore(tName).put(obj);
            return _updateDeferred.promise;
        }

        /*todo 公共函数-------------------------------------------------------*/

        /**
         * @function 增
         * @param tName 表名/必选
         * @param obj 要存储的对象/必选
         * @returns {*}链式调用承诺对象
         */
        function add(tName, obj) {
            var addDeferred = $q.defer(),
                transaction = db.transaction([tName], "readwrite");
            transaction.oncomplete = function () {
                addDeferred.resolve();
            };
            transaction.onerror = function () {
                addDeferred.reject();
            };
            transaction.objectStore(tName).add(obj);
            return addDeferred.promise;
        }

        /**
         * @function 删
         * @param tName 表名/必选
         * @param key 主键值/必选--为空字符串表示删除表中所有数据
         * @param suc 成功回调
         * @param err 失败回调
         * @returns {*}链式调用承诺对象
         * @explain 只支持按主键单值删除/空字符串删除
         */
        function del(tName, key, suc, err) {
            suc = suc || angular.noop;
            err = err || angular.noop;
            var delDeferred = $q.defer(),
                transaction = db.transaction([tName], "readwrite");
            transaction.oncomplete = function () {
                console.log("remove success!");
                suc();
                delDeferred.resolve('对数据表“' + tName + '”删除数据成功一次');
            };
            transaction.onerror = function () {
                console.error("删除数据时发生未知错误!");
                err();
                delDeferred.reject('对数据表“' + tName + '”删除数据失败一次');
            };
            if (key === '') {//删除所有
                transaction.objectStore(tName).clear()
            } else {//删除某条
                transaction.objectStore(tName).delete(key);
            }
            return delDeferred.promise;
        }

        /**
         * @function 查
         * @param tName 表名
         * @param condition 条件/可选 全部用null json，如：{'id':[1,20],'name':'Micheal Jordan'}
         * @param skip 跳过
         * @param top 选择条数
         */
        function select(tName, condition, skip, top) {
            var selectIdxDeferred = $q.defer();
            skip = skip || 0;
            top = top || Number.MAX_VALUE;
            condition = condition || null;
            _select(tName, '').then(function (data) {
                var conStr = _condition(condition);
                if (condition != null&&conStr.length!=0) {
                    var targetArr = [];
                    angular.forEach(data, function (each) {
                        if (eval(conStr)) {
                            targetArr.push(each);
                        }
                    });
                    targetArr = targetArr.slice(skip, skip + top);
                    selectIdxDeferred.resolve(targetArr);
                } else {
                    selectIdxDeferred.resolve(data.slice(skip, skip + top));
                }
            }, function (e) {
                selectIdxDeferred.reject(e);
            });
            return selectIdxDeferred.promise;
        }

        /**
         * @function 改
         * @param tName 表名/必选
         * @param key 主键/必选
         * @param value 要更新的字段json {name:'香格里拉酒店111'}/要更新的对象(直接更新对象)
         * @returns {*}链式调用承诺对象
         * @explain 如果不存在需要更新的数据，则添加进去
         */
        function update(tName, value, key) {
            if (angular.isObject(key)) {
                throw 'update调用时参数key有错'
            }
            if (arguments.length == 3) {
                return _select(tName, key).then(function (item) {
                    _setValue.call(item, value);
                    _update('bikeStation', item);
                })
            } else if (arguments.length == 2) {
                return _update(tName, value)
            }

        }

        /**
         * @function 清空表
         * @param tName 表名/必选
         * @returns {*}链式调用承诺对象
         * @private
         */
        function clear(tName) {
            var _updateDeferred = $q.defer();
            var transaction = db.transaction([tName], "readwrite");
            transaction.oncomplete = function () {
                _updateDeferred.resolve()
            };
            transaction.onerror = function () {
                _updateDeferred.reject();
            };
            transaction.objectStore(tName).clear();
            return _updateDeferred.promise;
        }

        /*todo 暴露接口-------------------------------------------------------*/
        return {
            "add": add,//增
            "del": del,//删
            "select": select,//查
            "update": update,//改
            "clear": clear,//清空
            "findBikeItemById":_select
        };
    }
    ]);
});


