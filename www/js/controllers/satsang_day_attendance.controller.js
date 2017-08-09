(function() {
       'use strict';
      /**
      * Satsang_Day_Attendance Controller
      **/
      var SatsangDayAttendanceController = function($log, $cordovaFile, $scope, $rootScope, $ionicHistory, $cordovaSQLite, $ionicPopover, $ionicModal, $filter, $cordovaToast, cfpLoadingBar, satsangDayAttendanceListService, $ionicPopup, $timeout, profilePicService, satsangDayAttendanceService, $state, $document) {
            var setup = function() {
                  $log.debug("Satsang_Day_Attendance Controller");  
                  $scope.sewadarAttendance = [];
                  $scope.sewadar ={}; 
                  $scope.getDate = satsangDayAttendanceListService.getSatsangAttendanceDate();
                  $scope.currentDate =  $filter('date')(new Date(), 'yyyy-MM-dd');
                  $scope.curDate =  $filter('date')(new Date(), 'yyyy-MM-dd');
                  $scope.today =  $filter('date')(($scope.getDate),'EEEE, d MMMM, y');
                  $scope.dirCrtl = {};
                  //$scope.limit = 20;
                  //$scope.offset = 0;
                 // $scope.getListFromSewadarsForAttendance(); 
                  $scope.isBatchNumber = true; 
                  $scope.stateName = $state.current.name;
                  $scope.searchQueryByQR = '';
                  if(profilePicService.getTimeOfPic()=='') {
                        $scope.timeStampPhoto = '';
                  }else {
                       $scope.timeStampPhoto =  profilePicService.getTimeOfPic();
                  }
                            
                  $scope.imagePath = cordova.file.externalApplicationStorageDirectory + 'import/sewadar_pics/'; 
                  if( $scope.getDate === $scope.currentDate) {
                        $scope.isCurrentDate = true;                        
                  } else {
                        $scope.isCurrentDate = false;
                  }
                  $scope.defaultImage = 'img/imgUnavailable.png';
                  $scope.isAttendaceClosed = false;
                  var attendanceClosed = satsangDayAttendanceService.getAttendaceClosedForDay();
                  if(attendanceClosed === $scope.currentDate) {
                        $scope.isAttendaceClosed = true; 
                  }else {
                        $scope.isAttendaceClosed = false; 
                  }
            };
                 

            $scope.$on('$ionicView.enter', function() {
                 $scope.getListFromSewadarsForAttendance(); 
            });  
            var showDayAttedanceClosedPopup = function() {
                  var myPopup = $ionicPopup.show({
                        scope: $scope,
                        templateUrl: 'templates/popups/day.attedance.closed.popup.html',
                        title: 'Close Day Attendance!',
                        cssClass: 'confirm-import',
                        buttons:[    
                        {
                              text: "Cancel",
                              type: 'button-balanced',
                              onTap: function(){
                                    return;
                              }
                        },
                        {
                              text: "Ok",
                              type: 'button-positive',
                              onTap: function(){
                                    satsangDayAttendanceService.setAttendaceClosedForDay($scope.currentDate);                  
                                    $state.go('app');      
                              }
                        }]
                  });       
            };      

            $scope.closeDayAttendace = function() {
                  if($scope.sewadarAttendance.length <=0) {
                        $cordovaToast.show('There is no sewadar present today', 'short', 'center');
                  }else {
                        showDayAttedanceClosedPopup();
                  }
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

            $scope.byNameOrBatch = function(str) {
                  switch (str){
                        case 'name':
                        $scope.isBatchNumber = false;
                        setFocus();
                        return;
                        case 'batch':
                        $scope.isBatchNumber = true;
                        setFocus();
                        return;
                  }
            }

            function setFocus() {
                  //Set focus on input textbox;
                  $timeout(function() {
                        var input = document.querySelector(".att-search1");
                        input.focus();
                  }, 100);
            }

            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };            

            // $scope.loadMore = function() {
            //       $scope.offset = $scope.offset + 20;
            //       $scope.getListFromSewadarsForAttendance();
            // }
            var refreshListpage = function() {
                  $rootScope.$broadcast('refreshPage');
            }
            var getSewadarData = function(query) {                   
                  cfpLoadingBar.start();                  
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        //$scope.totalRows = res.rows.length;
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.sewadarAttendance = $scope.sewadarAttendance.concat(res.rows.item(i));
                              } 
                        }
                        findImage();
                        refreshListpage(); 
                        cfpLoadingBar.complete();
                  }, function (err) { 
                  }).finally(function(){ 
                        $scope.$broadcast('scroll.infiniteScrollComplete'); 
                  });
            };

            $scope.search = function(searchQuery) {
                  $scope.searchQuery = searchQuery;
            }            


            var findImage = function() {
                  angular.forEach($scope.sewadarAttendance, function(val, i){
                        $cordovaFile.checkFile($scope.imagePath, val.photo)
                        .then(function (success) {
                              $scope.sewadarAttendance[i].isImageFound = true;
                        }, function (error) {
                              $scope.sewadarAttendance[i].isImageFound = false;
                        });  
                  });
            }

            $scope.SaveDataToAttandanceTable = function(sewadar, fromQR) {
                  var CheckQuery = "SELECT sewadar_id FROM attendances where sewadar_id ='"+sewadar.id+"' AND date = '"+$scope.currentDate+"' AND nominal_roll_id = '"+null+"'";
                  $cordovaSQLite.execute($rootScope.db, CheckQuery).then(function(res) {
                        if(res.rows.length == 0) {
                              var sewa_id = 6;
                              $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                              var nominal_roll_id = null;
                              var reference_id = null
                              var type = 'satsang_day'; 
                              var batch_type = 'permanent';  
                              var sewadar_type = 'permanent';                                                            
                              var Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id') VALUES ('"+$scope.currentDate+"','"+sewadar.id+"','"+sewa_id+"', '"+reference_id+"', '"+type+"', '"+batch_type+"','"+$scope.current+"','"+$scope.current+"', '"+sewadar_type+"','"+nominal_roll_id+"')";
                              $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(res) {
                                    $scope.sewadarAttendance.unshift(sewadar);
                                    $cordovaToast.show('Attendance marked successfully', 'short', 'center');
                                    refreshListpage();
                                    if(fromQR == 'QR') {
                                          $timeout(function() {
                                                $scope.dirCrtl.scanQRCode();
                                          }, 1000);
                                    }
                              }, (err) => {  
                              }); 

                        } else {
                              $cordovaToast.show('Attendance already marked', 'short', 'center');
                              if(fromQR == 'QR') {
                                    $timeout(function() {
                                                $scope.dirCrtl.scanQRCode();
                                    }, 1000);
                              }
                        }
                  }, (err) => {                  
                  });                 
            };
            $scope.getListFromSewadarsForAttendance = function(){                  
                  //var query = "SELECT sewadars.* FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where attendances.date= '"+$scope.getDate+"' AND attendances.nominal_roll_id= '"+null+"' ORDER BY attendances.created_at Desc LIMIT "+$scope.limit+" offset "+$scope.offset ;
                  var query = "SELECT sewadars.* FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where attendances.date= '"+$scope.getDate+"' AND attendances.nominal_roll_id= '"+null+"' ORDER BY attendances.created_at Desc";
                  getSewadarData(query);
            };              
            setup();
      };

      SatsangDayAttendanceController.$inject  = ['$log', '$cordovaFile', '$scope', '$rootScope', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', '$cordovaToast', 'cfpLoadingBar', 'satsangDayAttendanceListService', '$ionicPopup', '$timeout', 'profilePicService', 'satsangDayAttendanceService', '$state', '$document'];
      angular
      .module('SCMS_ATTENDANCE')
      .controller("SatsangDayAttendanceController", SatsangDayAttendanceController);
})();


