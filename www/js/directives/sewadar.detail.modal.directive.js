(function(){
      'use strict';
      var sewadarDetailModalDiretive = function($cordovaSQLite, $ionicModal, $cordovaFile, $ionicPopup, $cordovaToast, $stateParams, $timeout, $state, $rootScope, profilePicService) {          
            return {
                  restrict: 'A',
                  controller: ['$scope', '$element', '$attrs', function($scope,$element, $attrs){
                        $scope.imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/'; 
                        $scope.defaultImage = 'img/imgUnavailable.png'; 
                        $scope.sewadar ={}; 
                        $scope.isImageNotAvailable = false;
                        $scope.nominal_id = $stateParams.id; 
                        var isModalOpen = false;
                       
                        $scope.openModalForSewadarDetail = function() {
                              $ionicModal.fromTemplateUrl('templates/modals/sewadar.info.modal.html', {
                                    scope: $scope,
                                    animation: 'slide-in-up',
                                    backdropClickToClose: false
                              }).then(function(modal) {
                                    $scope.modal = modal;
                                    $scope.modal.show();
                                    isModalOpen = true;
                              });
                        };

                        $scope.clickPhoto = function() {
                              $scope.selectedSewadarPhoto = $scope.sewadar.id + '.jpg';
                              navigator.camera.getPicture(onSuccess, onFail, {
                                    quality: 50,
                                    destinationType: Camera.DestinationType.FILE_URI,
                                    correctOrientation: true,
                                    targetWidth: 300,
                                    targetHeight: 300,
                              });
                        }

                        var refreshListpage = function() {
                              var query = "select * from sewadars where id =" + $scope.sewadar.id;
                              $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                                    for(var i= 0; i<res.rows.length; i++) { 
                                          $scope.sewadar = res.rows.item(i);
                                    }     
                                    $rootScope.$broadcast('refreshPageAfterPhotoClicked', {sewadar: $scope.sewadar, mode: $scope.mode});
                                    $scope.selectedSewadarDetail($scope.sewadar, $scope.mode, 'doNotOpen'); 
                              })
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
                                    var query = "UPDATE sewadars SET photo = '"+replacedPhotoName+"', photo_update_status = '"+photo_update_status+"' WHERE sewadars.id = '"+$scope.sewadar.id+"'";      
                                    $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                                          $cordovaToast.show('Profile picture updated', 'short', 'center');      
                                          refreshListpage(); 
                                    });
                              });
                        }

                        function onFail(message) {
                        }

                        $rootScope.$on('popover-open', function(event, args) {
                              $scope.popover_open = event.name;
                        });

                        $scope.closeModalForSewadarDetail = function() {
                              setFocus();
                              if(isModalOpen) {
                                    $scope.modal.hide();
                              }
                              if($scope.popover_open === 'popover-open') {
                                    $scope.closePopoverForSewadar();
                              }
                              isModalOpen = false;
                        };

                        $scope.$on('modal.hidden', function() {
                              $scope.modal.remove();
                        });

                        $scope.deleteSewadar = function(sewadar) {
                              if(isModalOpen) {
                                    $scope.modal.hide();
                              }
                              showDeleteConfirm(sewadar);                
                        };   


                        function setFocus() {
                              //Set focus on input textbox;
                              $timeout(function() {
                                    var input = document.querySelector(".att-search");
                                    if(input) {
                                          input.focus();
                                    }
                              }, 100);
                        }


                        var showDeleteConfirm = function(sewadar) {                             
                              $ionicPopup.confirm({
                                    title: 'Please Confirm',
                                    template: 'Are you sure you want to detete '+sewadar.name+' from attendees list? ',
                                    cssClass: 'confirm-delete',
                                    buttons:[    
                                    {
                                          text: "Cancel",
                                          type: 'button-balanced',
                                          onTap: function(){
                                                setFocus();
                                                if(isModalOpen) {
                                                      $scope.modal.hide();
                                                }
                                    }
                              },
                              {
                                    text: "Delete",
                                    type: 'button-positive',
                                    onTap: function(){
                                          setFocus();
                                          if(isModalOpen) {
                                                $scope.modal.hide();
                                          }
                                          if($scope.nominal_id) {
                                                var query = "UPDATE attendances set status = 'deleted' WHERE sewadar_id = '"+sewadar.id+"' AND nominal_roll_id = "+$scope.nominal_id;
                                                
                                          } 
                                          else {
                                                var query = "DELETE FROM attendances WHERE sewadar_id = '"+sewadar.id+"' AND attendances.nominal_roll_id = 'null'";
                                          }                            
                                          $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                                                for(var i=0; i < $scope.sewadarAttendance.length; i++) {
                                                      if($scope.sewadarAttendance[i].id == sewadar.id) {
                                                            $scope.sewadarAttendance.splice(i,true);
                                                            if($scope.nominal_id) {
                                                                  var checkIncharge = "select incharge_id from nominal_roles where id = "+$scope.nominal_id;
                                                                  $cordovaSQLite.execute($rootScope.db, checkIncharge).then(function(ressult) {
                                                                        for(var i= 0; i<ressult.rows.length; i++) { 
                                                                              $scope.incharge = ressult.rows.item(i);
                                                                        } 
                                                                        if($scope.incharge.incharge_id == sewadar.id) {
                                                                              var updateIncharge = "UPDATE nominal_roles SET incharge_id = "+null+", incharge_type = '"+null+"' WHERE id = '"+$scope.nominal_id+"'";
                                                                              $cordovaSQLite.execute($rootScope.db, updateIncharge).then(function(response) {
                                                                                    $rootScope.$broadcast('refreshPage');
                                                                              });
                                                                        }
                                                                  });
                                                                  $cordovaToast.show('Sewadar removed', 'short', 'center');
                                                            } else {
                                                                  $cordovaToast.show('Attendance unmarked successfully', 'short', 'center');
                                                            }
                                                            return;
                                                      }
                                                }
                                                
                                          }, function(err) {
                                          });  


                                    }
                              }]
                        });                
                        };      

                       
                        $scope.selectedSewadarDetail = function(sewadar, str, warn) {
                              var isStateNameSewadars = $state.current.name;
                              $scope.mode = str;
                              if(str==='viewSewadar') {
                                    $scope.buttonTextForSewadarModel = 'REMOVE ATTENDANCE';                                    
                              }else {
                                    $scope.buttonTextForSewadarModel = 'MARK ATTENDANCE';
                              }
                              $scope.sewadar = sewadar;
                              $cordovaFile.checkFile($scope.imagePath, sewadar.photo).then(function (success) { 
                                    $scope.isImageNotAvailable = false;
                              }, function (error) {
                                    $scope.isImageNotAvailable = true;                 
                              });
                              if(warn=='doNotOpen') {
                                    return;
                              }else {
                                    if(isStateNameSewadars == 'sewadars') {
                                          $scope.showCameraOption = true;
                                    }else {
                                          $scope.showCameraOption = false;
                                    }
                                    $scope.openModalForSewadarDetail();                  
                              }
                        }  
                  }]  
            }
      }
      sewadarDetailModalDiretive.$inject = ['$cordovaSQLite', '$ionicModal', '$cordovaFile', '$ionicPopup', '$cordovaToast', '$stateParams', '$timeout', '$state', '$rootScope', 'profilePicService'];

      angular
      .module('SCMS_ATTENDANCE')
      .directive("sewadarDetailModalDiretive", sewadarDetailModalDiretive);
})();
