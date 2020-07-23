(function () {

  'use strict';
  /**
   * Report Controller
   **/
  var HomeCenterReportController = function ($log, $scope, $cordovaSQLite, $rootScope, $filter, $ionicHistory, $ionicModal, ionicDatePicker, ionicTimePicker, nominalRollsService, $timeout) {

    var setup = function () {
      $log.debug("Report Controller");
      $scope.getReport();
      $scope.reportData = [];
      $scope.sewadar_name = '';
      $scope.jathas = [];     
      $scope.jatha_name = ''; 
      $scope.badge_no = ''; 
      $scope.time_in = '';
      $scope.time_out = '';
    };

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

    var startTime =  function (d) {
      var format = new Date(d);
        var h = format.getHours();
        var m = format.getMinutes();
        var s = format.getSeconds();

        if (!h && !m  && !s) return '--';
     
        return h + ":" + m + ":" + s;
    }

    // function diff_hours(d, date1, date2) {
    //   if (!date2  || date2 == '--') return 1;

    //   var dt1 = new Date(d + ' ' +date1);
    //   var dt2 = new Date(d + ' ' + date2);

    //   var diff = Math.abs(dt1 - dt2) / 36e5;

    //   var hour = 0;
    //   if (diff < 1.5) return 1;

    //   if (diff >= 1.5) hour = 2;
    //   if (diff > 2) hour = 4;
    //   if (diff > 4) hour = 8;

    //   return hour;
    // }

    var getReportData = function (query) {
      $scope.reportData = [];
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {

            if (res.rows.item(i).time_in != null && res.rows.item(i).time_in.length > 8) {
              res.rows.item(i).time_in = $filter('date')(new Date(res.rows.item(i).time_in), 'HH:mm:ss');
            }

            if (res.rows.item(i).time_in == null) res.rows.item(i).time_in = '--';
            if (res.rows.item(i).time_out == null) res.rows.item(i).time_in = '--';

            if (res.rows.item(i).time_out != null && res.rows.item(i).time_out.length > 8) {
              res.rows.item(i).time_out = $filter('date')(new Date(res.rows.item(i).time_out), 'HH:mm:ss');
            }

            res.rows.item(i).s_no = i+1;
            $scope.reportData.push(res.rows.item(i));
          }
        }
      },
      function (err) {}).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };


    $scope.handleInputChange = function (q, key) {
      console.log(q, key)
      switch (key) {
        case 'name':
          $scope.sewadar_name = q;
          break;

        case 'dept':
          $scope.jatha_name = q.jatha_name;
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

    $scope.applyFilter = function() {
      var date = new Date();
      var pdate = new Date(date.setDate(date.getDate() - 6));
      var currentDate = $scope.date_to ? $filter('date')(new Date($scope.date_to), 'yyyy-MM-dd') : $filter('date')(new Date(), 'yyyy-MM-dd');
      var prevdate = $scope.date_from ? $filter('date')(new Date($scope.date_from), 'yyyy-MM-dd')  : $filter('date')(new Date(pdate), 'yyyy-MM-dd');

      var handleQuery = function(t, key) {
        if (!t) return '';
        if (key == 'dname') return "AND dname = '" + $scope.jatha_name + "'";
        if (key == 'name') return "AND name LIKE '" + $scope.sewadar_name + '%' + "'";
        if (key == 'badge_no') return "AND batch_no LIKE '" + $scope.badge_no + '%' + "'";
        if (key == 'time_in') return "AND time_in>='" + $scope.time_in + "'";
        if (key == 'time_out') return "AND time_out<= '" + $scope.time_out + "'";
      } 

      var query = "Select *  from (SELECT sewadars.id, sewadars.name as name, sewadars.batch_no as batch_no, sewadars.photo, sewadars.department_name as dname, attendances.date as d, attendances.created_at as att_created_at,  attendances.sewadar_id as att_id, attendances.time_in as time_in, attendances.time_out as time_out, attendances.hours, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' " + handleQuery($scope.jatha_name, 'dname') + " " + handleQuery($scope.sewadar_name, 'name') + " " + handleQuery($scope.badge_no, 'badge_no') + " " + handleQuery($scope.time_in, 'time_in') + " " + handleQuery($scope.time_out, 'time_out') + " AND attendances.type='home_center' UNION SELECT temp_sewadars.id, temp_sewadars.name, NULL as batch_no, NULL as photo, NULL as department_name, attendances.date as d, attendances.created_at as att_created_at, attendances.sewadar_id as att_id, attendances.time_in as time_in, attendances.time_out as time_ouy, attendances.hours, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' "+ handleQuery($scope.sewadar_name, 'name') + " " + handleQuery($scope.time_in, 'time_in') + " " + handleQuery($scope.time_out, 'time_out') +" AND attendances.type='home_center') order by d Desc, dname Desc, name Asc";

      console.log(query);

      getReportData(query);
      $scope.modal.hide();
    }

    $scope.resetFilter = function() {
      $timeout(function () {
        $scope.date_from = '';
        $scope.date_to = '';
        $scope.sewadar_name= '';
        $scope.time_in = '';
        $scope.time_out = '';
        $scope.jatha_name = '';
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
     
      var query = "Select *  from (SELECT sewadars.id, sewadars.name as name, sewadars.batch_no, sewadars.photo, sewadars.department_name as dname, attendances.date as d, attendances.created_at as att_created_at,  attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.hours, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type='home_center' UNION SELECT temp_sewadars.id, temp_sewadars.name, NULL as batch_no, NULL as photo, NULL as department_name, attendances.date as d, attendances.created_at as att_created_at, attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.hours, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type='home_center') order by d Desc, dname Desc, name Asc";
      getReportData(query);
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

    var handleTimeFormat = function(t) {
      if (t.toLocaleString().length == 1) return '0'+t;

      return t;
    }

    var ipObj1 = {
      callback: function (val) {      //Mandatory
        if (typeof (val) === 'undefined') {
          console.log('Time not selected');
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
          console.log('Time not selected');
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

    setup();
  };



  HomeCenterReportController.$inject = ['$log', '$scope', '$cordovaSQLite', '$rootScope', '$filter', '$ionicHistory', '$ionicModal', 'ionicDatePicker', 'ionicTimePicker', 'nominalRollsService', '$timeout'];

  angular
    .module('SCMS_ATTENDANCE')
    .controller("HomeCenterReportController", HomeCenterReportController);
})();