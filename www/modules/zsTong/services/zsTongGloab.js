define([_serverURL + 'modules/zsTong/_module.js'], function (module) {
    module.factory('zsTongGloab', [function(){
        return{
            zst:{
                zstStation:{allStation:[],fuJin:[],nanQu:[],dongQu:[],shiQiQu:[],xiQu:[],wuGuiShanQu:[]},
                zstNotice:{allNotice:[]},
                zstGuide:{allGuide:[]}
            }
        }
    }]);
});