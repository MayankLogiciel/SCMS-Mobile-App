(function() {
       'use strict';
      /**
      * Satsang_Day_Attendance Controller
      **/
      var SatsangDayController = function($log, $scope, $ionicHistory, $filter, $cordovaSQLite, $rootScope, $cordovaToast, $timeout, $ionicPopover, $state, satsangDayAttendanceListService, satsangDayAttendanceService, $ionicPopup) {
            var setup = function() {
                  $log.debug("Satsang_Day Controller"); 
                  $scope.currentDate =  $filter('date')(new Date(), 'yyyy-MM-dd'); 
                  $scope.today =  $filter('date')((new Date()),'EEE, d MMM, y');
                  $scope.count = 0; 
                  $scope.dirCrtl = {};
                  $scope.isBatchNumber = true; 
                  $scope.totalAttendees();
            };     

            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.totalAttendees = function() {
                  var query = "SELECT COUNT(DISTINCT id) as count FROM attendances WHERE attendances.date = '"+$scope.currentDate+"' AND attendances.nominal_roll_id= '"+null+"'";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.count = res.rows.item(i).count;
                        }
                  });
            }

            $scope.showSatsangAttendees = function() {
                  if($scope.count<=0) {
                        $cordovaToast.show('There is no sewadar present today', 'short', 'center');
                  }else {
                        satsangDayAttendanceListService.setSatsangAttendanceDate($scope.currentDate);
                        $state.go('satsang_day_attendance');                       
                  }
            }

            $scope.closeDayAttendace = function() {
                  if($scope.count<=0) {
                        $cordovaToast.show('There is no sewadar present today', 'short', 'center');
                  }else {
                        showDayAttedanceClosedPopup();
                  }
            }

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
                                    $cordovaToast.show('Attendance marked successfully', 'short', 'center');
                                    $scope.count = $scope.count + 1;
                                    if(fromQR == 'QR') {
                                          $timeout(function() {
                                                $scope.dirCrtl.scanQRCode();
                                          }, 1000);
                                    }
                              }, function(err) {  
                              }); 

                        } else {
                              $cordovaToast.show('Attendance already marked', 'short', 'center');
                              if(fromQR == 'QR') {
                                    $timeout(function() {
                                                $scope.dirCrtl.scanQRCode();
                                    }, 1000);
                              }
                        }
                  }, function(err) {                  
                  });                 
            };

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
           
            setup();
      };

      SatsangDayController.$inject  = ['$log', '$scope', '$ionicHistory', '$filter', '$cordovaSQLite', '$rootScope', '$cordovaToast', '$timeout', '$ionicPopover', '$state', 'satsangDayAttendanceListService', 'satsangDayAttendanceService', '$ionicPopup'];
      angular
      .module('SCMS_ATTENDANCE')
      .controller("SatsangDayController", SatsangDayController);
})();

