/**
 * 模块名称：initBikeEstate
 * 功能：数据库初始化和更新
 * 创建时间： 2015/8/17.
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.service("initBikeEstate", ['database', '$rootScope', 'bikeStation', 'estateData','$http','$q','map', function (database, $rootScope, bikeStation, estateData,$http,$q,map) {
        /*todo 变量声明*************************************************************/
        var isMobile=ionic.Platform.isWebView();
        if(isMobile){
            var levelBikeUrl = ionic.Platform.isAndroid() ? cordova.file.applicationStorageDirectory + "bicyclexy.json" : cordova.file.documentsDirectory + "bicyclexy.json";
            var levelEstateUrl = ionic.Platform.isAndroid() ? cordova.file.applicationStorageDirectory + "housexy.json" : cordova.file.documentsDirectory + "housexy.json";
        }
        /*todo 函数调用*************************************************************/
        _init();
        /*todo 私有函数*************************************************************/
        //自启动函数
        function _init() {
            //非移动设备用于pc调试，直接使用应数据
            if(!isMobile){
                $rootScope.$on('dbOpened', function () {
                    if(localStorage['guideImage'] == 'hide'){
                        _updBikeToDB(bikeStation);
                    } else{
                        _firstAddBikeTDB(bikeStation);

                    }
                    _addEstateToDB();
                });
                return;
            }
            map.fillBikeEstateDataInView();
            //移动设备首次运行将远程下载的最新数据add到数据库
            $rootScope.$on('downLoadSuccessFirst', function () {
                console.log("首次下载");
                _getLocalBike()
                    .then(function (data) {_firstAddBikeTDB(data);})
                    .then(function(){
                        $rootScope.bikeNotAplly=1
                    });
                _getLocalEstate().then(function (data) {_addEstateToDB(data);});
                map.fillBikeEstateDataInView();
            });
            //移动设备非首次运行将远程下载的最新数据update到数据库
            $rootScope.$on('downLoadSuccess', function () {
                console.log("非首次下载");
                _getLocalBike()
                    .then(function (data) {_updBikeToDB(data)})//用从梁阳处下载的数据更新本地自行车数据库
                    .then(function (){return _getLocalEstate();}) //用从梁阳处下载的数据更新本地物业租赁数据库
                    .then(function (data) {_updEstateToDB(data);})
                    .then(function(){
                        $rootScope.bikeNotAplly=1
                    });
                map.fillBikeEstateDataInView();
            });

        }

        //获取最新下载的物业租赁数据
        function _getLocalBike() {
            var tempData = {};
            var _getLocalBikeDeferred = $q.defer();
            $http.get(levelBikeUrl).then(function (response) {
                tempData = response.data[19];
                //console.log('_getLocalBike',tempData);
                _getLocalBikeDeferred.resolve(tempData);
            }, function (e) {
                _getLocalBikeDeferred.reject(e);
            });
            return _getLocalBikeDeferred.promise;
        }

        //获得最新下载的自行车数据
        function _getLocalEstate() {
            var tempData = {};
            var _getLocalEstateDeferred = $q.defer();
            $http.get(levelEstateUrl).then(function (response) {
                tempData = response.data[19];
                //console.log('_getLocalEstate',tempData);
                _getLocalEstateDeferred.resolve(tempData);
            }, function (e) {
                _getLocalEstateDeferred.reject(e);
            });
            return _getLocalEstateDeferred.promise;
        }

        /**
         * @function 添加自行车数据到本地数据库
         * @param data 被放入数据库的对象数组
         * @private
         */
        function _addBikeToDB(data) {
            console.log(data);
            data=data||bikeStation;
            console.time('初始化自行车数据库耗时：');
            var tempStr = '';
            var count = 1;
            angular.forEach(data, function (each) {
                each=_eachShim(each);
                if (tempStr == '') {
                    tempStr = "database.update('bikeStation'," + JSON.stringify(each) + ")"
                    //tempStr = "database.add('bikeStation'," + JSON.stringify(each) + ")"
                } else {
                    tempStr += ".then(function(){/*console.log('自行车第" + (count++) + "条');*/database.update('bikeStation'," + JSON.stringify(each) + ")})";
                    //tempStr += ".then(function(){/*console.log('自行车第" + (count++) + "条');*/database.add('bikeStation'," + JSON.stringify(each) + ")})";
                }
            });
            tempStr += ".then(function(){console.timeEnd('初始化自行车数据库耗时：')})";
            eval(tempStr);
        }

        /**
         * @function 添加物业租赁数据到本地数据库
         * @private
         */
        function _addEstateToDB(data) {
            data=data||estateData;
            console.time('初始化物业数据库耗时：');
            var tempStr = '';
            var count = 1;
            angular.forEach(data, function (each) {
                if (tempStr == '') {
                    tempStr = "database.add('estateData'," + JSON.stringify(each) + ")"
                } else {
                    tempStr += ".then(function(){/*console.log('物业第" + (count++) + "条');*/database.add('estateData'," + JSON.stringify(each) + ")})";
                }
            });
            tempStr += ".then(function(){console.timeEnd('初始化物业数据库耗时：')})";
            eval(tempStr);
        }

        /**
         * 首次下载将数据更新到数据库
         * @private
         */
        function _firstAddBikeTDB(data){
            console.log("首次将数据更新到数据库");
            if(data.length==0){console.error('替换数据库内容的数组不能为空！');return}
            angular.forEach(data, function (item) {
                var newItem = _eachShim(item);
                database.update('bikeStation',newItem);
            });
        }

        /**
         * @function 更新自行车数据到本地数据库
         * @private
         */
        function _updBikeToDB(data){
            console.log('下载json文件更新到数据库：');
            if(data.length==0){console.error('替换数据库内容的数组不能为空！');return}
            angular.forEach(data, function (item) {
                var newItem = _eachShim(item);
                delete newItem.often;
                //console.log(newItem);
                database.update('bikeStation',newItem,newItem.id);
            });
            /*var often =[];
             database.select('bikeStation',{often:1})
             .then(function(data){
             often=data;
             })
             .then(function(){
             console.log("dataBaseClear");
             //database.clear('bikeStation');
             })
             .then(function(){
             _addBikeToDB(data);
             })
             .then(function(){
             //_returnBikeOften(often);

             })
             .then(function(){
             console.timeEnd('更新自行车数据库耗时：')
             });*/

        }

        /**
         * @function 还原自行车的常用属性
         * @param data 常用自行车
         * @private
         */
        function _returnBikeOften(data){
            angular.forEach(data,function(each){
                database.update('bikeStation',{often:each.often},each.id);
            });
        }





        /**
         * @function 更新物业租赁数据到本地数据库
         * @explain:todo 物业租赁更新方式和自行车更新方式不一样，物业是全部字段替换以前的数据，自行车是部分字段替换以前的数据
         * @private
         */
        function _updEstateToDB(data){
            data=data||[];
            console.time('初始化物业数据库耗时：');
            database.clear('estateData').then(function(){
                _addEstateToDB(data);
            });
        }

        /**
         * @function 删除多余属性
         * @param each
         */
        function _eachShim(each){
            var iReturn={};
            iReturn.id=each.id;
            iReturn.name=each.name;
            iReturn.address=each.address;
            iReturn.lng=each.lng;
            iReturn.lat=each.lat;
            iReturn.capacity=each.capacity;
            iReturn.availBike=each.availBike;
            iReturn.often=0;
            return iReturn;
        }

        /*todo 公共函数*************************************************************/





    }]);
});


