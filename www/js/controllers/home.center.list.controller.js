(function () {
  'use strict';
  /**
  * Satsang_Day_Attendance Controller
  **/
  var HomeCenterAttendanceListController = function ($log, $cordovaFile, $scope, $rootScope, $ionicHistory, $cordovaSQLite, $ionicPopover, $ionicModal, $filter, $cordovaToast, cfpLoadingBar, satsangDayAttendanceListService, $ionicPopup, $timeout, profilePicService, satsangDayAttendanceService, $state, $document, $ionicActionSheet, $stateParams) {
    var setup = function () {
      $log.debug("Home Center Controller");
      $scope.sewadarAttendance = [];
      $scope.sewadar = {};
      $scope.inOut = {
        time_in: new Date(1970, 0, 1, 14, 57, 0),
        time_out: new Date()
      };
      $scope.getDate = satsangDayAttendanceListService.getSatsangAttendanceDate();
      $scope.limit = 20;
      $scope.offset = 0;
      $scope.currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');
      $scope.curDate = $filter('date')(new Date(), 'yyyy-MM-dd');
      $scope.today = $filter('date')(($scope.getDate), 'EEE, d MMM, y');
      $scope.getListFromSewadarsForAttendance('load');
      $scope.isBatchNumber = true;
      $scope.isMark = $stateParams.action == 'mark' ? true : false;
      $scope.stateName = $state.current.name;
      $scope.type = 'home_center';
      if (profilePicService.getTimeOfPic() == '') {
        $scope.timeStampPhoto = '';
      } else {
        $scope.timeStampPhoto = profilePicService.getTimeOfPic();
      }

      $scope.imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/';
      if ($scope.getDate === $scope.currentDate) {
        $scope.isCurrentDate = true;
      } else {
        $scope.isCurrentDate = false;
      }
      $scope.defaultImage = 'img/imgUnavailable.png';
      $scope.isAttendaceClosed = false;
      var attendanceClosed = satsangDayAttendanceService.getAttendaceClosedForDay();
      if (attendanceClosed === $scope.currentDate) {
        $scope.isAttendaceClosed = true;
      } else {
        $scope.isAttendaceClosed = false;
      }
      $scope.totalAttendees();
      $scope.currentAttendees();
      $scope.in = true;
    };
    $scope.openNameOrBadgePopover = function ($event) {
      $ionicPopover.fromTemplateUrl('templates/popovers/nameorbadgebutton.popover.html', {
        scope: $scope,
        //backdropClickToClose: false                  
      }).then(function (popover) {
        $scope.popover = popover;
        $scope.popover.show($event);
      });
    };

    $scope.loadMore = function () {
      $scope.offset = $scope.offset + 20;
      $scope.getListFromSewadarsForAttendance();
    }

    $scope.closeNameBadgePopover = function () {
      $scope.popover.hide();
    }

    $scope.byNameOrBatch = function (str) {
      switch (str) {
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
      $timeout(function () {
        var input = document.querySelector(".att-search1");
        input.focus();
      }, 100);
    }

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };

    $scope.loadMore = function () {
      $scope.offset = $scope.offset + 20;
      $scope.getListFromSewadarsForAttendance();
    }
    var refreshListpage = function () {
      $rootScope.$broadcast('refreshPage');
    }

    var getSewadarData = function (query) {
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        $scope.totalRows = res.rows.length;
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            res.rows.item(i).time_out = res.rows.item(i).time_out;
            if (res.rows.item(i).time_out != 'null') {
              res.rows.item(i).th = diff_hours(
                $filter('date')(new Date(res.rows.item(i).time_in), 'yyyy-MM-dd H:mm:ss'), 
                $filter('date')(new Date(res.rows.item(i).time_out), 'yyyy-MM-dd H:mm:ss')
              );
              res.rows.item(i).time_out = $filter('date')(new Date(res.rows.item(i).time_out), 'H:mm:ss');
            }
            res.rows.item(i).time_in = $filter('date')(new Date(res.rows.item(i).time_in), 'H:mm:ss');
            $scope.sewadarAttendance = $scope.sewadarAttendance.concat(res.rows.item(i));
          }
        }
        findImage();
        cfpLoadingBar.complete();
      }, function (err) {
      }).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.search = function (searchQuery) {
      $scope.searchQuery = searchQuery;
    }    

    $scope.timeFilter = function(type) {
      $scope.sewadarAttendance = [];
      var query = '';
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      cfpLoadingBar.start();
      switch (type) {
        case 'in':
          query = "SELECT sewadars.*, attendances.time_in, attendances.time_out, attendances.sewa_id FROM sewadars LEFT JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.type='home_center' AND attendances.time_in<>'" + null + "' AND attendances.sewa_id = '" + sewa_id + "' GROUP BY attendances.sewadar_id ORDER BY attendances.created_at Desc LIMIT " + $scope.limit + " offset " + $scope.offset;
          getSewadarData(query);
          break;
          case 'out':
          query = "SELECT sewadars.*, attendances.time_in, attendances.time_out, attendances.sewa_id FROM sewadars LEFT JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.type='home_center' AND attendances.time_out<>'" + null + "' AND attendances.sewa_id = '" + sewa_id + "' GROUP BY attendances.sewadar_id ORDER BY attendances.created_at Desc LIMIT " + $scope.limit + " offset " + $scope.offset;
          getSewadarData(query);
          break;
          case 'both':
          query = "SELECT sewadars.*, attendances.time_in, attendances.time_out, attendances.sewa_id FROM sewadars LEFT JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.type='home_center' AND attendances.time_out<>'" + null + "' AND attendances.time_in<>'" + null + "' AND attendances.sewa_id = '" + sewa_id + "' ORDER BY attendances.created_at Desc LIMIT " + $scope.limit + " offset " + $scope.offset;
          getSewadarData(query);
          
          break;
      }
    }

    function diff_hours(date1, date2) {

      var dt1 = new Date(date1);
      var dt2 = new Date(date2);
      var diff = Math.abs(dt1 - dt2) / 36e5;

      var hour = 0;
      if (diff < 1.5) return 0;

      if (diff >= 1.5) hour = 2;
      if (diff > 2) hour = 4;
      if (diff > 4) hour = 8;

      return hour;
    }

    var findImage = function () {
      angular.forEach($scope.sewadarAttendance, function (val, i) {
        $cordovaFile.checkFile($scope.imagePath, val.photo)
          .then(function (success) {
            $scope.sewadarAttendance[i].isImageFound = true;
          }, function (error) {
            $scope.sewadarAttendance[i].isImageFound = false;
          });
      });
    }

    $scope.totalAttendees = function () {
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      var query = "SELECT COUNT(DISTINCT sewadar_id) as count FROM attendances WHERE date(attendances.date) = '" + $scope.currentDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.type= 'home_center' AND attendances.sewa_id = '" + sewa_id + "'";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        for (var i = 0; i < res.rows.length; i++) {
          $scope.count = res.rows.item(i).count;
        }
      });
    }

    $scope.currentAttendees = function () {
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      var query = "SELECT COUNT(DISTINCT sewadar_id) as count FROM attendances WHERE date(attendances.date) = '" + $scope.currentDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.time_in<> '" + null + "' AND attendances.time_out= '" + null + "' AND attendances.type= 'home_center' AND attendances.sewa_id = '" + sewa_id + "'";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        for (var i = 0; i < res.rows.length; i++) {
          $scope.curent_count = res.rows.item(i).count;
        }
      });
    }

    $scope.SaveDataToAttandanceTable = function (sewadar, fromQR) {
      $scope.sewadarAttendance = [];
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
      var nominal_roll_id = null;
      var reference_id = null
      var type = 'home_center';
      var batch_type = 'permanent';
      var sewadar_type = 'permanent';
      var time = $filter('date')(new Date(), 'yyyy-MM-dd H:mm:ss');

      if ($scope.in) {
        var Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id', 'time_in', 'time_out') VALUES ('" + $scope.currentDate + "','" + sewadar.id + "','" + sewa_id + "', '" + reference_id + "', '" + type + "', '" + batch_type + "','" + $scope.current + "','" + $scope.current + "', '" + sewadar_type + "','" + nominal_roll_id + "', '" + time + "', '" + null + "')";
        $cordovaSQLite.execute($rootScope.db, Insertquery).then(function (res) {
          $cordovaToast.show('Entry marked successfully', 'short', 'center');
          $scope.currentAttendees();
          $scope.totalAttendees();
          $scope.getListFromSewadarsForAttendance();
        }, function (err) {
        });
      }
    };

    $scope.getListFromSewadarsForAttendance = function (action) {
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      if (angular.isDefined(action) || action == 'load') {
        cfpLoadingBar.start();
      }
      var query = "SELECT sewadars.*, attendances.id as s_id, attendances.time_in, attendances.time_out, attendances.sewa_id FROM sewadars LEFT JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND  attendances.nominal_roll_id= '" + null + "' AND attendances.type='home_center'  AND attendances.sewa_id = '" + sewa_id + "' GROUP BY attendances.sewadar_id ORDER BY attendances.created_at Desc LIMIT " + $scope.limit + " offset " + $scope.offset;
      getSewadarData(query);
    };
    setup();
  };

  HomeCenterAttendanceListController.$inject = ['$log', '$cordovaFile', '$scope', '$rootScope', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', '$cordovaToast', 'cfpLoadingBar', 'satsangDayAttendanceListService', '$ionicPopup', '$timeout', 'profilePicService', 'satsangDayAttendanceService', '$state', '$document', '$ionicActionSheet', '$stateParams'];
  angular
    .module('SCMS_ATTENDANCE')
    .controller("HomeCenterAttendanceListController", HomeCenterAttendanceListController);
})();


