(function() {
       'use strict';
      /**
      * App Controller
      **/
      var AppController = function($log, $scope, $timeout, $ionicHistory, $state, $ionicPopup, $cordovaToast, $cordovaFile, $filter, authService, picAndDatabaseTransferService) {
            var setup = function() {
                  $log.debug("App Controller");
                  if($state.current.name == "app") {
                        $timeout(function(){
                              $ionicHistory.clearCache();
                              $ionicHistory.clearHistory();
                        },500);
                  }  
            }; 
            
            /**
            * Log out function
            * clearing all history and cache and clear Local Storage
            **/
            $scope.logOut = function() {
                  //localStorage.clear();
                  localStorage.removeItem("SCMS_user");
                  localStorage.removeItem("SCMS_token");
                  $timeout(function () {
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                  },500);                  
                  $cordovaToast.show('Logged out successfully', 'short', 'center');
                  $state.go("login");
            }

            /**
            * syncDataPopup function used to open sync database popup
            **/
            $scope.syncDataPopup = function() {
                  var myPopup = $ionicPopup.show({
                        templateUrl: 'templates/popups/sync.data.popup.html',
                        title: 'Database Synced!',
                        cssClass: 'sync-popup',
                        scope: $scope,
                        buttons: [ { text: 'OK' }, ]
                  });
                  myPopup.then(function(res) {
                        myPopup.close();
                  });
            };

            /**
            * creating export folder 
            * syncDatabase function used to sync database
            **/

            $scope.syncDatabase = function() {
                  $state.go("sync-database-or-pics");                  
            }

            var checkDirectoryDate = function() {  
                  $scope.folderName = $filter('date')(new Date(), 'yyyy_MM_dd_h_mm_ss') + '/';  
                  $scope.dataBasePath = cordova.file.externalApplicationStorageDirectory + 'export/'              
                  $cordovaFile.checkDir($scope.dataBasePath, $scope.folderName)
                  .then(function (success) {
                  }, function (error) {
                        $cordovaFile.createDir($scope.dataBasePath, $scope.folderName, false).then(function (success) {
                              copyDBToExportFolder();                              
                        });
                  });
            }

            /**
            * syncDatabase function used to sync database
            **/
            var copyDBToExportFolder = function() {
                  $scope.dataBasePath = cordova.file.externalApplicationStorageDirectory + 'export/' + $scope.folderName;                  
                  var dbName = 'database.sqlite';
                  window.plugins.sqlDB.copyDbToStorage(dbName, 0,$scope.dataBasePath, function(result) {
                  }, function(err) {
                  })
                  $scope.syncDataPopup();
            }
            setup();
      };

      AppController.$inject  = ['$log', '$scope', '$timeout', '$ionicHistory', '$state', '$ionicPopup', '$cordovaToast', '$cordovaFile', '$filter', 'authService', 'picAndDatabaseTransferService'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("AppController", AppController);
})();

