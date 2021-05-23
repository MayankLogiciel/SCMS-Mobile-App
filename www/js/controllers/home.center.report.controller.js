(function () {

  'use strict';
  /**
   * Report Controller
   **/
  var HomeCenterReportController = function ($log, $scope, $cordovaSQLite, $rootScope, $filter, $ionicHistory, $ionicModal, ionicDatePicker, ionicTimePicker, cfpLoadingBar, $timeout) {

    var setup = function () {
      $log.debug("Report Controller");
      $scope.getTotalHrs();
      $scope.reportData = [];
      $scope.multipleRecords = [];
      $scope.totalHours = [];
      $scope.sewadar_name = '';
      $scope.jathas = [];
      $scope.dept = {};
      $scope.badge_no = '';
      $scope.time_in = '';
      $scope.time_out = '';
    };

    $scope.calculateHours = function () {
      var e = 0;
      var h = 0;
      angular.forEach($scope.reportData, function (v, i) {
        e = 0;
        h = 0;
        angular.forEach($scope.totalHours, function (val) {
          console.log(val.id, v.id, val.d, v.d)
          console.log(val, v)
          if (val.id == v.id && val.d == v.d) {
            e += 1;
            h += Number(v.hours) <= 0 ? 1 : Number(v.hours);
            $scope.reportData[i].th = h;
            $scope.reportData[i].entry = e;
          }
        })
      })
    }

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };

    $scope.showFilterModal = function () {
      $ionicModal.fromTemplateUrl('templates/modals/home.center.report.filter.html', {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.getListForJatha = function () {
      var query = "SELECT name as jatha_name, id as department_id FROM departments ORDER BY jatha_name ASC";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            $scope.jathas.push(res.rows.item(i));
          }
        }
      }, function (err) {
      });
    };

    function diff_hours(d, date1, date2) {
      if (!date2 || date2 == '--') return 1;

      var dt1 = new Date(d + ' ' + date1);
      var dt2 = new Date(d + ' ' + date2);

      var diff = Math.abs(dt1 - dt2) / 36e5;

      var hour = 0;
      if (diff < 1.5) return 1;

      if (diff >= 1.5) hour = 2;
      if (diff > 2) hour = 4;
      if (diff > 4) hour = 8;

      return hour;
    }

    var getReportData = function (query) {
      cfpLoadingBar.start();
      $scope.reportData = [];
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        cfpLoadingBar.complete()
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            var sewadar =  res.rows.item(i);
            if (sewadar.batch_no != 0) {
              if (sewadar.time_in != null && sewadar.time_in.length > 8) {
                sewadar.time_in = $filter('date')(new Date(sewadar.time_in), 'HH:mm:ss');
              }

              if (sewadar.time_in == null) sewadar.time_in = '--';

              if (
                sewadar.time_out == null ||
                sewadar.time_out == 'null' ||
                sewadar.time_out == '--'
              ) {
                sewadar.time_out = '--';
                sewadar.hours = '1';
              }

              if (sewadar.time_out != null && sewadar.time_out.length > 8) {
                sewadar.time_out = $filter('date')(new Date(sewadar.time_out), 'HH:mm:ss');
              }

              if (sewadar.time_out != null && sewadar.hours == null) {
                sewadar.hours = diff_hours(
                  sewadar.d,
                  sewadar.time_in,
                  sewadar.time_out
                );
              }
              sewadar.s_no = i + 1;

                $scope.reportData.push(sewadar);

                if (res.rows.length - 1 == i) {
                  $scope.calculateHours();
                }
              }
          }
        }
      },
        function (err) { }).finally(function () {
          cfpLoadingBar.complete()
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };


    $scope.handleInputChange = function (q, key) {
      switch (key) {
        case 'name':
          $scope.sewadar_name = q;
          break;

        case 'dept':
          $scope.dept = q;
          break;

        case 'badge':
          $scope.badge_no = q;
          break;

        case 'time_in':
          $scope.time_in = $filter('date')(new Date(q), 'HH:mm:ss');
          break;

        case 'time_out':
          $scope.time_out = $filter('date')(new Date(q), 'HH:mm:ss');
          break;

        default:
          break;
      }
    }

    $scope.applyFilter = function () {
      cfpLoadingBar.start();
      var date = new Date();
      var pdate = new Date(date.setDate(date.getDate() - 6));
      var currentDate = $scope.date_to ? $filter('date')(new Date($scope.date_to), 'yyyy-MM-dd') : $filter('date')(new Date(), 'yyyy-MM-dd');
      var prevdate = $scope.date_from ? $filter('date')(new Date($scope.date_from), 'yyyy-MM-dd') : $filter('date')(new Date(pdate), 'yyyy-MM-dd');

      var handleQuery = function (t, key) {
        if (!t) return '';
        if (key == 'dname' && $scope.dept.jatha_name) return "AND dname = '" + $scope.dept.jatha_name + "'";
        if (key == 'name' && $scope.sewadar_name) return "AND name LIKE '" + $scope.sewadar_name + '%' + "'";
        if (key == 'badge_no' && $scope.badge_no) return "AND batch_no LIKE '" + $scope.badge_no + '%' + "'";
        if (key == 'time_in' && $scope.time_in) return "AND time_in>='" + $scope.time_in + "'";
        if (key == 'time_out' && $scope.time_out) return "AND time_out<= '" + $scope.time_out + "'";

        return '';
      }

      var query = '';

      if ($scope.badge_no || $scope.dept.jatha_name) {
        query = "Select *  from (SELECT sewadars.id, sewadars.name as name, sewadars.batch_no as batch_no, sewadars.photo, sewadars.department_name as dname, attendances.date as d, attendances.created_at as att_created_at,  attendances.sewadar_id as att_id, attendances.time_in as time_in, attendances.time_out as time_out, attendances.hours, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' " + handleQuery($scope.dept, 'dname') + " " + handleQuery($scope.sewadar_name, 'name') + " " + handleQuery($scope.badge_no, 'badge_no') + " " + handleQuery($scope.time_in, 'time_in') + " " + handleQuery($scope.time_out, 'time_out') + " AND attendances.type='home_center' AND (attendances.sewadar_type='permanent' OR attendances.sewadar_type='temporary')) Group By d, name order by d Desc, dname Desc, name Asc";
      } else {
        query = "Select *  from (SELECT sewadars.id, sewadars.name as name, sewadars.batch_no as batch_no, sewadars.photo, sewadars.department_name as dname, attendances.date as d, attendances.created_at as att_created_at,  attendances.sewadar_id as att_id, attendances.time_in as time_in, attendances.time_out as time_out, attendances.hours, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' " + handleQuery($scope.dept, 'dname') + " " + handleQuery($scope.sewadar_name, 'name') + " " + handleQuery($scope.badge_no, 'badge_no') + " " + handleQuery($scope.time_in, 'time_in') + " " + handleQuery($scope.time_out, 'time_out') + " AND attendances.type='home_center' AND (attendances.sewadar_type='permanent' OR attendances.sewadar_type='temporary') UNION SELECT temp_sewadars.id, temp_sewadars.name, NULL as batch_no, NULL as photo, NULL as department_name, attendances.date as d, attendances.created_at as att_created_at, attendances.sewadar_id as att_id, attendances.time_in as time_in, attendances.time_out as time_ouy, attendances.hours, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' " + handleQuery($scope.sewadar_name, 'name') + " " + handleQuery($scope.time_in, 'time_in') + " " + handleQuery($scope.time_out, 'time_out') + " AND attendances.type='home_center' AND attendances.sewadar_type='temporary') Group By d, name order by d Desc, dname Desc, name Asc";
      }

      getReportData(query);
      $scope.modal.hide();
    }

    $scope.resetFilter = function () {
      $timeout(function () {
        $scope.date_from = '';
        $scope.date_to = '';
        $scope.sewadar_name = '';
        $scope.time_in = '';
        $scope.time_out = '';
        $scope.dept = {};
        $scope.badge_no = '';
        $scope.modal.hide();
        $scope.getReport();
        angular.element(document.body).removeClass('modal-open');
      }, 0);
    }

    $scope.getReport = function () {

      var date = new Date();
      var pdate = new Date(date.setDate(date.getDate() - 6));
      var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');
      var prevdate = $filter('date')(new Date(pdate), 'yyyy-MM-dd');

      var query = "Select *  from (SELECT sewadars.id, sewadars.name as name, sewadars.batch_no, sewadars.photo, sewadars.department_name as dname, attendances.date as d, attendances.created_at as att_created_at,  attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.hours, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type='home_center' AND ((attendances.sewadar_type='permanent' OR attendances.sewadar_type='temporary') OR attendances.sewadar_type='temporary') UNION SELECT temp_sewadars.id, temp_sewadars.name, NULL as batch_no, NULL as photo, NULL as department_name, attendances.date as d, attendances.created_at as att_created_at, attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.hours, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type='home_center' AND attendances.sewadar_type='temporary') Group By d, name order by d Desc, dname Desc, name Asc";


      getReportData(query);
    };

    $scope.getTotalHrs = function () {
      // cfpLoadingBar.start();
      var date = new Date();
      var pdate = new Date(date.setDate(date.getDate() - 6));
      var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');
      var prevdate = $filter('date')(new Date(pdate), 'yyyy-MM-dd');
      var query = "SELECT sewadars.id, sewadars.batch_no, attendances.date as d, attendances.hours FROM sewadars INNER JOIN attendances ON sewadars.id =  attendances.sewadar_id where date(attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type = 'home_center'";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        for (var i = 0; i < res.rows.length; i++) {

          if(res.rows.item(i).batch_no != 0) {
            $scope.totalHours.push(res.rows.item(i));
          }

          if (res.rows.length - 1 == i) {
            var q = "SELECT temp_sewadars.id, NULL as batch_no, attendances.date as d, attendances.hours FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id =  attendances.sewadar_id where date(attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type = 'home_center' AND attendances.sewadar_type='temporary'";

            $cordovaSQLite.execute($rootScope.db, q).then(function (res1) {
              if (res1.rows.length <= 0) {
                $scope.getReport();
                return;
              }

              for (var j = 0; j < res1.rows.length; j++) {
                if(res.rows.item(j).batch_no != 0) {
                  $scope.totalHours.push(res1.rows.item(j));
                  if (res1.rows.length - 1 == j) {
                    $scope.getReport();
                  }
                }
              }
            })
          }

        }

      });
    };

    $scope.getMultipleRecords = function (group) {
      cfpLoadingBar.start();
      $scope.multipleRecords = [];
      var query = '';
      if (group.batch_no) {
        query = "SELECT sewadars.id, sewadars.name as name, sewadars.batch_no, sewadars.photo, sewadars.department_name as dname, attendances.date as d, attendances.created_at as att_created_at,  attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.hours, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date (attendances.date) == '" + group.d + "' AND att_id == '" + group.att_id + "' AND attendances.type='home_center' order by d Desc";
      } else {
        query = "SELECT temp_sewadars.id, temp_sewadars.name, NULL as batch_no, NULL as photo, NULL as department_name, attendances.date as d, attendances.created_at as att_created_at, attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.hours, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date (attendances.date) == '" + group.d + "' AND att_id == '" + group.att_id + "' AND attendances.type='home_center' AND attendances.sewadar_type='temporary' order by d Desc";

      }
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        cfpLoadingBar.complete();
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {

            if (res.rows.item(i).time_in != null && res.rows.item(i).time_in.length > 8) {
              res.rows.item(i).time_in = $filter('date')(new Date(res.rows.item(i).time_in), 'HH:mm:ss');
            }

            if (res.rows.item(i).time_in == null) res.rows.item(i).time_in = '--';
            if (
              res.rows.item(i).time_out == null ||
              res.rows.item(i).time_out == 'null' ||
              res.rows.item(i).time_out == '--'
            ) {
              res.rows.item(i).time_out = '--';
              res.rows.item(i).hours = '1';
            }

            if (res.rows.item(i).time_out != null && res.rows.item(i).time_out.length > 8) {
              res.rows.item(i).time_out = $filter('date')(new Date(res.rows.item(i).time_out), 'HH:mm:ss');
            }

            if (res.rows.item(i).time_out != null && res.rows.item(i).hours == null) {
              res.rows.item(i).hours = diff_hours(
                res.rows.item(i).d,
                res.rows.item(i).time_in,
                res.rows.item(i).time_out
              );
            }

            res.rows.item(i).s_no = i + 1;
            $scope.multipleRecords.push(res.rows.item(i));
            if (res.rows.length - 1 == i) {
              $scope.shownGroup = group;
            }
          }
        }
      });
    };

    var datePickedFrom = {
      callback: function (val) {  //Mandatory
        $scope.selectedDate = (val, new Date(val));
        $scope.date_from = $filter('date')(($scope.selectedDate), 'yyyy-MM-dd');
      },
      disabledDates: [],
      from: new Date(new Date().setDate(new Date().getDate() - 6)), //Optional
      to: new Date(), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      disableWeekdays: [],       //Optional
      closeOnSelect: true,       //Optional
      templateType: 'popup'       //Optional
    };
    var datePickedTo = {
      callback: function (val) {  //Mandatory
        $scope.selectedDate = (val, new Date(val));
        $scope.date_to = $filter('date')(($scope.selectedDate), 'yyyy-MM-dd');
      },
      disabledDates: [],
      from: new Date(new Date().setDate(new Date().getDate() - 6)), //Optional
      to: new Date(), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      disableWeekdays: [],       //Optional
      closeOnSelect: true,       //Optional
      templateType: 'popup'       //Optional
    };
    $scope.openDatePicker = function (str) {
      switch (str) {
        case 'from':
          ionicDatePicker.openDatePicker(datePickedFrom);
          return;
        case 'to':
          ionicDatePicker.openDatePicker(datePickedTo);
          return;
      }
    };

    var handleTimeFormat = function (t) {
      if (t.toLocaleString().length == 1) return '0' + t;

      return t;
    }

    var ipObj1 = {
      callback: function (val) {      //Mandatory
        if (typeof (val) === 'undefined') {
        } else {
          $scope.selectedValue = val;
          var selectedTime = new Date(Number(val) * 1000);

          $scope.time_in = handleTimeFormat(selectedTime.getUTCHours()) + ':' + handleTimeFormat(selectedTime.getUTCMinutes()) + ':' + '00';
        }
      },
      inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),   //Optional
      format: 24,         //Optional
      step: 1,           //Optional
      setLabel: 'Set'    //Optional
    };

    var ipObj2 = {
      callback: function (val) {      //Mandatory
        if (typeof (val) === 'undefined') {
        } else {
          var selectedTime = new Date(Number(val) * 1000);
          $scope.time_out = handleTimeFormat(selectedTime.getUTCHours()) + ':' + handleTimeFormat(selectedTime.getUTCMinutes()) + ':' + '00';
        }
      },
      inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),   //Optional
      format: 24,         //Optional
      step: 1,           //Optional
      setLabel: 'Set'    //Optional
    };

    $scope.openTimePicker = function (str) {
      switch (str) {
        case 'in':
          ionicTimePicker.openTimePicker(ipObj1);
          return;
        case 'out':
          ionicTimePicker.openTimePicker(ipObj2);
          return;
      }
    };

    /*
      * if given group is the selected group, deselect it
      * else, select the given group
      */
    $scope.toggleGroup = function (group) {
      if ($scope.isGroupShown(group)) {
        $scope.multipleRecords = [];
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = null;
        if (group.entry == 1) return;
        $scope.getMultipleRecords(group);
      }
    };

    $scope.isGroupShown = function (group) {
      return $scope.shownGroup === group;
    };

    setup();
  };



  HomeCenterReportController.$inject = ['$log', '$scope', '$cordovaSQLite', '$rootScope', '$filter', '$ionicHistory', '$ionicModal', 'ionicDatePicker', 'ionicTimePicker', 'cfpLoadingBar', '$timeout'];

  angular
    .module('SCMS_ATTENDANCE')
    .controller("HomeCenterReportController", HomeCenterReportController);
})();