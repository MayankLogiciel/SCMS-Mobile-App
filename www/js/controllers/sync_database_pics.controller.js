(function() {
       'use strict';
      /**
      * Sync DB Controller
      **/
      var SyncDBPicsController = function($log, $scope, $ionicHistory, $cordovaSQLite, $ionicLoading, authService, $cordovaFileTransfer, $timeout, $cordovaFile, $filter, $rootScope, picAndDatabaseTransferService, $cordovaToast, $state, $cordovaNetwork, SCMS_SERVER_UPLOAD_URL, SCMS_SERVER_IMAGE_UPLOAD_URL, SCMS_SERVER_IMAGE_DOWNLOAD_URL, $cordovaZip) {
            var setup = function() {
                  $log.debug("Sync DB Controller");
                  $scope.pictures = [];
                  getPicturesCount();
                  getNominalCount();
                  getPicturesAndId();
                  getSatsangAttendanceCount();
                  $scope.userData = authService.getLoggedInUserData(); 
                  $scope.getToken = authService.getToken();
                  $scope.serverURlPrefix = authService.getSansangPlaceInfo();
                  $scope.picturesCount = 0;
                  $scope.attendanceCount = 0;
                  $scope.nominalCount  = 0;
                  $scope.p = 0;
                  $scope.dbPath = '';
                  $scope.currentDate =  $filter('date')(new Date(), 'yyyy-MM-dd');
                  $scope.syncDateAndTime = picAndDatabaseTransferService.getLastImagesDownloadedTime();

            }; 
 
            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.syncPictures = function(msg) {
                  $ionicLoading.show({ scope: $scope, template: '<div class="btn-animation-sync" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp;'+msg+'</span><br><br><br><button class ="button button-clear cancel-btn" ng-click="cancelLoading()"><i class="icon ion-close"></i>&nbsp;&nbsp;Cancel</button></div>'});
            }
            $scope.syncingDatabase = function(msg) {
                  $ionicLoading.show({ scope: $scope, template: '<div class="btn-animation-sync" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp;'+msg+'</span><br><br><br><button class ="button button-clear cancel-btn" ng-click="cancelLoading()"><i class="icon ion-close"></i>&nbsp;&nbsp;Cancel</button></div>'});
            }

            $scope.cancelLoading = function(str) {
                  $ionicLoading.hide();
            }

            var getPicturesCount = function() {
                  var query = "SELECT COUNT(id) as count FROM sewadars WHERE sewadars.photo_update_status = 1";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.picturesCount = res.rows.item(i).count;                                                          
                        }                              
                  });
            }

            var getPicturesAndId = function() {
                  var query = "SELECT id, photo FROM sewadars WHERE sewadars.photo_update_status = 1";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.pictures.push(res.rows.item(i));
                        }   
                        $scope.l =  $scope.pictures.length;                          
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
                  var q = "select * from attendances where attendances.type = 'satsang_day'";
                  $cordovaSQLite.execute($rootScope.db, q).then(function(res) {
                        $scope.attendanceCount = res.rows.length;
                  });
            }

            $scope.uploadImageOneByOne  = function(str, count) {                  
                  if(str == "only-pics"){
                        if($cordovaNetwork.isOffline()){
                              $cordovaToast.show('Please Check your network connection', 'short', 'center');
                              return;
                        } else if($scope.pictures.length <= 0 ) {
                              $cordovaToast.show('No picture available to sync', 'short', 'center');
                        }else if($scope.getToken == null) {
                              syncLoader($scope.p);
                              getToken('pics');
                        }else {
                              syncLoader($scope.p);
                              uploadPics();
                        }
                  }                 
            }  

            var syncLoader = function(count) {
                  $scope.syncPictures('Syncing Pictures (' + count + '/' + $scope.l +')');
            }         

            var getToken = function(str) {                  
                  var config = 1;
                  var path = $scope.serverURlPrefix.serverURL;
                  var pass = $scope.userData.userPassword;
                  picAndDatabaseTransferService.getTokenFromServer($scope.userData.email, pass, config, path).then(function(result) {
                        $scope.getToken = 'bearer ' + result.data.signature;
                        authService.setToken('bearer ' + result.data.signature);
                        switch(str) {
                              case 'pics': 
                                    uploadPics();
                                    return;
                              case 'database':
                                    $scope.createExportFolder();
                                    return;
                        }                        
                  }, function(err){
                        if(err.status == -1) {
                              $cordovaToast.show('Please enter valid server url', 'short', 'center'); 
                              $scope.cancelLoading();
                              return;
                        }
                  });                 
            }

            var uploadPics = function(str) {
                  if($scope.pictures.length > 0) {
                        var index = 0;
                        nestedUploadImageOneByOne(index, str);                        
                  }
            }

            var nestedUploadImageOneByOne = function(index, str) {
                  if(index === $scope.pictures.length - 1) {
                        uploadPicture(index, str);
                  }else { 
                        uploadPicture(index, str);
                        ++index;
                        nestedUploadImageOneByOne(index);
                  }
            } 

            var changePictureUpdateStatus = function(id) {
                  var photo_update_status = 0;
                  var query = "UPDATE sewadars SET photo_update_status = '"+photo_update_status+"' WHERE id = '"+id+"'";      
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        
                  });
            }

            var uploadPicture = function(index, str) {
                  var trustAllHosts = true;
                  var url = encodeURI($scope.serverURlPrefix.serverURL + SCMS_SERVER_IMAGE_UPLOAD_URL);
                  var targetPath = $rootScope.baseAppDir + 'import/sewadar_pics/' + $scope.pictures[index].photo;
                  var filename = targetPath.split("/").pop();
                  var params = {};
                  var options = {
                        fileKey: "photo",
                        fileName: filename,
                        chunkedMode: false,
                        mimeType: "image/jpg",
                        httpMethod: "POST",
                        ignoreLoadingBar: true
                  };
                  var headers={'Authorization': $scope.getToken};
                  options.headers = headers;
                  params.id = $scope.pictures[index].id;
                  options.params = params;
                  $cordovaFileTransfer.upload(url, targetPath, options, trustAllHosts).then(function(result) {
                        ++$scope.p;
                        syncLoader($scope.p);
                        $timeout(function() {
                              changePictureUpdateStatus(params.id);
                              $scope.picturesCount = --$scope.pictures.length;
                              if($scope.picturesCount <=0 && str === 'database') {
                                   $scope.syncingDatabase('Syncing database (0%)');
                                   copyDBToExportFolder($scope.dbPath);
                              }else {
                                    $scope.cancelLoading();
                              }
                        }, 1000);
                  }, function(err) {
                        $timeout(function() {
                              switch(err.http_status) {
                                    case 500: 
                                          $scope.cancelLoading();
                                          $cordovaToast.show('Internal server Error', 'short', 'center');
                                          return;
                                    case 401:
                                          localStorage.removeItem("SCMS_token");
                                          getToken('pics')
                                          return;
                                    case 400:
                                          localStorage.removeItem("SCMS_token");
                                          getToken('pics')
                                          return;
                                    case null:
                                          $scope.cancelLoading();
                                          $cordovaToast.show('Please enter valid server url', 'short', 'center');
                                          return;  
                              }
                        }, 500);
                  }, function (progress) {
                        $timeout(function () {
                              $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                        })
                  });
            }

            $scope.uploadDatabase = function() {
                  if($cordovaNetwork.isOffline()){
                        $cordovaToast.show('Please Check your network connection', 'short', 'center');
                        return;
                  }else if($scope.serverURlPrefix == null) {
                        $cordovaToast.show('Please enter valid server url', 'short', 'center');
                        return;
                  }else if($scope.getToken == null) {
                        $scope.syncingDatabase('Syncing database (0%)');
                        getToken('database');
                  }else
                  if($scope.attendanceCount <=0 && $scope.nominalCount <= 0) {
                        $cordovaToast.show('No data available to sync', 'short', 'center');
                        return;
                  }else {
                        $scope.syncingDatabase('Syncing database (0%)');
                        $scope.createExportFolder();                       
                  }
            };
            /**
            * creating export folder 
            **/

            $scope.createExportFolder = function() {
                  $cordovaFile.createDir($rootScope.baseAppDir, "export", false)
                  .then(function (success) {
                        checkDirectoryDate();
                  }, function (error) {
                        checkDirectoryDate();
                  });
            }


            var checkDirectoryDate = function() {  
                  $scope.folderName = $filter('date')(new Date(), 'yyyy_MM_dd_h_mm_ss') + '/';  
                  $scope.dataBasePath = $rootScope.baseAppDir + 'export/'              
                  $cordovaFile.checkDir($scope.dataBasePath, $scope.folderName)
                  .then(function (success) {
                  }, function (error) {
                        $cordovaFile.createDir($scope.dataBasePath, $scope.folderName, false).then(function (success) {
                              //SychImageOnlyOrBoth(success.nativeURL);   
                              copyDBToExportFolder(success.nativeURL);
                        });
                  });
            }

            /**
            * syncDatabase function used to sync database
            **/
            // var SychImageOnlyOrBoth = function(path) {
            //       // if($scope.pictures.length > 0) {
            //       //       syncLoader($scope.p);
            //       //       $scope.dbPath = path;
            //       //       uploadPics('database');                        
            //       // }else {

            //             copyDBToExportFolder(path);
            //       //}                  
            // }

            var copyDBToExportFolder = function(path) {
                  $scope.dataBasePath = $rootScope.baseAppDir + 'export/' + $scope.folderName;                  
                  var dbName = 'database.sqlite';
                  window.plugins.sqlDB.copyDbToStorage(dbName, 0,$scope.dataBasePath, function(result) {
                        copiedDataInExport(path, dbName);
                  }, function(err) {
                        if(ionic.Platform.isIOS()){
                              copiedDataInExport(path, dbName);
                        }
                  })
            }

            var copiedDataInExport = function(path,dbName) {
                  var trustAllHosts = true;
                  var url = encodeURI($scope.serverURlPrefix.serverURL + SCMS_SERVER_UPLOAD_URL);
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
                  var headers={'Authorization': $scope.getToken};
                  options.headers = headers;
                  $cordovaFileTransfer.upload(url, targetPath, options, trustAllHosts).then(function(result) {
                        DeleteFromTables();
                  }, function(err) {

                        $timeout(function() {
                              switch(err.http_status) {

                                    case 500: 
                                          $scope.cancelLoading();
                                          $cordovaToast.show('Internal server Error', 'short', 'center');
                                          return;
                                    case 401:
                                          localStorage.removeItem("SCMS_token");
                                          getToken('database');
                                          return;
                                    case 400:
                                          localStorage.removeItem("SCMS_token");
                                          getToken('database');
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
                              $ionicLoading.show({ scope: $scope, template: '<div class="btn-animation-sync" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp;Syncing database ('+$scope.downloadProgress+'%)</span><br><br><br><button class ="button button-clear cancel-btn" ng-click="cancelLoading()"><i class="icon ion-close"></i>&nbsp;&nbsp;Cancel</button></div>'});

                        })
                  });
            }

            var DeleteFromTables = function() {
                  // var deleteFromTempSewadar = "DELETE FROM temp_sewadars";
                  // $cordovaSQLite.execute($rootScope.db, deleteFromTempSewadar).then(function(res) {
                  // });
                  // var deleteFromNominalRolls = "DELETE FROM nominal_roles";
                  // $cordovaSQLite.execute($rootScope.db, deleteFromNominalRolls).then(function(res1) {
                  // });
                  var deleteFromAttendance = "delete from attendances where attendances.date <> '"+$scope.currentDate+"'";
                  $cordovaSQLite.execute($rootScope.db, deleteFromAttendance).then(function(res2) {
                  }, function(err){

                  });
                  // var deleteFromNominalAttendance = "delete from attendances where date = '"+$scope.currentDate+"' and nominal_roll_id != '"+null+"'";
                  // $cordovaSQLite.execute($rootScope.db, deleteFromNominalAttendance).then(function(res3) {
                  // }, function(err){
                  // });  
                  $timeout(function() {
                        $scope.cancelLoading();
                  }, 1000);

                  setup();
            } 

            $scope.importImagesFromServer = function(requestType) {
                  $scope.importImagesProcessing();
                  if($cordovaNetwork.isOffline()){
                        $cordovaToast.show('Please Check your network connection', 'short', 'center');
                        return;
                  }else { 
                        var DownloadedDate =  $filter('date')(new Date(), 'yyyy/MM/dd');
                        var DownloadedTime =  $filter('date')(new Date(), 'h:mm:ss');
                        var params = {};                                         
                        if(picAndDatabaseTransferService.getLastImagesDownloadedTime() == null || requestType == 'all'){
                              //var url = $scope.serverURlPrefix.serverURL + SCMS_SERVER_IMAGE_DOWNLOAD_URL + "all=all";
                              var url = $scope.serverURlPrefix.serverURL + SCMS_SERVER_IMAGE_DOWNLOAD_URL + "date=2017/07/20&time=05:03";
                                
                        }else {
                              params.date = picAndDatabaseTransferService.getLastImagesDownloadedTime().date;
                              params.time =  picAndDatabaseTransferService.getLastImagesDownloadedTime().time;

                             // var url = $scope.serverURlPrefix.serverURL + SCMS_SERVER_IMAGE_DOWNLOAD_URL + "date=" + params.date +"&" +"time=" + params.time;
                              var url = $scope.serverURlPrefix.serverURL + SCMS_SERVER_IMAGE_DOWNLOAD_URL + "date=2017/07/20&time=05:03";
                        }   
                        var trustHosts = true;
                        var downloadOptions = {};
                        var targetPath = $rootScope.baseAppDir + 'sewadar.zip';
                        var headers={'Authorization': $scope.getToken};
                        downloadOptions.headers = headers;
                        $cordovaFileTransfer.download(url, targetPath, downloadOptions, trustHosts)
                        .then(function(result) { 
                             unzip();
                        }, function(err){
                        }, function (progress){
                              $scope.downloadProgress = Math.floor((progress.loaded / progress.total) * 100);
                              $ionicLoading.show({ scope: $scope, template: '<button class="button button-clear btn-animation" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp; Importing Images ('+$scope.downloadProgress+'%)</span></button>'});

                        });
                  }

                  var unzip = function() {
                  var path = $rootScope.baseAppDir + 'sewadar.zip';
                  $cordovaZip
                  .unzip(
                        path, 
                        $rootScope.baseAppDir 
                        ).then(function (res) {
                              if(requestType == 'all') {
                                    deletePictureDir('all');
                              }else{
                                    var tempPath = $rootScope.baseAppDir + 'sewadar_pics/';
                                    window.resolveLocalFileSystemURL(tempPath,
                                    function (fileSystem) {
                                          var reader = fileSystem.createReader();
                                          reader.readEntries(
                                                function (entries) {
                                                      copySewadarPicsToImport(entries);
                                                      deletePictureDir();
                                                },
                                                function (err) {
                                                });
                                          }, function (err) {
                                          });     
                              }
                        }, function (err) {

                        }, function (progressEvent) {
                              $scope.unZipProgress = (progressEvent.loaded / progressEvent.total) * 100;

                        });                
                  }

                  var deletePictureDir = function(str) {
                        if(str == 'all') {
                              var path = $rootScope.baseAppDir + 'import/';
                              $cordovaFile.removeRecursively(path, "sewadar_pics")
                              .then(function (success) {
                                    copySewadarPicsToImport();
                              }, function (error) {
                                    copySewadarPicsToImport();
                              });
                        }else {
                              var path = $rootScope.baseAppDir;
                              $cordovaFile.removeRecursively(path, "sewadar_pics")
                              .then(function (success) {
                              }, function (error) {
                              });
                        }
                  }

                  var copySewadarPicsToImport = function(picArray) {  
                        if(!angular.isDefined(picArray)) {
                              $cordovaFile.moveDir($rootScope.baseAppDir, "sewadar_pics", $rootScope.baseAppDir + 'import/', "sewadar_pics")
                              .then(function (success) {
                              }, function (error) {
                              });

                        } else {
                              for(var i=0; i<picArray.length; i++){
                                    $cordovaFile.moveFile($rootScope.baseAppDir + 'sewadar_pics/', picArray[i].name, $rootScope.baseAppDir + 'import/sewadar_pics/')
                                    .then(function (success) {
                                    }, function (error) {
                                    });
                              }
                        }
                        $timeout(function() {
                              $scope.cancelLoading();
                        }, 1000);
                        params.date = DownloadedDate;
                        params.time = DownloadedTime; 
                        picAndDatabaseTransferService.setLastImagesDownloadedTime(params);
                        $scope.syncDateAndTime = params;

                  }

            }
            $scope.importImagesProcessing = function() {
            $ionicLoading.show({ scope: $scope, template: '<button class="button button-clear btn-animation" style="color: #FFFFFF;"><ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br><span style="vertical-align: middle;">&nbsp;&nbsp; Importing Images (0%)</span></button>'});
            }
            setup();
      };
      SyncDBPicsController.$inject  = ['$log', '$scope', '$ionicHistory', '$cordovaSQLite', '$ionicLoading', 'authService', '$cordovaFileTransfer', '$timeout', '$cordovaFile', '$filter', '$rootScope', 'picAndDatabaseTransferService', '$cordovaToast', '$state', '$cordovaNetwork', 'SCMS_SERVER_UPLOAD_URL', 'SCMS_SERVER_IMAGE_UPLOAD_URL', 'SCMS_SERVER_IMAGE_DOWNLOAD_URL', '$cordovaZip'];
      angular
      .module('SCMS_ATTENDANCE')
      .controller("SyncDBPicsController", SyncDBPicsController);
})();

