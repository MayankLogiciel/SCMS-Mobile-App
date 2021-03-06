(function() {
       'use strict';
      /**
      * SatsangAttendanceListController
      **/
      var SatsangAttendanceListController = function($log, $scope, $rootScope, $ionicHistory, $state, $cordovaSQLite, $filter, cfpLoadingBar, satsangDayAttendanceListService, satsangDayAttendanceService) {
            var setup = function() {
                  $log.debug("Satsang Attendance List Controller");
                  $scope.dateWiseAttendanceList = [];                  
                  $scope.getDateWiseListFromAttendance();
                  $scope.isTodaysData = true; 
                  $scope.currentDate =  $filter('date')(new Date(), 'EEEE, d MMMM, y');
                  $scope.todayDate =  $filter('date')(new Date(), 'yyyy-MM-dd'); 
                  $scope.count = 0;
                  $scope.editRequired = satsangDayAttendanceService.getAttendaceClosedForDay();
            }; 

            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.viewAttendees= function(date, action) {
                  if(action == 'edit') {
                        localStorage.removeItem('SCMS_AttendaceClosedForDay');
                  }
                  satsangDayAttendanceListService.setSatsangAttendanceDate(date);
                  $state.go('satsang_day_attendance');
            }

            //refreshing page 
            $rootScope.$on('refreshPage',function(event, data){
                  setup();
            });
            
            $scope.getDateWiseListFromAttendance = function() {
                  //cfpLoadingBar.start();
                  var query = "SELECT DISTINCT attendances.date from attendances where attendances.nominal_roll_id= '"+null+"'";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        if(res.rows.length > 0) {
                              $scope.dateWiseAttendanceList = []; 
                              for(var i= 0; i<res.rows.length; i++) { 
                                    if(res.rows.item(i).date != $scope.todayDate) {
                                          $scope.isTodaysData = false; 
                                    } else {
                                          $scope.isTodaysData = true;
                                    }
                                    $scope.dateWiseAttendanceList = $scope.dateWiseAttendanceList.concat(res.rows.item(i));
                              } 
                              $scope.getTotalAttendeesOnPerticularDate($scope.dateWiseAttendanceList);
                        }
                  }, function (err) { 
                  });
            }; 

            $scope.getTotalAttendeesOnPerticularDate = function(data) {
                  angular.forEach(data, function(val){
                        var query = "SELECT COUNT(DISTINCT id) as count FROM attendances WHERE attendances.date = '"+val.date+"' AND attendances.nominal_roll_id= '"+null+"'";
                        $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    val.attendeesCount = res.rows.item(i).count;
                              }
                              //cfpLoadingBar.complete();  
                        });
                  });
            } 
            setup();
      };

      SatsangAttendanceListController.$inject  = ['$log', '$scope', '$rootScope', '$ionicHistory', '$state', '$cordovaSQLite', '$filter', 'cfpLoadingBar', 'satsangDayAttendanceListService', 'satsangDayAttendanceService'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("SatsangAttendanceListController", SatsangAttendanceListController);
})();

