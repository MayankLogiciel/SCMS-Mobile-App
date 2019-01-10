(function () {
  'use strict';
  /**
  * Satsang_Day_Attendance Controller
  **/
  var HomeCenterAttendanceListController = function ($log, $cordovaFile, $scope, $rootScope, $ionicHistory, $cordovaSQLite, $ionicPopover, $ionicModal, $filter, $cordovaToast, cfpLoadingBar, satsangDayAttendanceListService, $ionicPopup, $timeout, profilePicService, satsangDayAttendanceService, $state, $document, $ionicActionSheet) {
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
            var d = $filter('date')(new Date(res.rows.item(i).updated_at), 'yyyy-MM-dd')
            var dti = d +' '+res.rows.item(i).time_in;
            var dto = d +' '+res.rows.item(i).time_out;
            res.rows.item(i).th = diff_hours(new Date(dto), new Date(dti));
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

    $scope.showConfirm = function (sewadar) {
      if (sewadar.time_in == 'null' && sewadar.time_out == 'null') {
        var date = $filter('date')(new Date(), 'yyyy, MM, dd, hh, mm, ss');
        var a11 = date.split(',');
        $scope.inOut.time_in = new Date(Number(a11[0]), Number(a11[1]), Number(a11[2]), Number(a11[3]), Number(a11[4]), Number(a11[5]));
        $scope.inOut.time_out = new Date(Number(a11[0]), Number(a11[1]), Number(a11[2]), Number(a11[3]), Number(a11[4]), Number(a11[5]));
      }else {
        var d = $filter('date')(new Date(sewadar.updated_at), 'yyyy-MM-dd')
        var a1 = d.split('-');
        var a2 = sewadar.time_in.split(':');
        var a3 = sewadar.time_out.split(':');
        $scope.inOut.time_in = new Date(Number(a1[0]), Number(a1[1]), Number(a1[2]), Number(a2[0]), Number(a2[1]), Number(a2[2]))
        $scope.inOut.time_out = new Date(Number(a1[0]), Number(a1[1]), Number(a1[2]), Number(a3[0]), Number(a3[1]), Number(a3[2]))
      }
      $ionicPopup.confirm({
        title: 'Please Enter IN-OUT Time',
        templateUrl: 'templates/popups/time.in.out.popup.html',
        cssClass: 'confirm-delete',
        scope: $scope,
        buttons: [
          {
            text: "Cancel",
            type: 'button-balanced',
            onTap: function () {
            }
          },
          {
            text: 'OK',
            type: 'button-positive',
            onTap: function () {
              updateTime(sewadar);
            }
          }]
      });
    };

    var updateTime = function (sewadar) {
      var time_in = $filter('date')(new Date($scope.inOut.time_in), 'hh:mm:ss');
      var time_out = $filter('date')(new Date($scope.inOut.time_out), 'hh:mm:ss'); 
      var c = diff_hours($scope.inOut.time_out, $scope.inOut.time_in)     
      if(c < 0) {
        $cordovaToast.show('Out date should be graeter', 'short', 'center');
        $scope.showConfirm(sewadar);
        return;
      }
      sewadar.th = c;
      var query = "UPDATE attendances SET time_in = '" + time_in + "', time_out = '" + time_out + "' WHERE sewadar_id = '" + sewadar.id + "'";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        $cordovaToast.show('Attendance saved successfully', 'short', 'center');
        sewadar.time_in = time_in;
        sewadar.time_out = time_out;
      });
    }

    function diff_hours(dt2, dt1) {
      var diff = (dt2.getTime() - dt1.getTime()) / 1000;
      diff /= (60 * 60);
      return Math.round(diff);
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

    $scope.getListFromSewadarsForAttendance = function (action) {
      if (angular.isDefined(action) || action == 'load') {
        cfpLoadingBar.start();
      }
      var query = "SELECT sewadars.*, attendances.time_in, attendances.time_out FROM sewadars LEFT JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.type='home_center' ORDER BY attendances.created_at Desc LIMIT " + $scope.limit + " offset " + $scope.offset;
      getSewadarData(query);
    };
    setup();
  };

  HomeCenterAttendanceListController.$inject = ['$log', '$cordovaFile', '$scope', '$rootScope', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', '$cordovaToast', 'cfpLoadingBar', 'satsangDayAttendanceListService', '$ionicPopup', '$timeout', 'profilePicService', 'satsangDayAttendanceService', '$state', '$document', '$ionicActionSheet'];
  angular
    .module('SCMS_ATTENDANCE')
    .controller("HomeCenterAttendanceListController", HomeCenterAttendanceListController);
})();


