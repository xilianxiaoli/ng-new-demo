

var _serverURL = localStorage.getItem("_serverURL");//·þÎñÆ÷serverUrl
if (_serverURL == null) {
    _serverURL = "";
}
require.config({
    paths: {
        'ionic':  '../lib/ionic/js/ionic.bundle',
        'ngCordova': '../lib/ngCordova/dist/ng-cordova',
        'indexeddb': '../lib/IndexedDBShim/dist/IndexedDBShim',
        'jquery': "../lib/jquery/jquery-1.11.1.min",
        'MD5': '../lib/md5/md5',
        'cycle': '../lib/skyPlugins/js/jquery.cycle2.min',
        'carousel': '../lib/skyPlugins/js/jquery.sky.carousel-1.0.2.min'
    },
    shim: {
        'ionic': {
            deps: ['jquery']
        }, 'cycle': {
            deps: ['jquery']
        }, 'carousel': {
            deps: ['jquery']
        },
        'ngCordova': {
            deps: ['ionic']
        }
    }
});


requirejs([_serverURL + 'modules/app.js'], function () {
    'use strict';
    angular.bootstrap(document, ['app']);

});


