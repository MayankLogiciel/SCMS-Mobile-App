(function(){

       'use strict';
   	/**
   	* ImportDatabaseAndPicController Controller
   	**/
      var ImportDatabaseAndPicController = function($log, $scope, $cordovaSQLite, $state, authService, $cordovaToast, $ionicPopup, bcrypt, cfpLoadingBar, $ionicHistory, picAndDatabaseTransferService, $cordovaZip, $cordovaFileTransfer, $timeout, $cordovaFile, $rootScope, $cordovaNetwork, SCMS_SERVER_DOWNLOAD_URL, $ionicLoading) {  
            var setup = function() {
                  $log.debug("ImportDatabaseAndPicController Controller");
                  $scope.importData = { 
                        server_url: '', 
                        username: '', 
                        password: ''
                  };
                  if(authService.getSansangPlaceInfo() != null) {
                        $scope.importData.server_url = authService.getSansangPlaceInfo().serverURL; 
                        $scope.serverURlPrefix = $scope.importData.server_url;
                  }
                  
            };            

            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.importDatabase = function(msg) {
                  $ionicLoading.show({ scope: $scope, template: '<button class="button button-clear btn-animation" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp;'+msg+'</span></button>'});
            }
            $scope.cancelLoading = function() {
                  $ionicLoading.hide();
            }

            $scope.serverURL = function(url) {
                  var serverURL = {serverURL: url}
                  $scope.serverURlPrefix = url;
                  authService.setSansangPlaceInfo(serverURL);
            }          

            $scope.import = function(importData) { 
                  if($cordovaNetwork.isOffline()){
                        $cordovaToast.show('Please Check your network connection', 'short', 'center');
                        return;
                  }else {
                        $scope.importDatabase('Connecting To Server');
                        var trustHosts = true;
                        var downloadOptions = {};
                        var targetPath = cordova.file.externalApplicationStorageDirectory + 'download.zip';
                        var url = $scope.serverURlPrefix + SCMS_SERVER_DOWNLOAD_URL;
                        var serverUrl = importData.server_url;
                        var config = 1;
                        picAndDatabaseTransferService.getTokenFromServer(importData.username, importData.password, config, serverUrl).then(function(response) {
                              var accessToken = "bearer " + response.data.signature;
                              var headers = {'Authorization': accessToken};         
                              downloadOptions.headers = headers;
                              $scope.importDatabase('Downloading Database');
                              $cordovaFileTransfer.download(url, targetPath, downloadOptions, trustHosts)
                              .then(function(result) { 
                                    unzip();
                              }, function(err) {
                                    $cordovaToast.show("Some thing went wrong", 'short', 'center');
                                    $scope.cancelLoading();
                              }, function (progress) {
                                    $timeout(function () {
                                          $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                                    });
                              });
                              authService.setToken(accessToken);
                        }, function(err) {
                              $timeout(function() {
                                    switch (err.status) {
                                          case 401:
                                                $scope.cancelLoading();
                                                $cordovaToast.show(err.data.message, 'short', 'center');
                                                return;                                    
                                          case -1:
                                                $scope.cancelLoading();
                                                $cordovaToast.show('Please check your server URL', 'short', 'center');
                                                return;                                    
                                          case 500: 
                                                $scope.cancelLoading();
                                                $cordovaToast.show(err.statusText, 'short', 'center');
                                                return;
                                    }
                              }, 500);
                        });
                  }                 
            }

            var unzip = function() {
                  var path = cordova.file.externalApplicationStorageDirectory + 'download.zip';
                  $cordovaZip
                  .unzip(
                        path, 
                        cordova.file.externalApplicationStorageDirectory 
                        ).then(function (res) {
                              //deletePictureDir();
                             CopyPicturesandDatabaseToImport();
                        }, function (err) {
                        }, function (progressEvent) {
                        });                
            }


            // var deletePictureDir = function() {
            //       var path = cordova.file.externalApplicationStorageDirectory + 'import/';
            //       $cordovaFile.removeRecursively(path, "sewadar_pics")
            //       .then(function (success) {
            //             CopyPicturesandDatabaseToImport();
            //       }, function (error) {
            //             CopyPicturesandDatabaseToImport();
            //       });
            // }
            var CopyPicturesandDatabaseToImport = function() {
                  // $cordovaFile.moveDir(cordova.file.externalApplicationStorageDirectory, "sewadar_pics", cordova.file.externalApplicationStorageDirectory + 'import/', "sewadar_pics")
                  // .then(function (success) {
                  // }, function (error) {
                  // });
                  $cordovaFile.moveFile(cordova.file.externalApplicationStorageDirectory + 'database/', "database.sqlite", cordova.file.externalApplicationStorageDirectory + 'import/')
                  .then(function (success) {
                        var dataBasePath = cordova.file.externalApplicationStorageDirectory + 'import/';
                        var dbName = 'database.sqlite';
                        var dataBaseFilePath = dataBasePath + dbName;
                        window.plugins.sqlDB.remove(dbName, 0, function(res) {
                              $rootScope.db.close(function() {
                                    copyDatabaseToInternalMemory();
                              }, function(error) {
                                    $log.debug('ERROR closing database');
                              });                                    
                        }, function(err) {
                              copyDatabaseToInternalMemory();
                        });
                  }, function (error) {

                  });
            } 

            //  var deleteZipFolder = function() {
            //       var path = cordova.file.externalApplicationStorageDirectory;
            //       $cordovaFile.removeRecursively(path, "download.zip")
            //       .then(function (success) {
            //       }, function (error) {
            //             console.log(error);
            //       });
            // }
            var deleteDatabaseFolder = function() {
                  var path = cordova.file.externalApplicationStorageDirectory;
                  $cordovaFile.removeRecursively(path, "database")
                  .then(function (success) {
                  }, function (error) {
                  });
            }

            var copyDatabaseToInternalMemory = function() {
                  var dataBasePath = cordova.file.externalApplicationStorageDirectory + 'import/';
                  var dbName = 'database.sqlite';
                  var dataBaseFilePath = dataBasePath + dbName;
                  window.plugins.sqlDB.copyDbFromStorage(dbName, 0, dataBaseFilePath, false, function(result) {
                        $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'});                       
                        $scope.user = [];
                        var query = "SELECT * FROM users where email = '"+$scope.importData.username+"'";
                        $cordovaSQLite.execute($rootScope.db, query).then(function(res) { 
                              if(res.rows.length > 0) {
                                    for(var i= 0; i<res.rows.length; i++) {
                                          $scope.user.push(res.rows.item(i));
                                    }
                              }
                              $scope.user[0].userPassword = $scope.importData.password;
                              authService.setLoggedInUserData($scope.user[0]);
                              $timeout(function() {
                                    $scope.cancelLoading();
                                    if($scope.user[0].group_name== 'Secretary') {
                                          $state.go('secretary-home');
                                    }else {
                                          authService.setDatabaseNotFound('no-error');
                                          $state.go('app');
                                          deleteDatabaseFolder();
                                    }
                              }, 1000);
                        });
                  }, function(err) {
                  });
            }

      setup();
};

ImportDatabaseAndPicController.$inject  = ['$log', '$scope', '$cordovaSQLite', '$state', 'authService', '$cordovaToast', '$ionicPopup', 'bcrypt', 'cfpLoadingBar', '$ionicHistory', 'picAndDatabaseTransferService', '$cordovaZip', '$cordovaFileTransfer', '$timeout', '$cordovaFile', '$rootScope', '$cordovaNetwork', 'SCMS_SERVER_DOWNLOAD_URL', '$ionicLoading'];

angular
.module('SCMS_ATTENDANCE')
.controller("ImportDatabaseAndPicController", ImportDatabaseAndPicController);
})();