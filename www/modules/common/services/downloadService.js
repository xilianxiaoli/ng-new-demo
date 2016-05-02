/**
 * 文件下载服务
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.factory("downloadService", ['$q','$rootScope','$cordovaFileTransfer','CONFIG',function ($q,$rootScope,$cordovaFileTransfer,CONFIG) {

        /**
         *  下载方法,借助cordova 插件实现
         * @param url   下载链接
         * @param targetPath   存放地址
         * @returns promise
         */
        function download(url,targetPath){
            var deferred = $q.defer();
            $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
                deferred.resolve(result);
            }, function (err) {
                deferred.reject(err);
            }, function (progress) {
                setTimeout(function () {
                    var downLoadProgress = Math.floor((progress.loaded / progress.total) * 100);
                    deferred.notify(downLoadProgress);
                });
            }, false);

            return deferred.promise;

        }

        /**
         * 自行车数据更新
         * @returns {*}
         */
        function bikeDataDownLoad(){
            var targetPath = ionic.Platform.isAndroid() ? cordova.file.applicationStorageDirectory +"bicyclexy.json": cordova.file.documentsDirectory+"bicyclexy.json";
            return download(CONFIG.bikeDataFileUrl,targetPath);
        }

        /**
         * 房屋数据更新
         * @returns {*}
         */
        function estateDataDownLoad(){
            var targetPath = ionic.Platform.isAndroid() ? cordova.file.applicationStorageDirectory +"housexy.json": cordova.file.documentsDirectory+"housexy.json";
            return download(CONFIG.houseDataFileUrl,targetPath);
        }

        /**
         * app www目录下载、并进行解压操作
         */
        function zipFileDownload(){
            var storageTargetPath = ionic.Platform.isAndroid() ? cordova.file.applicationStorageDirectory +"www.zip" :cordova.file.documentsDirectory+"www.zip";
            return download(CONFIG.zipFileDownloadUrl,storageTargetPath);
        }

        /**
         * app 安装包更新
         */
        function appFileDownload(){
            var storageTargetPath = cordova.file.externalRootDirectory +"Download/com.hxsmart.zhongSTapp.apk",
                downLoadUrl = CONFIG.appDownLoadUrl_android;
            return download(downLoadUrl,storageTargetPath);
        }
        return {
            bikeDataDownLoad:bikeDataDownLoad,
            estateDataDownLoad:estateDataDownLoad,
            zipFileDownload:zipFileDownload,
            appFileDownload:appFileDownload
        }
    }]);
});


