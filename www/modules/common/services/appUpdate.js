/**
 * app 更新服务
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.factory("appUpdate", ['$q','$ionicPopup','downloadService','$cordovaFileOpener2','$rootScope','intDataService','CONFIG',function ($q,$ionicPopup,downloadService,$cordovaFileOpener2,$rootScope,intDataService,CONFIG) {
        $rootScope.appdownLoadProgress = 0;

        /**
         * 检查更新
         * @returns promise
         */
        function checkUpdate() {
            var checkUpdateDeferred = $q.defer();
            intDataService.postData(CONFIG.appUpdateUrl).then(function(data){  // 服务接口获取版本
                var serverAppVersion = data.body.resultDatas.zstVersion,
                    updateContent = data.body.resultDatas.updateContent;
                cordova.getAppVersion.getVersionNumber().then(function (version) {
                    //如果本地与服务端的APP版本不符合
                    console.log("本地版本"+version);
                    if (version != serverAppVersion) {
                        appUpdateConfirm(updateContent);
                        checkUpdateDeferred.resolve();
                    }
                });
            });
            return checkUpdateDeferred.promise;
        }


        /**
         * 提示更新对话框
         */
        function appUpdateConfirm(updateContent) {
            var confirmPopup = $ionicPopup.confirm({
                title: '<strong>版本升级</strong>',
                template: updateContent, //从服务端获取更新的内容
                cancelText: '忽略',
                okText: '体验新版本'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    /**
                     * 由于ios 安全机制、不允许用户直接下载安装app，所以跳转第三方连接下载更新
                     */
                    if(ionic.Platform.isAndroid()){
                        showPopup();
                        if ($rootScope.appdownLoadProgress === 0) {
                            downloadAppFile();
                        }
                    } else{
                        window.open(CONFIG.appDownLoadUrl_ios);
                    }
                } else {
                    // 取消更新
                }
            });
        }


        /**
         * apk 文件下载
         */
        function downloadAppFile(){
            var appFileDownloadPromise = downloadService.appFileDownload();
            appFileDownloadPromise.then(function(){
                downloadClear();
                plugins.toast.showShortCenter('app下载完成');
                //下载成功后打开下载文件
                fileOpen();

            },function(){
                alert("下载失败、请重试");
                downloadClear();
            },function(progress){
                $rootScope.appdownLoadProgress = progress;
                $('.appDownProgress').width(progress + '%');
            })
        }

        /**
         * 打开apk文件
         */
        function fileOpen(){
            $cordovaFileOpener2.open(
                cordova.file.externalRootDirectory +"Download/com.hxsmart.zhongSTapp.apk",
                'application/vnd.android.package-archive'
            ).then(function() {
                    // Success!
                }, function(err) {
                    alert("文件打开失败");
                });
        }

        /**
         * 下载进度提示
         */
        var myPopup;
        function showPopup() {
            // An elaborate, custom popup
            myPopup = $ionicPopup.show({
                title: '<strong>版本升级</strong>',
                template: "<div class='downProgress progress-dark progress-small progress-striped active'>" +
                "<div class='appDownProgress progress-bar' role='progressbar'></div>" +
                "</div> <p style='text-align: center'>文件下载中,请稍后...<span style='color: #006600'>( {{appdownLoadProgress}} )%</span></p>",
                scope: $rootScope,
                buttons: [
                    {
                        text: '确定',
                        type: 'button-positive',
                        onTap: function(e) {
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
            });
        }


        /**************** www 目录下载 *********************/
        /**
         * 下载www压缩文件
         */
        /*$scope.downloadStateLabel = "";
        function downloadZipFile() {
            var zipFileDownloadPromise = downloadService.zipFileDownload();
            zipFileDownloadPromise.then(function(){
                console.log("下载成功");
                $scope.appdownLoadProgress = 0;
                unZip();
                //解压文件
            },function(){
                alert("下载失败、请重试");
                downloadClear();
            },function(progress){
                $scope.appdownLoadProgress = progress;
                $('.appDownProgress').width(progress + '%');
                console.log("下载进度==="+progress);
            })
        }

        /!**
         * 解压www文件
         *!/
        function unZip(){
            $scope.downloadStateLabel = "解压";
            var targetUrl = cordova.file.applicationStorageDirectory;
            var sourceUrl = cordova.file.applicationStorageDirectory +"www.zip";
            zip.unzip(sourceUrl, targetUrl, function (result) {
                console.log("解压结果"+result);
                if(result === 0){
                    downloadClear();
                    plugins.toast.showShortCenter('下载完成');
                    //设置文件引导地址
                    if(ionic.Platform.isAndroid()){
                        window.localStorage.setItem("_serverURL", cordova.file.applicationStorageDirectory + "www/");
                    } else{
                        window.localStorage.setItem("_serverURL", cordova.file.documentsDirectory + "www/");
                    }

                    removeZipFile(); //删除文件
                }else{
                    alert("文件解压失败,请重试!");
                    downloadClear();
                }
            }, function (progressEvent) {
                var progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                $scope.$apply(function(){
                    $scope.appdownLoadProgress = progress;
                });
                $('.appDownProgress').width(progress + '%');
                console.info("progress value:" + progress);
            });
        }

        function removeZipFile(){
            var targetPath = ionic.Platform.isAndroid() ? cordova.file.applicationStorageDirectory :cordova.file.documentsDirectory;
            $cordovaFile.removeFile(targetPath, "www.zip")
                .then(function (success) {
                    plugins.toast.showShortCenter('文件删除成功');
                    location.replace("index.html");
                }, function (error) {
                    console.log("删除失败");
                    console.log(error);
                    location.replace("index.html");
                });
        }*/
        function downloadClear(){
            myPopup.close();
            $rootScope.appdownLoadProgress = 0;
        }
        return {
            checkUpdate:checkUpdate
        }
    }]);
});


