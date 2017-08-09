(function() {
       'use strict';
      /**
      * Satsang_Day_Attendance Controller
      **/
      var NominalRollsAddEditController = function($log, $scope, $state, $ionicHistory, $cordovaSQLite, $ionicPopover, $ionicModal, $filter, ionicDatePicker, $stateParams, $rootScope, $timeout, $cordovaToast, cfpLoadingBar, nominalRollsService, $cordovaPrinter) {
            var setup = function() {
                  $log.debug("Nominal Rolls Controller");
                  $scope.jathas = [];
                  $scope.nominal = {};
                  $scope.nominalRollsData = {};
                  $scope.nominal_id = $stateParams.id;
                  $scope.nominal_user = $stateParams.user;
                  $scope.nominal_action = $stateParams.action;  
                  $scope.isNotValidNumber = false;
                  $scope.newEntryDisabled = true;
                  $scope.isValidMiscSewa = true;
                  $scope.sewas = [];  
                  $rootScope.isDateFilterPopupOpened = false;
                  $scope.vehicles = [];
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  $scope.nominalRollsData = {
                        "value": "Scheduled", 
                        "values": [ "Scheduled", "Unschedule"]                          
                  };
                  $scope.isVehicaltypeSected = true;
                  if($scope.nominal_id) {
                        $scope.nominalRollsData = {
                              nominalPlace: {
                                    sewa_name: nominalRollsService.getNominalRollsData().sewa_name,
                                    sewa_id: nominalRollsService.getNominalRollsData().sewa_id
                              },

                              nominalDept: {
                                    jatha_name: nominalRollsService.getNominalRollsData().jatha_name,
                                    department_id: nominalRollsService.getNominalRollsData().department_id,
                              },

                              nominalVehicle: {
                                    vehicle_type: nominalRollsService.getNominalRollsData().vehicle_type,
                                    vehicle_id: nominalRollsService.getNominalRollsData().vehicle_id,
                              },

                              "value": (nominalRollsService.getNominalRollsData().is_scheduled == 1) ? "Scheduled" : "Unschedule", 
                              "values": [ "Scheduled", "Unschedule"]
                        }
                  }
                  if($scope.nominal_id && $scope.nominal_action=='edit') { 
                        $scope.addEditButton = 'UPDATE NOMINAL ROLL';
                        $scope.getNominalDataForEdit(nominalRollsService.getNominalRollsData());
                  } else {
                        $scope.addEditButton = 'ADD NOMINAL ROLL'
                  }
                  $scope.TempSewadarData = {};
                  $scope.refId = (new Date())/1000|0;
            };
            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };
           
            $scope.getNominalDataForEdit = function(nominalData) {
                  $scope.nominal = nominalData;
                  if(nominalData.sewa_name != "Misc Sewa"){
                        $scope.newEntryDisabled = true;
                        $scope.nominal.new_sewa = 'N/A';
                  }else {
                        $scope.newEntryDisabled = false;
                  }
                  if(nominalData.vehicle_type == 'null'){
                        $scope.isVehicaltypeSected = true;
                  }else {
                        $scope.isVehicaltypeSected = false;
                  }
                  $scope.nominal.vehicle_no = (nominalData.vehicle_no == 'null') ? 'N/A' : nominalData.vehicle_no;
                  $scope.nominal.driver_name = (nominalData.driver_name == 'null') ? 'N/A' : nominalData.driver_name;
            }

            $scope.selectedSchedule = function(data) {
                  $scope.schedule = data;
            }

            $scope.getListForSewas = function() {
                  var query = "SELECT name as sewa_name, id as sewa_id FROM sewas";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.sewas.push(res.rows.item(i));                                   
                              }

                        }
                  }, function (err) { 
                  });
            };  

            $scope.getListForJatha = function() {
                  var query = "SELECT name as jatha_name, id as department_id FROM departments";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.jathas.push(res.rows.item(i));                                   
                              }
                        }
                  }, function (err) { 
                  });
            };    

            $scope.getListForVehicle = function() {
                  var query = "SELECT name as vehicle_name, id as vehicle_id FROM vehicles";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.vehicles.push(res.rows.item(i));                                   
                              }
                        }
                  }, function (err) { 
                  });
            };   

            $scope.selectedSewa = function(sewa) {
                  $scope.sewaId =  sewa.sewa_id; 
                  if(sewa.sewa_name == "Misc Sewa") {
                        $scope.newEntryDisabled = false;
                  } else {
                        $scope.newEntryDisabled = true;
                  }                
            }

            $scope.selectedJatha = function(jatha) {                 
                  $scope.jathaId =  jatha.department_id;
            }

            $scope.selectedVehicle = function(vehicle) {                 
                  $scope.vehicleId =  (vehicle == null) ? null : vehicle.vehicle_id; 
                  if(vehicle != null) {
                        $scope.isVehicaltypeSected = false;
                  } else {
                        $scope.isVehicaltypeSected = true;
                  }
            }

            $scope.miscSewa = function(misc) { 
                  if(misc != '' && misc.length > 0) {
                        $scope.isValidMiscSewa = true;
                  }else {
                        $scope.isValidMiscSewa = false;
                  }
            }
            $scope.addEditNominal = function(nominalData) {
                  nominalData.new_sewa = (!angular.isDefined(nominalData.new_sewa)) ? null : nominalData.new_sewa;
                  $scope.vehicleId = (!angular.isDefined($scope.vehicleId)) ? null : $scope.vehicleId;
                  nominalData.vehicle_no  = (!angular.isDefined(nominalData.vehicle_no) || nominalData.vehicle_no == '') ? null : nominalData.vehicle_no;
                  nominalData.driver_name  = (!angular.isDefined(nominalData.driver_name)) ? null : nominalData.driver_name;                
                  if(nominalData.contact_no.length < 10 || !angular.isDefined(nominalData) || !angular.isDefined(nominalData.contact_no)) {
                        $scope.isNotValidNumber = true;
                        return;
                  }else {
                       $scope.isNotValidNumber = false; 
                  }
                  if(!$scope.newEntryDisabled && (!angular.isDefined(nominalData.new_sewa)|| nominalData.new_sewa == '')) {
                        $scope.isValidMiscSewa = false;
                        return;
                  }else {
                        $scope.isValidMiscSewa = true;
                  }
                  if(!angular.isDefined($scope.schedule)) {
                        $scope.schedule = 1;
                  }else {
                        $scope.schedule = ($scope.schedule=='Scheduled') ? 1 : 0;
                  }
                  if(nominalData.date_from > nominalData.date_to) {
                       $cordovaToast.show('End date should be greater or equal to start date ', 'short', 'center');
                       return;
                  }
                  if($scope.nominal_id) { 
                        if(!angular.isDefined($scope.sewaId)) {
                              $scope.sewaId = $scope.nominalRollsData.nominalPlace.sewa_id;
                        }
                        if(!angular.isDefined($scope.jathaId)) {
                              $scope.jathaId = $scope.nominalRollsData.nominalDept.department_id;
                        }
                        if($scope.vehicleId == null) {
                              //$scope.vehicleId = $scope.nominalRollsData.nominalVehicle.vehicle_id;
                              $scope.vehicleId = nominalData.vehicle_id;
                        }
                        var upadteQuery = "UPDATE nominal_roles SET name = '"+nominalData.name+"', sewa_id = '"+$scope.sewaId+"', vehicle_id = '"+$scope.vehicleId+"', department_id = '"+$scope.jathaId+"', date_from = '"+nominalData.date_from+"',date_to = '"+nominalData.date_to+"',driver_name = '"+nominalData.driver_name+"', vehicle_no = '"+nominalData.vehicle_no+"', contact_no = '"+nominalData.contact_no+"', is_scheduled = "+$scope.schedule+", 'new_sewa' = '"+nominalData.new_sewa+"' WHERE id = '"+$scope.nominal_id+"'";           
                        $cordovaSQLite.execute($rootScope.db, upadteQuery).then(function(res) {
                              $rootScope.$broadcast('refreshPage');
                              if($scope.nominal_user == 'secretary') {
                                    $timeout(function() {
                                          $state.go("secretary-home");
                                    }, 100);
                              }else {
                                    $timeout(function() {
                                          $state.go("nominal_rolls");
                                    }, 100);
                              }
                              $cordovaToast.show('Nominal roll updated successfully', 'short', 'center');
                        }, (err) => {  
                        }); 
                  }else {                        
                        var status = 'pending'; 
                        var approved_by = 0;
                        var incharge_id = null;
                        var incharge_type = null;
                        var Insertquery = "INSERT INTO nominal_roles('name', 'sewa_id', 'driver_name', 'contact_no', 'department_id', 'vehicle_id', 'vehicle_no', 'date_from', 'date_to', 'status', 'reference_id', 'created_at', 'updated_at', 'approved_by', 'is_scheduled', 'new_sewa', 'incharge_id', 'incharge_type') VALUES ('"+nominalData.name+"', '"+$scope.sewaId+"', '"+nominalData.driver_name+"', '"+nominalData.contact_no+"', '"+$scope.jathaId+"' , "+$scope.vehicleId+", '"+nominalData.vehicle_no+"', '"+nominalData.date_from+"', '"+nominalData.date_to+"', '"+status+"', NULL, '"+$scope.current+"', '"+$scope.current+"', "+approved_by+", "+$scope.schedule+", '"+nominalData.new_sewa+"', '"+incharge_id+"', '"+incharge_type+"')";
                              $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(res) {
                                    $rootScope.$broadcast('refreshPage',{vahicleId: $scope.vehicleId});
                                    $state.go("nominal_rolls");
                                    $cordovaToast.show('Nominal roll added successfully', 'short', 'center');
                              }, (err) => { 
                        });
                        
                  };
            };
            var datePickedFrom = {
                  callback: function (val) {  //Mandatory
                       $scope.selectedDate = (val, new Date(val));
                       $scope.nominal.date_from =  $filter('date')(($scope.selectedDate),'yyyy-MM-dd');
                  },
                  disabledDates: [],
                  from: new Date(), //Optional
                 // to: new Date(2020, 10, 30), //Optional
                  inputDate: new Date(),      //Optional
                  mondayFirst: true,          //Optional
                  disableWeekdays: [],       //Optional
                  closeOnSelect: true,       //Optional
                  templateType: 'popup'       //Optional
            };
            var datePickedTo = {
                  callback: function (val) {  //Mandatory
                        $scope.selectedDate = (val, new Date(val));
                        $scope.nominal.date_to =  $filter('date')(($scope.selectedDate),'yyyy-MM-dd');
                  },
                  disabledDates: [],
                  from: new Date(), //Optional
                 // to: new Date(2020, 10, 30), //Optional
                  inputDate: new Date(),      //Optional
                  mondayFirst: true,          //Optional
                  disableWeekdays: [],       //Optional
                  closeOnSelect: true,       //Optional
                  templateType: 'popup'       //Optional
            };
            $scope.openDatePicker = function(str){
                  switch (str){
                        case 'from':
                        ionicDatePicker.openDatePicker(datePickedFrom);
                        return;
                        case 'to':
                        ionicDatePicker.openDatePicker(datePickedTo);
                        return;
                  }
            };
            setup();
      };

      NominalRollsAddEditController.$inject  = ['$log', '$scope', '$state', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', 'ionicDatePicker','$stateParams', '$rootScope', '$timeout', '$cordovaToast', 'cfpLoadingBar', 'nominalRollsService', '$cordovaPrinter'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("NominalRollsAddEditController", NominalRollsAddEditController);
})();


