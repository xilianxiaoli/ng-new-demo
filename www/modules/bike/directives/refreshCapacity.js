/**
 * @function:自行车实时数据刷新及显示指令
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/bike/_module.js'], function (module) {
    module.directive('refreshCapacity', ['$http','map',function ($http,map) {
        /*todo 变量声明-----------------------------------------------------*/
        var lastElement='';
        var capacityAvailBike=[];
        /*todo 私有函数-----------------------------------------------------*/
        /**
         * @function 移除前一次点击的元素的车位数据
         * @param element 动画对应的元素
         * @private
         */
        function _removeLast(element){
            element[0].removeClass('locationFlag');
            element[1].removeClass('bikeParkMove')
        }

        /**
         * @function 显示当前元素的车位数据
         * @param element1 定位动画对应的元素
         * @param element2 车位数据动画对应的元素
         * @private
         */
        function _addThis(element1,element2){
            element1.removeClass('locationFlag');
            setTimeout(function(){
                element1.addClass('locationFlag');
            },100);
            element2.removeClass('bikeParkMove');
            setTimeout(function(){
                element2.addClass('bikeParkMove');
            },100);
        }

        /**
         * @function 设置可借车和可停车数所在的span的html
         * @param ele 元素
         * @param val 值
         * @private
         */
        function _setSpanHtml(ele,val){
            capacityAvailBike=[val.capacity,val.availBike];
            ele.children().first().html(val.availBike);
            ele.children().last().html(val.capacity-val.availBike);
        }

        /**
         *
         * @param id 自行车站点id
         * @returns {*} 链式调用承诺
         * @private
         */
        function _getCapacity(id){
            return $http.get('http://zsbicycle.com/zsbicycle/zsmap/ibikestation.asp?id='+id);
        }
        /*todo link函数-----------------------------------------------------*/
        function link(scope,element,attr) {
            var each=JSON.parse(attr.refreshCapacity);
            var id=each.id;
            var spinner=element.find('.stnFresh').first();
            var locationFlag=element.find('.ion-ios-location').first();
            var bikePark=element.find('.bikePark').first();
            element.click(function(){
                var clickGoWhere=element.find('.bikeParkMove').length;
//                console.info("each内容"+each);
                if(clickGoWhere){
                    console.log('访问地图');
                    each.capacity=capacityAvailBike[0];
                    each.availBike=capacityAvailBike[1];
                    map.singleBikeMap(each);
                }else{
                    if(lastElement!='') {
                        _removeLast(lastElement);
                    }
                    lastElement=[locationFlag,bikePark];
                    spinner.show();
                    _getCapacity(id).then(
                        function(data){
                            spinner.hide();
                            eval(data.data);
                            if(isinglebike.station.length==0){
                                scope.showToast('远程实时数据为空！');
                                return
                            }
                            console.log(isinglebike.station[0]);
                            _setSpanHtml(bikePark,isinglebike.station[0]);
                            if(lastElement!='') {
                                _removeLast(lastElement);
                            }
                            _addThis(locationFlag,bikePark);
                            lastElement=[locationFlag,bikePark];
                        },function(){
                            scope.ionAlert('远程数据请求失败！');
                            spinner.hide();
                        }
                    );


                }

            });
        }

        /*todo 指令设置-----------------------------------------------------*/
        return {
            restrict: 'A',
            link: link
        };
    }]);
});
