define([_serverURL + 'modules/bus/_module.js'], function (module) {
    module.controller('transferCtr', ['$scope', 'busGloab','$timeout','$rootScope', function ($scope, busGloab,$timeout,$rootScope) {
            $scope.busGloab = busGloab;    //服务传递数据信息
            console.log('transferCtr.js');
            $scope.transferScheme = [];   //换乘方案对象
            /**
             * 换乘初始化
             */
            $scope.transferInit = {
                /**
                 *
                 * 输入提示
                 */
                inputTip: function () {
                    //--------起点
                    var startOption = {
                        container: "l-map",   //显示地图的容器
                        position: {
                            lon: '114.032011',
                            lat: '22.538525'
                        },
                        suggestId: "startId",
                        searchResultPanel: "startPanel"
                    };

                    //------终点
                    var endOption = {
                        container: "l-map",
                        position: {
                            lon: '114.032011',
                            lat: '22.538525'
                        },
                        suggestId: "endId",
                        searchResultPanel: "endPanel"
                    };

                },
                /**
                 * 方案查询对象信息初始化
                 */
                queryOpt: function () {
                    busGloab.busDataInfo = {  //将参数对象信息通过服务存储
                        container: "hide",   //显示地图的容器
                        position: {
                            lon: '114.032011',
                            lat: '22.538525'
                        },
                        item: 0,
                        startPosition: busGloab.inputModel.sm,
                        endPosition: busGloab.inputModel.em
                    };
                }
            };

            /**
             * 线路换乘方案查询
             */
            $scope.queryFerScheme = function () {
                $scope.transferScheme = [];
                $scope.tipInfo = "";
                $rootScope.ionLoad.showNoBg();
                /**
                 * 当为地图选点时候判断终点文本框值是否改变
                 */
                if(busGloab.tempN != busGloab.inputModel.em){
                    busGloab.busDataInfo.endPosition = busGloab.inputModel.em
                }else{
                    busGloab.busDataInfo.endPosition =  busGloab.pointN;
                }
                //===========判断起点值是否改变
                if(busGloab.tempS != busGloab.inputModel.sm){
                    busGloab.busDataInfo.startPosition = busGloab.inputModel.sm
                }else{
                    busGloab.busDataInfo.startPosition =  busGloab.pointS;
                }

               //方案查询


                $timeout(function(){
                    $rootScope.ionLoad.hide();
                    if($scope.transferScheme.length==0){
                        $scope.tipInfo = "<i class='icon ion-information-circled' style='color: #6e9c2d'></i> 没有找到换乘方案";
                    }
                },1000);
            };

            /**
             * 查看方案地图
             */
            $scope.showMap = function () {
                var option = {  //将参数对象信息通过服务存储
                    container: "showMap",   //显示地图的容器
                    position: {
                        lon: '114.032011',
                        lat: '22.538525'
                    },
                    item: busGloab.show.item,
                    startPosition: busGloab.busDataInfo.startPosition,
                    endPosition: busGloab.busDataInfo.endPosition
                };
                if (busGloab.show.item == undefined) {
                    option.item = 0;
                }

            };

            /**
             * 起始位置和终点位置切换
             */
            $scope.locationExchange = function () {
                //*************文本框值切换
                var temp = busGloab.inputModel.em;
                busGloab.inputModel.em = busGloab.inputModel.sm;
                busGloab.inputModel.sm = temp;
                /*//------------------底层值切换
                var temp2 = busGloab.busDataInfo.endPosition;
                busGloab.busDataInfo.endPosition = busGloab.busDataInfo.startPosition;
                busGloab.busDataInfo.startPosition = temp2;*/
                $('.tangram-suggestion-main').css({'z-index': '0'});
            };

            //启用提示
            $scope.enabledTip = function () {
                $('.tangram-suggestion-main').css({'z-index': '999'});
            };

            ///_____手风琴切换
            $scope.toggleGroup = function (group, index) {
                busGloab.show.item = index;   //传递选中的方案索引
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = group;
                }
            };
            $scope.isGroupShown = function (group) {
                return $scope.shownGroup === group;

            };

            /**
             * 地图选点初始化
             */
            $scope.chooseMap = function () {

            };

            /**
             * 完成选点
             */
            $scope.chooseOk = function () {
                if (busGloab.transfer.current == "start") {
                    busGloab.busDataInfo.startPosition = busGloab.transfer.point;   //记录地图选点坐标
                    busGloab.inputModel.sm = busGloab.transfer.text;                //将位置信息显示到文本框
                    busGloab.tempS = busGloab.transfer.text;                        //记录地图位置信息
                    busGloab.pointS = busGloab.transfer.point;
                } else if (busGloab.transfer.current == "end") {
                    busGloab.busDataInfo.endPosition = busGloab.transfer.point;
                    busGloab.inputModel.em = busGloab.transfer.text;
                    busGloab.tempN = busGloab.transfer.text;
                    busGloab.pointN = busGloab.transfer.point;
                }
                $('.tangram-suggestion-main').css({'z-index': '0'});
                window.location = "#/bus/transfer";

            };

            /**
             * 地图选点
             * @param param
             */
            $scope.shooses = function (param) {
                busGloab.transfer = {
                    container: "choosePosition",   //显示地图的容器
                    position: {
                        lon: '114.032011',
                        lat: '22.538525'
                    }
                };
                busGloab.transfer.current = param;
                window.location = "#/bus/choose-position";
            }

        }]
    );
});


