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
      $scope.limit = 500;
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
      $scope.day_type = $stateParams.type == 'day' ? 'Day' + ' ' + '(' + $scope.today + ')' : 'Night' + ' ' + '(' + $scope.today + ')';
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
      $scope.$on('$destroy', function () {
        $scope.popover.remove();
      });
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
      $scope.searchQuery1 = searchQuery;

      if (!searchQuery || !searchQuery.batch_no ||searchQuery.batch_no == ""){
        $scope.searchQuery1.batch_no = undefined
      } 
    }  
    
    $scope.updateOutTime = function (sewadar, type) {
      var time = $filter('date')(new Date(), 'yyyy-MM-dd H:mm:ss');
      var query = "UPDATE attendances SET time_out = '" + time + "' WHERE attendances.sewadar_id = '" + sewadar.att_id + "' AND attendances.created_at = '" + sewadar.att_created_at + "'";
      
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        $cordovaToast.show('Out time entry saved', 'short', 'center');
        setup();
      }, function (err) { })
    };   

    $scope.goToDateList = function () {
      $state.go('home-center-date-list', { type: $stateParams.type });
    }

    $scope.timeFilter = function(type) {
      $scope.sewadarAttendance = [];
      var query = '';
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      cfpLoadingBar.start();
      switch (type) {
        case 'in':
          var query = "Select *  from (SELECT DISTINCT sewadars.id, sewadars.name, sewadars.gender,sewadars.address, sewadars.batch_no, sewadars.guardian, sewadars.age, sewadars.photo, sewadars.designation_name, sewadars.department_name as dname, sewadars.dob, sewadars.sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "'  AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'permanent' AND attendances.type='home_center' AND attendances.status <> 'done' AND attendances.time_in<>'" + null + "'  AND attendances.sewa_id = '" + sewa_id + "' UNION SELECT DISTINCT temp_sewadars.id, temp_sewadars.name, temp_sewadars.gender,temp_sewadars.address, NULL as batch_no, temp_sewadars.guardian, temp_sewadars.age, NULL as photo, NULL as designation_name, NULL as department_name, NULL as dob, NULL as sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, NULL as nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'temporary' AND attendances.type='home_center' AND attendances.status <> 'done' AND attendances.time_in<>'" + null + "'  AND attendances.sewa_id = '" + sewa_id + "') att GROUP BY  att_id order by dname Desc LIMIT " + $scope.limit + " offset " + $scope.offset;

            getSewadarData(query);
            break;
          case 'out':
          var query = "Select *  from (SELECT DISTINCT sewadars.id, sewadars.name, sewadars.gender,sewadars.address, sewadars.batch_no, sewadars.guardian, sewadars.age, sewadars.photo, sewadars.designation_name, sewadars.department_name as dname, sewadars.dob, sewadars.sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "'  AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'permanent' AND attendances.type='home_center' AND attendances.status <> 'done' AND attendances.time_out<>'" + null + "'  AND attendances.sewa_id = '" + sewa_id + "' UNION SELECT DISTINCT temp_sewadars.id, temp_sewadars.name, temp_sewadars.gender,temp_sewadars.address, NULL as batch_no, temp_sewadars.guardian, temp_sewadars.age, NULL as photo, NULL as designation_name, NULL as department_name, NULL as dob, NULL as sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, NULL as nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'temporary' AND attendances.type='home_center' AND attendances.status <> 'done' AND attendances.time_out<>'" + null + "'  AND attendances.sewa_id = '" + sewa_id + "') att GROUP BY  att_id order by dname Desc LIMIT " + $scope.limit + " offset " + $scope.offset;
            getSewadarData(query);
            break;
        case 'current':
          var query = "Select *  from (SELECT DISTINCT sewadars.id, sewadars.name, sewadars.gender,sewadars.address, sewadars.batch_no, sewadars.guardian, sewadars.age, sewadars.photo, sewadars.designation_name, sewadars.department_name as dname, sewadars.dob, sewadars.sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "'  AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'permanent' AND attendances.type='home_center' AND attendances.status <> 'done' AND attendances.time_out='" + null + "'  AND attendances.sewa_id = '" + sewa_id + "' UNION SELECT DISTINCT temp_sewadars.id, temp_sewadars.name, temp_sewadars.gender,temp_sewadars.address, NULL as batch_no, temp_sewadars.guardian, temp_sewadars.age, NULL as photo, NULL as designation_name, NULL as department_name, NULL as dob, NULL as sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, NULL as nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'temporary' AND attendances.type='home_center' AND attendances.status <> 'done' AND attendances.time_out='" + null + "'  AND attendances.sewa_id = '" + sewa_id + "') att GROUP BY  att_id order by dname Desc LIMIT " + $scope.limit + " offset " + $scope.offset;
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

    $scope.openPopoverForTempSewadar = function ($event, sewadar) {
      $ionicPopover.fromTemplateUrl('templates/popovers/temp.sewadar.popover.html', {
        scope: $scope,
        backdropClickToClose: false
      }).then(function (popover) {
        $scope.popover = popover;
        $scope.popover.show($event);
        $scope.openSewadarPopoverTitle = "Add Open Sewadar";
        $scope.TempSewadarData = {
          Female: false,
          Male: false
        };
        $scope.ButtonValue = 'MARK ENTRY';
      });
    };

    $scope.closePopoverForTempSewadar = function () {
      $timeout(function () {
        $scope.popover.hide();
        angular.element(document.body).removeClass('popover-open');
        angular.element(document.body).removeClass('modal-open');
        $scope.TempSewadarData = {};
      }, 0);

    };

    $scope.$on('popover.hidden', function () {
      $scope.popover.remove();
    });

    $scope.CheckedGender = function (gender) {
      switch (gender) {
        case 'Male':
          $scope.TempSewadarData.Female = false;
          $scope.TempSewadarData.Male = true;
          return;
        case 'Female':
          $scope.TempSewadarData.Female = true;
          $scope.TempSewadarData.Male = false;
          return;
      }
    }

    $scope.addTempSewadar = function (TempSewadarData) {
      TempSewadarData.name = angular.uppercase(TempSewadarData.name);
      TempSewadarData.guardian = angular.uppercase(TempSewadarData.guardian);
      TempSewadarData.address = angular.uppercase(TempSewadarData.address);

      
      $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
      
      if (TempSewadarData.age < 5) {
        $scope.showAge = true;
        return;
      }
      
      $scope.showAge = false;
      if (!TempSewadarData.gender && !angular.isDefined(TempSewadarData.Male) && !angular.isDefined(TempSewadarData.Female)) {
        $scope.showError = true;
        return;
      }

      TempSewadarData.gender = TempSewadarData.gender ? TempSewadarData.gender : (TempSewadarData.Female ? 'F' : 'M');
      var CheckQuery = "SELECT * FROM temp_sewadars where name ='" + TempSewadarData.name + "' AND guardian ='" + TempSewadarData.guardian + "' AND gender ='" + TempSewadarData.gender + "' AND address ='" + TempSewadarData.address + "' AND age ='" + TempSewadarData.age + "'";

      $cordovaSQLite.execute($rootScope.db, CheckQuery).then(function (res) {
        if (res.rows.length == 0) {
          var Insertquery = "INSERT INTO temp_sewadars('name', 'guardian', 'gender', 'address', 'age', 'created_at', 'updated_at') VALUES ('" + TempSewadarData.name + "','" + TempSewadarData.guardian + "','" + TempSewadarData.gender + "', '" + TempSewadarData.address + "', '" + TempSewadarData.age + "','" + $scope.current + "','" + $scope.current + "')";
          $cordovaSQLite.execute($rootScope.db, Insertquery).then(function (resTemp) {
            TempSewadarData.id = resTemp.insertId;
            addTempSewadarNested(TempSewadarData);
          }, function (err) {});
          return;
        }
        addTempSewadarNested(res.rows.item(0));
      })
      $scope.closePopoverForTempSewadar();
      setFocus();
    };

    var addTempSewadarNested = function (TempSewadarData) {
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
      var nominal_roll_id = null;
      var reference_id = null
      var type = 'home_center';
      var batch_type = 'temporary';
      var sewadar_type = 'temporary';
      var time = $filter('date')(new Date(), 'yyyy-MM-dd H:mm:ss');
     
      var insertAttedanceForTempSewadar;

      if (angular.isDefined(TempSewadarData.id) && $scope.in) {
        var CheckQuery = "SELECT sewa_id, sewadar_id, created_at FROM attendances where sewadar_id ='" + TempSewadarData.id + "' AND nominal_roll_id = '" + null + "' AND type = 'home_center' AND status <> 'done' AND sewa_id = '" + sewa_id + "'";
        $cordovaSQLite.execute($rootScope.db, CheckQuery).then(function (res) {
          if (res.rows.length == 0) {
             insertAttedanceForTempSewadar = "INSERT INTO attendances ('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id', 'time_in', 'time_out') VALUES ('" + $scope.currentDate + "','" + TempSewadarData.id + "','" + sewa_id + "', '" + reference_id + "', '" + type + "', '" + batch_type + "','" + $scope.current + "', '" + $scope.current + "', '" + sewadar_type + "','" + nominal_roll_id + "', '" + time + "', '" + null + "')";
              $cordovaSQLite.execute($rootScope.db, insertAttedanceForTempSewadar).then(function (res) {
                $scope.sewadarAttendance.unshift(TempSewadarData);
                $scope.TempSewadarData = {};
                $scope.currentAttendees();
                $scope.totalAttendees();
                $cordovaToast.show('Entry marked successfully', 'short', 'center');
                setup();
              }, function (err) {

              });   

          } else {
            var query = "UPDATE attendances SET status = 'done' WHERE attendances.created_at <> '" + $scope.current + "' AND attendances.sewadar_id = '" + TempSewadarData.id + "'";
            $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
              insertAttedanceForTempSewadar = "INSERT INTO attendances ('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id', 'time_in', 'time_out') VALUES ('" + $scope.currentDate + "','" + TempSewadarData.id + "','" + sewa_id + "', '" + reference_id + "', '" + type + "', '" + batch_type + "','" + $scope.current + "', '" + $scope.current + "', '" + sewadar_type + "','" + nominal_roll_id + "', '" + time + "', '" + null + "')";
              $cordovaSQLite.execute($rootScope.db, insertAttedanceForTempSewadar).then(function (res) {
                $scope.sewadarAttendance.unshift(TempSewadarData);
                $scope.TempSewadarData = {};
                $scope.currentAttendees();
                $scope.totalAttendees();
                $cordovaToast.show('Entry marked successfully', 'short', 'center');
                setup();
              }, function (err) {

              });   
            })
          }
        });
      }
    };

    $scope.totalAttendees = function () {
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      var query = "SELECT COUNT(DISTINCT sewadar_id) as count FROM attendances WHERE date(attendances.date) = '" + $scope.currentDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.type= 'home_center' AND attendances.status <> 'done' AND attendances.sewa_id = '" + sewa_id + "'";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        for (var i = 0; i < res.rows.length; i++) {
          $scope.count = res.rows.item(i).count;
        }
      });
    }

    $scope.currentAttendees = function () {
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      var query = "SELECT COUNT(DISTINCT sewadar_id) as count FROM attendances WHERE date(attendances.date) = '" + $scope.currentDate + "' AND attendances.nominal_roll_id= '" + null + "' AND attendances.time_in<> '" + null + "' AND attendances.time_out= '" + null + "' AND attendances.type= 'home_center' AND attendances.status <> 'done' AND attendances.sewa_id = '" + sewa_id + "'";
      $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
        for (var i = 0; i < res.rows.length; i++) {
          $scope.curent_count = res.rows.item(i).count;
        }
      });
    }

    $scope.SaveDataToAttandanceTable = function (sewadar, fromQR) {
      if(!sewadar.batch_no) {
        if(sewadar.id) {
          addTempSewadarNested(sewadar);
        }                       
        $scope.closePopoverForTempSewadar();
        setFocus();  
      }else {
        if (sewadar.batch_status == 'hold') {
          $cordovaToast.show('Not allowed due to hold status. Please contact to your respective incharge.', 'long', 'center');
          return;
        }
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
          var CheckQuery = "SELECT sewa_id, sewadar_id, created_at FROM attendances where sewadar_id ='" + sewadar.id + "' AND nominal_roll_id = '" + null + "' AND type = 'home_center' AND status <> 'done' AND sewa_id = '" + sewa_id + "'";
          $cordovaSQLite.execute($rootScope.db, CheckQuery).then(function (res) {
            if (res.rows.length > 0) {
              var query = "UPDATE attendances SET status = 'done' WHERE attendances.created_at <> '" + $scope.current +"' AND attendances.sewadar_id = '" + res.rows.item(0).sewadar_id + "'";

              $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
                var Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id', 'time_in', 'time_out') VALUES ('" + $scope.currentDate + "','" + sewadar.id + "','" + sewa_id + "', '" + reference_id + "', '" + type + "', '" + batch_type + "','" + $scope.current + "','" + $scope.current + "', '" + sewadar_type + "','" + nominal_roll_id + "', '" + time + "', '" + null + "')";
        
                $cordovaSQLite.execute($rootScope.db, Insertquery).then(function (res) {
                  $cordovaToast.show('Entry marked successfully', 'short', 'center');
                  $scope.currentAttendees();
                  $scope.totalAttendees();
                  $scope.getListFromSewadarsForAttendance();
                }, function (err) {});
              })
            }else {
              var Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id', 'time_in', 'time_out') VALUES ('" + $scope.currentDate + "','" + sewadar.id + "','" + sewa_id + "', '" + reference_id + "', '" + type + "', '" + batch_type + "','" + $scope.current + "','" + $scope.current + "', '" + sewadar_type + "','" + nominal_roll_id + "', '" + time + "', '" + null + "')";
  
              $cordovaSQLite.execute($rootScope.db, Insertquery).then(function (res) {
                $cordovaToast.show('Entry marked successfully', 'short', 'center');
                $scope.currentAttendees();
                $scope.totalAttendees();
                $scope.getListFromSewadarsForAttendance();
              }, function (err) { });
            }
          });
  
        }

      }
    };

    $scope.getListFromSewadarsForAttendance = function (action) {
      var sewa_id = $stateParams.type == 'day' ? 24 : 5;
      if (angular.isDefined(action) || action == 'load') {
        cfpLoadingBar.start();
      }
      var query = "Select *  from (SELECT DISTINCT sewadars.id, sewadars.name, sewadars.gender,sewadars.address, sewadars.batch_no, sewadars.guardian, sewadars.age, sewadars.photo, sewadars.designation_name, sewadars.department_name as dname, sewadars.dob, sewadars.sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "'  AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'permanent' AND attendances.type='home_center' AND attendances.status <> 'done'  AND attendances.sewa_id = '" + sewa_id + "' UNION SELECT DISTINCT temp_sewadars.id, temp_sewadars.name, temp_sewadars.gender,temp_sewadars.address, NULL as batch_no, temp_sewadars.guardian, temp_sewadars.age, NULL as photo, NULL as designation_name, NULL as department_name, NULL as dob, NULL as sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, NULL as nominal_roll_id, attendances.sewadar_type, attendances.time_in, attendances.time_out, attendances.sewa_id, attendances.id as s_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id = '" + null + "' AND attendances.sewadar_type = 'temporary' AND attendances.type='home_center' AND attendances.status <> 'done'  AND attendances.sewa_id = '" + sewa_id + "') att GROUP BY  att_id order by dname Desc LIMIT " + $scope.limit + " offset " + $scope.offset;

      getSewadarData(query);
    };
    setup();
  };

  HomeCenterAttendanceListController.$inject = ['$log', '$cordovaFile', '$scope', '$rootScope', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', '$cordovaToast', 'cfpLoadingBar', 'satsangDayAttendanceListService', '$ionicPopup', '$timeout', 'profilePicService', 'satsangDayAttendanceService', '$state', '$document', '$ionicActionSheet', '$stateParams'];
  angular
    .module('SCMS_ATTENDANCE')
    .controller("HomeCenterAttendanceListController", HomeCenterAttendanceListController);
})();


