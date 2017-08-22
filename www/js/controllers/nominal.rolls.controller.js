(function() {
       'use strict';
      /**
      * Satsang_Day_Attendance Controller
      **/
      var NominalRollsController = function($log, $timeout, $scope, $state, $ionicHistory, $cordovaSQLite, $ionicPopover, $ionicModal, $filter, ionicDatePicker, $rootScope, nominalRollsService, $cordovaToast, $ionicActionSheet, cfpLoadingBar) {
            var setup = function() {
                  $log.debug("Nominal Rolls Controller");
                  $scope.nominals = [];
                  $scope.nominalCompleteData = [];
                  $scope.nominal = {};
                  $scope.nominaldate = {};
                  $scope.currentDate =  $filter('date')(new Date(), 'yyyy-MM-dd');
                  $scope.showDateRange = false;
                  $scope.Desc = false;
                  $rootScope.isDateFilterPopupOpened = true;
                  $scope.isDatePopupOpend = false; 
            };
            $scope.$on('$ionicView.enter', function() {
                  $scope.getListForNominalRolls();
                  cfpLoadingBar.start(); 
            });  
            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };
            //refreshing page 
            $rootScope.$on('refreshPage',function(event, data){
                  setup();
            });
           
            var getNominalRollsData = function(query) {                  
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        $scope.nominals = []; 
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.nominals.push(res.rows.item(i));                                                                     
                              }  
                              nominalRollsService.setnominalRollsCompleteData($scope.nominals);                               
                        }
                        cfpLoadingBar.complete();
                  }, function (err) { 
                  });
            };

            $scope.getListForNominalRolls = function(){
                  var query =  "select nr.*, (CASE WHEN v.id NOTNULL THEN v.name ELSE 'null' END) AS vehicle_type, s.name as sewa_name, d.name as jatha_name from nominal_roles AS nr left join vehicles as v ON v.id = nr.vehicle_id left join sewas as s ON s.id = nr.sewa_id left join departments as d ON d.id = nr.department_id";
                  getNominalRollsData(query); 
            };
            $scope.viewAndMarkAttendanceNominal = function(nominal) {
                  switch(nominal.status){
                        case 'Approved':
                              nominalRollsService.setNominalRollsData(nominal);
                              $state.go('nominal_rolls-list', {id: nominal.id, status: nominal.status});
                              return true;
                        case 'dispatched':
                              $cordovaToast.show('Nominal Roll Already Dispatched ', 'short', 'center');                        
                              return true;
                        default:
                              $cordovaToast.show('You cannot add sewadar until approved ', 'short', 'center');                        
                  }
            };

            $scope.ascendingDescending = function (str) {
                  switch (str){
                        case 'asc':
                        $scope.Desc = true;
                        return;
                        case 'desc':
                        $scope.Desc = false;
                        return;
                  }
            }

            $scope.filterByDate = function(data) {                  
                  if($scope.isDatePopupOpend) {
                        return;
                  }
                  if(data.from_date > data.to_date) {
                       $cordovaToast.show('End date should be greater or equal to start date ', 'short', 'center');
                       return;
                  }  
                  $scope.nominalCompleteData = nominalRollsService.getnominalRollsCompleteData(); 
                  if(angular.isDefined(data.from_date) && angular.isDefined(data.to_date)) { 
                        $scope.nominals = [];
                        angular.forEach($scope.nominalCompleteData, function(val){
                              if((val.date_from >= data.from_date) && (val.date_from <= data.to_date)){
                                    $scope.nominals.push(val);
                              }                             
                        });
                        $scope.closePopoverForDateFilter();
                        $scope.showDateRange = true;   
                  };
                  if(!angular.isDefined(data.from_date) && !angular.isDefined(data.to_date)) { 
                        $cordovaToast.show('Please select date to filter data ', 'short', 'center');
                        return;
                  };

                  if(!angular.isDefined(data.from_date) && angular.isDefined(data.to_date)) { 
                        $cordovaToast.show('Please select the start date ', 'short', 'center');
                        return;
                  };
                  if(angular.isDefined(data.from_date) && !angular.isDefined(data.to_date)) { 
                        $cordovaToast.show('Please select the end date ', 'short', 'center');
                        return;
                  };
                
            };

            var datePickedFrom = {
                  callback: function (val) {  //Mandatory
                       $scope.selectedDate = (val, new Date(val));
                       $scope.nominaldate.from_date =  $filter('date')($scope.selectedDate, 'yyyy-MM-dd');
                       $scope.isDatePopupOpend = false;                      

                  },
                  disabledDates: [],
                 //to: new Date(), //Optional
                  inputDate: new Date(),      //Optional
                  mondayFirst: true,          //Optional
                  disableWeekdays: [],       //Optional
                  closeOnSelect: true,       //Optional
                  templateType: 'popup'       //Optional
            };

            var datePickedTo = {
                  callback: function (val) {  //Mandatory
                        $scope.selectedDate = (val, new Date(val));
                        $scope.nominaldate.to_date =  $filter('date')($scope.selectedDate, 'yyyy-MM-dd');
                        $scope.isDatePopupOpend = false;                      
                  },
                  disabledDates: [],
                 // to: new Date(), //Optional
                  inputDate: new Date(),      //Optional
                  mondayFirst: true,          //Optional
                  disableWeekdays: [],       //Optional
                  closeOnSelect: true,       //Optional
                  templateType: 'popup'       //Optional
            };

            $scope.openDatePicker = function(str){
                  $scope.isDatePopupOpend = true;
                  switch (str){
                        case 'from':
                        ionicDatePicker.openDatePicker(datePickedFrom);
                        return;
                        case 'to':
                        ionicDatePicker.openDatePicker(datePickedTo);
                        return;
                  }
            };



            $scope.openPopoverForDateFilter = function($event) {
                  $ionicPopover.fromTemplateUrl('templates/popovers/sort.by.date.popover.html', {
                        scope: $scope, 
                  }).then(function(popover) {
                        $scope.popover = popover; 
                        $scope.popover.show($event);
                  });
            };


            $scope.closePopoverForDateFilter = function() {
                  $scope.popover.hide();
            };

            $scope.clear = function() {                                             
                  if($scope.isDatePopupOpend) {
                        return;
                  }
                  $scope.nominalCompleteData = nominalRollsService.getnominalRollsCompleteData(); 
                  $scope.nominals = [];
                  angular.forEach($scope.nominalCompleteData, function(val){
                        $scope.nominals.push(val);                                                           
                  });
                  $scope.showDateRange = false; 
                  $scope.nominaldate = {};
                  $scope.closePopoverForDateFilter();                  
            }


            $scope.$on('popover.hidden', function() {
                  $scope.popover.remove();
            });

            $scope.quickActions = function(nominal) {
                  var txt = '';
                  var user_type = 'Admin' || 'Users'; 
                  if(nominal.status == 'Approved') {
                        $scope.buttonText = [                   
                              {text: '<i class="icon ion-plus-circled"></i> Add Sewadars'},
                              {text : '<i class="icon ion-edit"></i> Edit Nominal Roll '},
                              {text : '<i class="icon ion-paper-airplane"></i> Mark As Dispatched'}
                        ];
                  } else {
                        $scope.buttonText = [
                        {text : '<i class="icon ion-edit"></i> Edit Nominal Roll '}
                        ];
                  }

                  var buttons = [];
                  angular.forEach($scope.buttonText, function (val) {  
                        buttons.push({text: val.text});
                  }); 
                  $ionicActionSheet.show({                        
                        buttons: buttons,
                        titleText: 'Quick Actions',
                        cancelText: '<i class="icon ion-close-round assertive"></i> Cancel',
                        cancel: function() {
                              $log.debug('CANCELLED');
                        },
                        buttonClicked: function(index) {
                              var actionText = buttons[index].text;
                              switch (actionText){
                                    case '<i class="icon ion-plus-circled"></i> Add Sewadars' :
                                          nominalRollsService.setNominalRollsData(nominal);
                                          $state.go('nominal_rolls-list', {id: nominal.id, status: nominal.status});
                                          return true;
                                    case '<i class="icon ion-edit"></i> Edit Nominal Roll ' :
                                          nominalRollsService.setNominalRollsData(nominal);
                                          $state.go('addedit-nominal_rolls', {action: 'edit',id: nominal.id, user: ''});
                                          return true;
                                    case '<i class="icon ion-paper-airplane"></i> Mark As Dispatched' :
                                          nominal.status = 'dispatched';
                                          var query = "UPDATE nominal_roles SET status = 'dispatched' WHERE id = '"+nominal.id+"'";
                                          updateNominal(query);
                                          nominalRollsService.setNominalRollsData(nominal);
                                          return true;
                              }
                        }
                  });
            }

            var updateNominal = function (query) {
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                  }, function (err) { 

                  });
            };

            setup();
      };

      NominalRollsController.$inject  = ['$log', '$timeout', '$scope', '$state', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', 'ionicDatePicker', '$rootScope', 'nominalRollsService', '$cordovaToast', '$ionicActionSheet', 'cfpLoadingBar'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("NominalRollsController", NominalRollsController);
})();


