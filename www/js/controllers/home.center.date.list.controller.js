(function () {
  'use strict';
  /**
  * HomeCenterListController
  **/
  var HomeCenterListController = function ($log, $scope, $rootScope, $ionicHistory, $state, $cordovaSQLite, $filter, cfpLoadingBar, satsangDayAttendanceListService, satsangDayAttendanceService) {
    var setup = function () {
      $log.debug("Satsang Attendance List Controller");
      $scope.dateWiseAttendanceList = [];
      $scope.getDateWiseListFromAttendance();
      $scope.isTodaysData = true;
      $scope.currentDate = $filter('date')(new Date(), 'EEE, d MMM, y');
      $scope.todayDate = $filter('date')(new Date(), 'yyyy-MM-dd');
      $scope.count = 0;
      $scope.editRequired = satsangDayAttendanceService.getAttendaceClosedForDay();
    };

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };

    $scope.viewAttendees = function (date, action) {
      if (date == $scope.todayDate && !angular.isDefined(action) && ($scope.editRequired == null || $scope.editRequired == 'null')) {
        $state.go('home_center_attendance');
      } else if (date == $scope.todayDate && (angular.isDefined(action) || action == 'edit')) {
        localStorage.removeItem('SCMS_AttendaceClosedForDay');
        satsangDayAttendanceListService.setSatsangAttendanceDate(date);
        $state.go('home_center_attendance');
      } else if (date == $scope.todayDate && ($scope.editRequired != null || $scope.editRequired != 'null') && $scope.todayDate == $scope.editRequired) {
        $state.go('home_center_attendance_list');
        satsangDayAttendanceListService.setSatsangAttendanceDate(date);
      } else if (date == $scope.todayDate && ($scope.editRequired != null || $scope.editRequired != 'null') && $scope.todayDate != $scope.editRequired) {
        localStorage.removeItem('SCMS_AttendaceClosedForDay');
        $state.go('home_center_attendance');
        satsangDayAttendanceListService.setSatsangAttendanceDate(date);
      } else {
        $state.go('home_center_attendance_list');
        satsangDayAttendanceListService.setSatsangAttendanceDate(date);
      }
    }

    //refreshing page 
    $rootScope.$on('refreshPage', function (event, data) {
      setup();
    });

    $scope.getDateWiseListFromAttendance = function () {
      cfpLoadingBar.start();
      var query = "SELECT DISTINCT date(attendances.date) as date from attendances where attendances.nominal_roll_id= '" + null + "' AND attendances.type='home_center'";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        if (res.rows.length > 0) {
          $scope.dateWiseAttendanceList = [];
          for (var i = 0; i < res.rows.length; i++) {
            if (res.rows.item(i).date != $scope.todayDate) {
              $scope.isTodaysData = false;
            } else {
              $scope.isTodaysData = true;
            }
            $scope.dateWiseAttendanceList = $scope.dateWiseAttendanceList.concat(res.rows.item(i));
          }
          $scope.getTotalAttendeesOnPerticularDate($scope.dateWiseAttendanceList);
        }
        cfpLoadingBar.complete()
      }, function (err) {
      });
    };

    $scope.getTotalAttendeesOnPerticularDate = function (data) {
      angular.forEach(data, function (val) {
        var query = "SELECT COUNT(DISTINCT id) as count FROM attendances WHERE date(attendances.date) = '" + val.date + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.type= 'home_center'";
        $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
          for (var i = 0; i < res.rows.length; i++) {
            val.attendeesCount = res.rows.item(i).count;
          }
        });
      });
    }
    setup();
  };

  HomeCenterListController.$inject = ['$log', '$scope', '$rootScope', '$ionicHistory', '$state', '$cordovaSQLite', '$filter', 'cfpLoadingBar', 'satsangDayAttendanceListService', 'satsangDayAttendanceService'];

  angular
    .module('SCMS_ATTENDANCE')
    .controller("HomeCenterListController", HomeCenterListController);
})();

