(function () {

  'use strict';
  /**
   * Report Controller
   **/
  var HomeCenterReportController = function ($log, $scope, $cordovaSQLite, $rootScope, $filter, $ionicHistory) {

    var setup = function () {
      $log.debug("Report Controller");
      $scope.getReport();
      $scope.reportData = [];
    };

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };



    var startTime =  function (d) {
      var format = new Date(d);
        var h = format.getHours();
        var m = format.getMinutes();
        var s = format.getSeconds();

        if (!h && !m  && !s) return '--';
     
        return h + ":" + m + ":" + s;
    }

    function diff_hours(d, date1, date2) {
      if (!date2  || date2 == '--') return 1;

      var dt1 = new Date(d + ' ' +date1);
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
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            res.rows.item(i).time_in = startTime(res.rows.item(i).time_in);
            res.rows.item(i).time_out = startTime(res.rows.item(i).time_out);
            res.rows.item(i).s_no = i+1;

            if (res.rows.item(i).time_out != 'null') {
              res.rows.item(i).th = diff_hours(
                res.rows.item(i).date,
                res.rows.item(i).time_in,
                res.rows.item(i).time_out
              );
            }

            $scope.reportData.push(res.rows.item(i));
          }
        }
        console.log($scope.reportData);
      },
      function (err) {}).finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.getReport = function () {
      var date = new Date();
      var pdate = new Date(date.setDate(date.getDate() - 6));
      var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');
      var prevdate = $filter('date')(new Date(pdate), 'yyyy-MM-dd');

      var query = "Select *  from (SELECT sewadars.id, sewadars.name, sewadars.batch_no, sewadars.photo, sewadars.department_name as dname, attendances.date as d, attendances.created_at as att_created_at,  attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type='home_center' UNION SELECT temp_sewadars.id, temp_sewadars.name, NULL as batch_no, NULL as photo, NULL as department_name, attendances.date as d, attendances.created_at as att_created_at, attendances.sewadar_id as att_id, attendances.time_in, attendances.time_out, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date (attendances.date) >= '" + prevdate + "' AND date(attendances.date) <= '" + currentDate + "' AND attendances.type='home_center') order by d Desc, dname Desc";
      getReportData(query);
    };
    setup();
  };



  HomeCenterReportController.$inject = ['$log', '$scope', '$cordovaSQLite', '$rootScope', '$filter', '$ionicHistory'];

  angular
    .module('SCMS_ATTENDANCE')
    .controller("HomeCenterReportController", HomeCenterReportController);
})();