(function(){

       'use strict';
   	/**
   	* ImportDatabaseAndPicController Controller
   	**/
      var ImportDatabaseAndPicController = function($log, $scope, $cordovaSQLite, $state, authService, $cordovaToast, $ionicPopup, bcrypt, cfpLoadingBar, $ionicHistory, picAndDatabaseTransferService, $cordovaZip, $cordovaFileTransfer, $timeout, $cordovaFile, $rootScope, $cordovaNetwork, SCMS_SERVER_DOWNLOAD_URL, $ionicLoading, $filter, SCMS_SERVER_UPLOAD_URL) {  
            var setup = function() {
                  $log.debug("ImportDatabaseAndPicController Controller");
                  $scope.importData = { 
                        server_url: '', 
                        username: '', 
                        password: ''
                  };
                  $scope.preServerUrl = 'http://';                 
                  if(authService.getSansangPlaceInfo() != null) {
                        $scope.importData.server_url = authService.getSansangPlaceInfo().serverURL; 
                        $scope.serverURlPrefix = $scope.preServerUrl + $scope.importData.server_url; 
                  }
            };  

            $scope.syncingDatabase = function(msg) {
                  $ionicLoading.show({ scope: $scope, template: '<button class="button button-clear btn-animation" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp;'+msg+'</span></button>'});
            }

            var getPicturesCount = function() {
                  var query = "SELECT COUNT(id) as count FROM sewadars WHERE sewadars.photo_update_status = 1";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.picturesCount = res.rows.item(i).count;                                                          
                        }                              
                  });
            }

            var getNominalCount = function() {
                  var query = "SELECT COUNT(id) as count FROM nominal_roles";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.nominalCount = res.rows.item(i).count;
                        }                              
                  });
            }

            var getSatsangAttendanceCount = function() {
                  var query = "SELECT COUNT(id) as count FROM attendances";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.attendanceCount = res.rows.item(i).count;
                        }                              
                  });
            }          

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


            var downloadDB = function(url,targetPath,downloadOptions,trustHosts, accessToken) {
                  $scope.importDatabase('Preparing Database');
                  $cordovaFileTransfer.download(url, targetPath, downloadOptions, trustHosts)
                  .then(function(result) { 
                        CopyPicturesandDatabaseToImport();
                  }, function(err) {
                        $scope.cancelLoading();
                  }, function (progress) {
                        $timeout(function () {
                              $scope.downloadProgress = Math.floor((progress.loaded / progress.total) * 100);
                              $ionicLoading.show({ scope: $scope, template: '<button class="button button-clear btn-animation" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp;Downloading Database ('+$scope.downloadProgress+'%)</span></button>'});
                        });
                  });
                  authService.setToken(accessToken);
            } 

            var syncDB = function(accessToken) { 
                  $scope.syncingDatabase('Uploading database (0%)');
                  $scope.createExportFolder(accessToken);                  
            }   

            /**
            * creating export folder 
            **/

            $scope.createExportFolder = function(accessToken) {
                  $cordovaFile.createDir($rootScope.baseAppDir, "export", false)
                  .then(function (success) {
                        checkDirectoryDate(accessToken);
                  }, function (error) {
                        checkDirectoryDate(accessToken);
                  });
            }

            var checkDirectoryDate = function(accessToken) {  
                  $scope.folderName = $filter('date')(new Date(), 'yyyy_MM_dd_h_mm_ss') + '/';  
                  $scope.dataBasePath = $rootScope.baseAppDir + 'export/'              
                  $cordovaFile.checkDir($scope.dataBasePath, $scope.folderName)
                  .then(function (success) {
                  }, function (error) {
                        $cordovaFile.createDir($scope.dataBasePath, $scope.folderName, false).then(function (success) {
                              copyDBToExportFolder(success.nativeURL, accessToken);
                        });
                  });
            }

            var copyDBToExportFolder = function(path, accessToken) {
                  $scope.dataBasePath = $rootScope.baseAppDir + 'export/' + $scope.folderName;                  
                  var dbName = 'database.sqlite';
                  window.plugins.sqlDB.copyDbToStorage(dbName, 0,$scope.dataBasePath, function(result) {
                        copiedDataInExport(path, dbName, accessToken);
                  }, function(err) {
                        if(ionic.Platform.isIOS()){
                              copiedDataInExport(path, dbName, accessToken);
                        }
                  })
            }

            var copiedDataInExport = function(path,dbName, accessToken) {
                  var trustAllHosts = true;
                  var url = encodeURI($scope.serverURlPrefix + SCMS_SERVER_UPLOAD_URL);
                  var targetPath = path + dbName;
                  var filename = targetPath.split("/").pop();
                  var options = {
                        fileKey: "upload",
                        fileName: filename,
                        chunkedMode: false,
                        mimeType: "application/x-sqlite3",
                        httpMethod: "POST",
                        ignoreLoadingBar: true
                  };
                  var headers={'Authorization': accessToken};
                  options.headers = headers;
                  $cordovaFileTransfer.upload(url, targetPath, options, trustAllHosts).then(function(result) {
                        downloadDB($scope.url,$scope.targetPath,$scope.downloadOptions,$scope.trustHosts, accessToken);
                  }, function(err) {
                        $scope.cancelLoading();
                        $timeout(function() {
                              switch(err.http_status) {
                                   case 500: 
                                          $scope.cancelLoading();
                                          $cordovaToast.show('Internal server Error', 'short', 'center');
                                          return;
                                    case 401:
                                          $scope.cancelLoading();
                                          localStorage.removeItem("SCMS_token");
                                          return;
                                    case 400:
                                          $scope.cancelLoading();
                                          localStorage.removeItem("SCMS_token");
                                          return;
                                    case null:
                                          $scope.cancelLoading();
                                          $cordovaToast.show('Please enter valid server url', 'short', 'center');
                                          return;  
                              } 
                        }, 500);                                   
                  }, function (progress) {
                        $timeout(function () {
                              $scope.downloadProgress = Math.floor((progress.loaded / progress.total) * 100);
                              $ionicLoading.show({ scope: $scope, template: '<button class="button button-clear btn-animation" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp;Uploading database ('+$scope.downloadProgress+'%)</span></button>'});
                        })
                  });
            }

            $scope.import = function(importData) { 
                  if($cordovaNetwork.isOffline()){
                        $cordovaToast.show('Please Check your network connection', 'short', 'center');
                        return;
                  }else {
                        $scope.DBErr = authService.getDatabaseNotFound();                 
                        if($scope.DBErr != 'error') {
                              getPicturesCount();
                              getNominalCount();
                              getSatsangAttendanceCount();
                        }
                        $scope.importDatabase('Connecting To Server');
                        $scope.trustHosts = true;
                        $scope.downloadOptions = {};
                        $scope.targetPath = $rootScope.baseAppDir + 'database.sqlite';
                        $scope.url = $scope.preServerUrl + importData.server_url + SCMS_SERVER_DOWNLOAD_URL;
                        var serverUrl = $scope.preServerUrl + importData.server_url;
                        var config = 1;
                        picAndDatabaseTransferService.getTokenFromServer(importData.username, importData.password, config, serverUrl).then(function(response) {
                              var accessToken = "bearer " + response.data.signature;
                              var headers = {'Authorization': accessToken};         
                              $scope.downloadOptions.headers = headers;
                              $timeout(function() {                        
                                    if($scope.attendanceCount > 0 || $scope.nominalCount > 0 || $scope.picturesCount > 0){
                                          syncDB(accessToken);
                                    }else {
                                          downloadDB($scope.url,$scope.targetPath,$scope.downloadOptions,$scope.trustHosts, accessToken);
                                    }
                              }, 500);
                              
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

            var CopyPicturesandDatabaseToImport = function() {
                  $cordovaFile.moveFile($rootScope.baseAppDir, "database.sqlite", $rootScope.baseAppDir + 'import/')
                  .then(function (success) {
                        var dataBasePath = $rootScope.baseAppDir + 'import/';
                        var dbName = 'database.sqlite';
                        var dataBaseFilePath = dataBasePath + dbName;
                        window.plugins.sqlDB.remove(dbName, 0, function(res) {
                              copyDatabaseToInternalMemory();                           
                        }, function(err) {
                              copyDatabaseToInternalMemory();
                        });
                  }, function (error) {

                  });
            } 
            var copyDatabaseToInternalMemory = function() {
                  var dataBasePath = $rootScope.baseAppDir + 'import/';
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
                                    $rootScope.db.close(function() {
                                          authService.setDatabaseNotFound('no-error');
                                          $state.go('app');
                                          $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'}); 
                                    });                                    
                              }, 1000);
                        });
                  }, function(err) {
                  });
            }

      setup();
};

ImportDatabaseAndPicController.$inject  = ['$log', '$scope', '$cordovaSQLite', '$state', 'authService', '$cordovaToast', '$ionicPopup', 'bcrypt', 'cfpLoadingBar', '$ionicHistory', 'picAndDatabaseTransferService', '$cordovaZip', '$cordovaFileTransfer', '$timeout', '$cordovaFile', '$rootScope', '$cordovaNetwork', 'SCMS_SERVER_DOWNLOAD_URL', '$ionicLoading', '$filter', 'SCMS_SERVER_UPLOAD_URL'];

angular
.module('SCMS_ATTENDANCE')
.controller("ImportDatabaseAndPicController", ImportDatabaseAndPicController);
})();