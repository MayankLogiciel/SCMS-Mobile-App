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
                  $scope.limit = 20;
                  $scope.offset = 0;
                  $scope.currentDate =  $filter('date')(new Date(), 'yyyy-MM-dd');
                  $scope.curDate =  $filter('date')(new Date(), 'yyyy-MM-dd');
                  $scope.today =  $filter('date')(($scope.getDate),'EEE, d MMM, y');
                  $scope.getListFromSewadarsForAttendance('load'); 
                  $scope.isBatchNumber = true; 
                  $scope.stateName = $state.current.name;
                  $scope.type = 'satsang_day';
                  if(profilePicService.getTimeOfPic()=='') {
                        $scope.timeStampPhoto = '';
                  }else {
                       $scope.timeStampPhoto =  profilePicService.getTimeOfPic();
                  }
                            
                  $scope.imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/'; 
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
            $scope.openNameOrBadgePopover = function($event) {
                  $ionicPopover.fromTemplateUrl('templates/popovers/nameorbadgebutton.popover.html', {
                        scope: $scope,
                        //backdropClickToClose: false                  
                  }).then(function(popover) {
                        $scope.popover = popover; 
                        $scope.popover.show($event);
                  });
            };

            $scope.loadMore = function() {
                  $scope.offset = $scope.offset + 20;
                  $scope.getListFromSewadarsForAttendance();
            }

            $scope.closeNameBadgePopover = function() {
                  $scope.popover.hide();
            }

            $scope.$on('$destroy', function () {
                  $scope.popover.remove();
            });

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

            $scope.loadMore = function() {
                  $scope.offset = $scope.offset + 20;
                  $scope.getListFromSewadarsForAttendance();
            }
            var refreshListpage = function() {
                  $rootScope.$broadcast('refreshPage');
            }
            var getSewadarData = function(query) {                   
                                    
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        $scope.totalRows = res.rows.length;
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.sewadarAttendance = $scope.sewadarAttendance.concat(res.rows.item(i));
                              } 
                        }
                        findImage();                       
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

            $scope.getListFromSewadarsForAttendance = function(action){
                  if(angular.isDefined(action) || action == 'load'){
                        cfpLoadingBar.start();
                  } 
                  var query = "SELECT sewadars.* FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where date(attendances.date)= '" + $scope.getDate + "' AND attendances.nominal_roll_id= '" + null +"' AND type = 'satsang_day'  ORDER BY attendances.created_at Desc LIMIT "+$scope.limit+" offset "+$scope.offset;
                  getSewadarData(query);
            };              
            setup();
      };

      SatsangDayAttendanceController.$inject  = ['$log', '$cordovaFile', '$scope', '$rootScope', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', '$cordovaToast', 'cfpLoadingBar', 'satsangDayAttendanceListService', '$ionicPopup', '$timeout', 'profilePicService', 'satsangDayAttendanceService', '$state', '$document'];
      angular
      .module('SCMS_ATTENDANCE')
      .controller("SatsangDayAttendanceController", SatsangDayAttendanceController);
})();


