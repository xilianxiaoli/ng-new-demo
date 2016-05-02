/**
 * @function:物业租赁全局控制器
 * @created time：2015/08/01
 * @author：欧渠江
 */
define([_serverURL + 'modules/estate/_module.js'], function (module) {
    module.controller('estateCtrl', ['$scope','database','map', function ($scope,database,map) {
        /*todo $scope扩展------------------------------------------------------*/
        $scope.estateMenuData = [
            //0
            {
                name: '来源',
                englishName:'sourceFrom',
                include: ['不限', '城建','个人', '经纪人'],
                suffix:''
            },
            //1
            {
                name: '区域',
                englishName:'town',
                include: ['不限','神湾', '大涌', '古镇', '板芙', '东凤', '东区','东升','阜沙','港口','横栏','黄圃','火炬开发区','南朗',
                    '南区','南头','三角','三乡','沙溪','石岐','坦洲','五桂山','小榄','西区'],
                suffix:''
            },
            //2
            {
                name: '距离',
                englishName:'distance',
                include: ['不限','1000','1500','6000','58000','65000'],
                suffix:'米以内'
            },
            //3
            {
                name: '价格',
                englishName:'monthPay',
                include: ['不限', '0-1000', '1000-2000', '2000-3000', '3000-5000', '5000-10000', '10000-50000', '50000-100000'],
                suffix:'元/月'
            },
            //4
            {
                name: '总价',
                englishName:'totalPrice',
                include: ['不限', '0-30', '30-50', '50-80', '80-100', '100-150', '150-200', '200-300', '300-400', '400-1000'],
                suffix:'万元'
            },
            //5
            {
                name: '厅室',
                englishName:'innerIntroduction',
                include: ['不限','1室','2室','3室','4室'],
                suffix:''
            },
            //6
            {
                name: '面积',
                englishName:'space',
                include: ['不限','0-50','50-70','70-90','90-110','110-130','130-150','150-200', '200-300', '300-500', '500-1000'],
                suffix:'平米'
            }
        ];
        $scope.getEstateData=getEstateData;//查询物业数据库
        $scope.conditionConvert=conditionConvert;//条件格式转换，并去掉 条件为“不限”的属性
        $scope.deleteBUXIANG=deleteBUXIANG;// 去掉值为“不限”的条件
        $scope.multiEstateMap=multiEstateMap;//显示海量物业租赁点
        $scope.singleEstateMap=singleEstateMap;//显示单点物业租赁
        /*todo 私有函数---------------------------------------------------------*/
        /*todo 公共函数---------------------------------------------------------*/
        /**
         * @function 查询物业数据库
         * @param condition 查询条件
         */
        function getEstateData(condition){

            return database.select('estateData',condition);

        }

        /**
         * @function 去掉值为“不限”的条件
         * @param condition
         * @returns {*}
         * @private
         */
        function deleteBUXIANG(condition){
            angular.forEach(condition,function(value,key){
                if(value.range=='不限'){
                    delete condition[key];
                }
            });
            return condition
        }

        /**
         * @function 条件格式转换，并去掉 条件为“不限”的属性
         * @param rawCondition  如 {sourceFrom: {chineseName:'来源',range:'城建'},......}
         * @returns {*} 如 {sourceFrom: "城建", type: 1}
         */
        function conditionConvert(rawCondition){
            rawCondition=rawCondition||(function(){throw 'conditionConvert函数参数rawCondition不存在!'}());
            var iReturn={};
            angular.forEach(rawCondition,function(value,key){
                var range=value.range;
                if(typeof range=='string'&&range.indexOf('-')>0){
                    range=range.split('-');
                    iReturn[key]=range;
                } else{
                    /*if(key=='distance'){
                        var lngLatR=$scope.lngLatRand(Number((range/1000).toFixed(6)));
                        if(lngLatR){
                            angular.forEach(lngLatR,function(value,key){
                                iReturn[key]=value
                            });
                        }
                    }else{
                        iReturn[key]=range
                    }*/
                    iReturn[key]=range
                }

            });
            return iReturn
        }

        /**
         * @function 显示海量物业租赁点
         */
        function multiEstateMap(){
            map.multiEstateMap();
        }

        /**
         * @function 显示单点物业租赁
         * @param each 要显示的点的对象
         */
        function singleEstateMap(each){
            map.singleEstateMap(each);
        }
    }]);
});

