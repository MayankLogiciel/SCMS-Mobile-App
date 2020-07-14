(function() {
       'use strict';
      /**
      * Sewadars Controller
      **/
      var SewadarsController = function($log, $scope, $timeout, $ionicHistory, $state, $ionicPopup, $cordovaToast, $cordovaFile, $filter, $cordovaSQLite, $ionicActionSheet, profilePicService, $rootScope, $ionicPopover, cfpLoadingBar) {
            var setup = function() {
                  $log.debug("Sewadars Controller");  
                  $scope.imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/'; 
                  $scope.defaultImage = 'img/imgUnavailable.png'; 
                  $scope.sewadarLimit = 10;
                  $scope.isBatchNumber = true; 
                  if(profilePicService.getTimeOfPic()=='') {
                        $scope.timeStampPhoto = '';
                        }else {
                        $scope.timeStampPhoto =  profilePicService.getTimeOfPic();
                  }
                  alterPhotoUpdateStatus();
            };

            $scope.createSewadar = function() {
                  console.log('create');
                  $state.go('new-sewadar', {action: 'add'})
            }

            $scope.openNameOrBadgePopover = function($event) {
                  $ionicPopover.fromTemplateUrl('templates/popovers/nameorbadgebutton.popover.html', {
                        scope: $scope,
                        //backdropClickToClose: false                  
                  }).then(function(popover) {
                        $scope.popover = popover; 
                        $scope.popover.show($event);
                  });
            };

            $scope.closeNameBadgePopover = function() {
                  $scope.popover.hide();
            }

            $scope.$on('$destroy', function () {
                  $scope.popover.remove();
            });

            $scope.search = function(searchQuery) {
                  $scope.str = searchQuery;
                  getSewadarList(searchQuery);                                              
            };
            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.byNameOrBatch = function(str) {
                  switch (str){
                        case 'name':
                        $scope.isBatchNumber = false;
                        return;
                        case 'batch':
                        $scope.isBatchNumber = true;
                        return;
                  }
            }
            var getSewadarList = function (searchQuery) {
                  if(searchQuery != '') {
                       cfpLoadingBar.start();
                  }
                  if ( !isNaN(searchQuery) && angular.isNumber(+searchQuery)) {
                        if(searchQuery.length > 0) {
                              var createIndexForBatch = "CREATE INDEX batch_index ON sewadars(batch_no)";
                              $cordovaSQLite.execute($rootScope.db, createIndexForBatch).then(function(res1) {
                              },function(err) {
                              });
                              var query = "select * from sewadars INDEXED BY batch_index where batch_no LIKE '"+searchQuery+'%'+"' OR batch_no = '"+searchQuery+"' order by batch_no LIMIT "+$scope.sewadarLimit;
                              searchData(query);
                        }
                  } else {
                        if(searchQuery.length > 1) {
                              var createIndexForName = "CREATE INDEX name_index ON sewadars(name)";
                              $cordovaSQLite.execute($rootScope.db, createIndexForName).then(function(res2) {

                              });
                              var query = "select * from sewadars INDEXED BY name_index where name  LIKE '"+'%'+searchQuery+'%'+"' OR name='"+searchQuery+"' order by name LIMIT "+$scope.sewadarLimit;
                              searchData(query);
                        } else {
                              $cordovaToast.show('Please enter atleast 2 characters', 'short', 'center');

                        }
                  }
            }

            var alterPhotoUpdateStatus = function() {
                  var query = "select * from sewadars";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {                   
                        for(var i= 0; i<res.rows.length; i++) { 
                              if(!angular.isDefined(res.rows.item(i).photo_update_status)){
                                   var alterQuery = "ALTER TABLE sewadars ADD photo_update_status INTEGER";
                                   $cordovaSQLite.execute($rootScope.db, alterQuery).then(function(response) {
                                   });
                              }
                        } 
                  })
            }

            $rootScope.$on('refreshPageAfterPhotoClicked',function(event, data){
                  getSewadarList($scope.str);
            });

            var findImage = function() {
                  angular.forEach($scope.sewadars, function(val, i){
                        $cordovaFile.checkFile($scope.imagePath, val.photo)
                        .then(function (success) {
                              $scope.sewadars[i].isImageFound = true;
                        }, function (error) {
                              $scope.sewadars[i].isImageFound = false;
                        });  
                  });
            }

            var searchData = function(query) {                                    
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) { 
                        $scope.sewadars = [];
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.sewadars.push(res.rows.item(i)); 
                              } 
                              findImage();
                        }else {
                              $cordovaToast.show('No result found', 'short', 'center');
                        } 
                        cfpLoadingBar.complete();
                  }, function (err) { 
                  });
            }
            $scope.quickActions = function(sewadar) {
                  $scope.selectedSewadar = sewadar;
                  $scope.selectedSewadarPhoto = sewadar.id + '.jpg';
                  $scope.buttonText = [                   
                      {text : '<i class="icon ion-camera camera-padding"></i>Change Profile Picture'}
                  ];                
                  var buttons = [];
                  angular.forEach($scope.buttonText, function (val) {  
                        buttons.push({text: val.text});
                  }); 
                  $ionicActionSheet.show({                        
                        buttons: buttons,
                        titleText: 'Quick Actions',
                        cancelText: '<i class="icon ion-close-round assertive"></i> Cancel',
                        cancel: function() {
                              $log.debug('CANCELLED');
                        },
                        buttonClicked: function(index) {
                              switch (index){
                                    case 0 :
                                          navigator.camera.getPicture(onSuccess, onFail, {
                                                quality: 50,
                                                destinationType: Camera.DestinationType.FILE_URI,
                                                correctOrientation: true,
                                                targetWidth: 300,
                                                targetHeight: 300
                                          });
                                          return true;   
                              }
                        }
                  });
            }

            function onSuccess(imageData) {
                  plugins.crop(function success (data) {
                        var str = data;
                        var filename = str.split('/').pop().replace();
                        $scope.croppedImageName = filename.substring(0, filename.indexOf('?'));
                        $scope.timeStampPhoto = filename.substring(filename.lastIndexOf('?') + 1);
                        profilePicService.setTimeOfPic($scope.timeStampPhoto);
                        copyNewPhoto(cordova.file.externalCacheDirectory, $scope.croppedImageName, $scope.imagePath, $scope.selectedSewadarPhoto);
                  }, 
                  function fail () {
                  }, imageData, {quality:100});
            }

            var copyNewPhoto = function(fromPath, copiedPhotoName, toPath, replacedPhotoName) {
                  var photo_update_status = 1;
                  $cordovaFile.copyFile(fromPath, copiedPhotoName, toPath, replacedPhotoName).then(function(success) {
                        var query = "UPDATE sewadars SET photo = '"+replacedPhotoName+"', photo_update_status = '"+photo_update_status+"' WHERE sewadars.id = '"+$scope.selectedSewadar.id+"'";      
                        $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                              $cordovaToast.show('Profile picture updated', 'short', 'center');      
                        });
                        getSewadarList($scope.str);
                  });
            }

            function onFail(message) {
            }
            setup();
      };
      SewadarsController.$inject  = ['$log', '$scope', '$timeout', '$ionicHistory', '$state', '$ionicPopup', '$cordovaToast', '$cordovaFile', '$filter', '$cordovaSQLite', '$ionicActionSheet', 'profilePicService', '$rootScope', '$ionicPopover', 'cfpLoadingBar'];
      angular
      .module('SCMS_ATTENDANCE')
      .controller("SewadarsController", SewadarsController);
})();

