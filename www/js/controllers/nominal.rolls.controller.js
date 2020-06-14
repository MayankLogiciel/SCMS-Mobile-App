(function() {
       'use strict';
      /**
      * Satsang_Day_Attendance Controller
      **/
      var NominalRollsController = function($log, $timeout, $scope, $state, $ionicHistory, $cordovaSQLite, $ionicPopover, $ionicModal, $filter, ionicDatePicker, $rootScope, nominalRollsService, $cordovaToast, $ionicActionSheet, cfpLoadingBar, $ionicPopup) {
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
                  cfpLoadingBar.start();                   
                  $scope.getListForNominalRolls();                  
                  sewadarsCount();
            });  
            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };
            //refreshing page 
            $rootScope.$on('refreshPage',function(event, data){
                  $scope.getListForNominalRolls();
                  sewadarsCount();
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

            var sewadarsCount = function() {
                  var query = "select nominal_roll_id,sum(case when gender = 'M' then 1 else 0 end) Male,sum(case when gender = 'F' then 1 else 0 end) Female from ( SELECT DISTINCT sewadars.id, attendances.sewadar_type,sewadars.gender,attendances.nominal_roll_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where attendances.sewadar_type = 'permanent' AND attendances.status <> 'deleted' UNION SELECT DISTINCT temp_sewadars.id, attendances.sewadar_type,temp_sewadars.gender,attendances.nominal_roll_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where attendances.sewadar_type = 'temporary' AND attendances.status <> 'deleted')group by nominal_roll_id";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              for(var j= 0; j<$scope.nominals.length; j++) { 
                                    if($scope.nominals[j].id == res.rows.item(i).nominal_roll_id) {
                                          $scope.nominals[j].MaleCounts = res.rows.item(i).Male;
                                          $scope.nominals[j].FemaleCounts = res.rows.item(i).Female;
                                    }
                              }
                        }
                  }, function(err){
                  });
            }

            $scope.getListForNominalRolls = function(){
                  var query =  "select nr.*, (CASE WHEN v.id NOTNULL THEN v.name ELSE 'null' END) AS vehicle_type, s.name as sewa_name, d.name as jatha_name from nominal_roles AS nr left join vehicles as v ON v.id = nr.vehicle_id left join sewas as s ON s.id = nr.sewa_id left join departments as d ON d.id = nr.department_id  where nr.status <> 'deleted'";
                  getNominalRollsData(query); 
            };
            $scope.viewAndMarkAttendanceNominal = function(nominal) {
                  switch(nominal.status){
                        case 'Approved':
                        case 'approved':
                        case 'dispatched':
                              nominalRollsService.setNominalRollsData(nominal);
                              $state.go('nominal_rolls-list', {id: nominal.id, status: nominal.status});
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
                  var dateSplitted = data.from_date.split('-'); // date must be in DD-MM-YYYY format
                  var formattedDate = dateSplitted[1]+'-'+dateSplitted[0]+'-'+dateSplitted[2];
                  var fromDate = new Date(formattedDate);
                  var sDate = new Date(fromDate).getTime();

                  var dateToSplitted = data.to_date.split('-'); // date must be in DD-MM-YYYY format
                  var formattedToDate = dateToSplitted[1]+'-'+dateToSplitted[0]+'-'+dateToSplitted[2];
                  var toDate = new Date(formattedToDate);
                  var eDate = new Date(toDate).getTime();

                  if($scope.isDatePopupOpend) {
                        return;
                  }
                  if(sDate  > eDate) {
                       $cordovaToast.show('End date should be greater or equal to start date ', 'short', 'center');
                       return;
                  }  
                  $scope.nominalCompleteData = nominalRollsService.getnominalRollsCompleteData(); 
                  if(angular.isDefined(data.from_date) && angular.isDefined(data.to_date)) { 
                        $scope.nominals = [];
                        angular.forEach($scope.nominalCompleteData, function(val){
                              var dateValFromSplitted = val.date_from.split('-'); // date must be in DD-MM-YYYY format
                              
                              var formattedValFromDate = dateValFromSplitted[1]+'-'+dateValFromSplitted[2]+'-'+dateValFromSplitted[0];
                              var fromValDate = new Date(formattedValFromDate);
                              var fDate = new Date(fromValDate).getTime();
                              if((fDate >= sDate) && (fDate <= eDate)){
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
                       $scope.nominaldate.from_date =  $filter('date')($scope.selectedDate, 'dd-MM-yyyy');
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
                        $scope.nominaldate.to_date =  $filter('date')($scope.selectedDate, 'dd-MM-yyyy');
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

            $scope.$on('$destroy', function () {
                  $scope.popover.remove();
            });

            $scope.quickActions = function(nominal) {
                  var txt = '';
                  var user_type = 'Admin' || 'Users'; 
                  if(nominal.status == 'Approved' || nominal.status == 'approved') {
                        $scope.buttonText = [                   
                              {text: '<i class="icon ion-plus-circled"></i> Add Sewadars'},
                              {text : '<i class="icon ion-edit"></i> Edit Nominal Roll '},
                              {text : '<i class="icon ion-paper-airplane"></i> Mark As Dispatched'}
                        ];
                  } else if(nominal.status == 'Dispatched' || nominal.status == 'dispatched') {
                        $scope.buttonText = [
                              { text: '<i class="icon ion-checkmark-circled"></i> Mark As Approved' }
                        ];                    
                  }else {
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
                                    case '<i class="icon ion-checkmark-circled"></i> Mark As Approved' :
                                          markNominalRollApproved(nominal);
                                          return true;
                                    case '<i class="icon ion-paper-airplane"></i> Mark As Dispatched' :
                                          if(
                                                (!angular.isDefined(nominal.FemaleCounts) &&!angular.isDefined(nominal.MaleCounts)) ||
                                                (nominal.FemaleCounts == 0 && nominal.MaleCounts == 0)
                                           ) {
                                                $cordovaToast.show('You cannot dispatch as no sewadar added to this nominal', 'short', 'center');
                                                return true;
                                          }      
                                          var msgDispatched = "After dispached you will not able to add more sewadars or modify this nominal roll. Confirm to Proceed. ";
                                          showConfirm(msgDispatched, nominal);
                                          return true;
                              }
                        }
                  });
            }

            var showConfirm = function(str, nominal) { 
                  $ionicPopup.confirm({
                        title: 'Please Confirm',
                        template: str,
                        cssClass: 'confirm-delete',
                        buttons:[    
                        {
                              text: "Cancel",
                              type: 'button-balanced',
                              onTap: function(){                                              
                              }
                        },
                        {
                              text: 'OK',
                              type: 'button-positive',
                              onTap: function(){
                                    markAsDispatched(nominal);
                              }
                        }]
                  });                
            }; 

            var markAsDispatched = function(nominal) {
                  nominal.status = 'dispatched';
                  var query = "UPDATE nominal_roles SET status = 'dispatched' WHERE id ="+nominal.id;
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        nominalRollsService.setNominalRollsData(nominal);
                  }, function(err){
                  });
            }

            var markNominalRollApproved = function(nominal) {
                  nominal.status = 'approved';
                  var query = "UPDATE nominal_roles SET status = 'approved' WHERE id ="+nominal.id;
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        nominalRollsService.setNominalRollsData(nominal);
                  }, function(err){
                  });
            }

            var updateNominal = function (query) {
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                  }, function (err) { 

                  });
            };

            setup();
      };

      NominalRollsController.$inject  = ['$log', '$timeout', '$scope', '$state', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', 'ionicDatePicker', '$rootScope', 'nominalRollsService', '$cordovaToast', '$ionicActionSheet', 'cfpLoadingBar', '$ionicPopup'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("NominalRollsController", NominalRollsController);
})();


