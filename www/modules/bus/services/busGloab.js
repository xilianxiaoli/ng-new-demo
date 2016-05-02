/**
 * Created by Administrator on 2015/5/14.
 * 公交车数据通信服务
 */
define([_serverURL + 'modules/bus/_module.js'], function (module) {
    module.factory('busGloab', ['database', function (database) {
            return {
                busDataInfo: {},     //换乘方案查询对象
                transfer: {},        //地图选点信息对象
                show: {},            //显示方案
                inputModel: {        //起点、终点文本框服务对象
                    sm: "我的位置",
                    em: ""
                },
                bus: {
                    line: {
                        historyLine: [],
                        allLine: []
                    },
                    station: {
                        often: [],
                        nearby: []
                    }
                },

                /**
                 * 功能：将“公交线路”数据载入内存
                 * @param objContainer:盛放对象容器
                 */
                busLineDataLoad: function (objContainer) {
                    console.log('载入公交线路数据开始！');
                    //回调函数包装器
                    /*var suc = function (property, type) {
                        if (type == 'idx') {
                            return function (obj) {
                                objContainer[property].push(obj);
                                console.log(objContainer[property])
                            }
                        } else if (type == 'all') {
                            return function (obj) {
                                objContainer[property] = obj;
                                console.log(objContainer[property])
                            }
                        }

                    };*/
                    var suc=function (obj) {
                        objContainer.allLine = obj;
                        console.log(objContainer.allLine)
                    };
                    database.select('busLine','', suc, function () {
                        console.log('error')
                    });
                },
                /**
                 * 功能：将“公交站点”数据载入内存
                 * @param objContainer:盛放对象容器
                 */
                busStationDataLoad: function (objContainer) {
                    console.log('载入公交站点数据开始！');
                    //回调函数包装器
                    var suc = function (property) {
                        return function (obj) {
                            objContainer[property].push(obj);
                            console.log(objContainer[property]);
                        }
                    };
                    database.selectIdx('busStation', 'isOftenIndex', 1, suc('often'));

                }


            }
        }]
    );
});