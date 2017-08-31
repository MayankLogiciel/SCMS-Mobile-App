(function() {
       'use strict';
      /**
      * SecretaryHome Controller
      **/
      var SecretaryHomeController = function($log,$scope, $state, $filter, $cordovaSQLite, $timeout, nominalRollsService, $cordovaToast, $ionicHistory, $ionicActionSheet, $rootScope, authService, $ionicPopup) {
            var setup = function() {
                  $log.debug("Nominal Rolls Controller");
                  $scope.nominals = [];   
                  $scope.nominalAprroveList = [];
                  $scope.nominal = {};              
                  $scope.getListForNominalRolls(); 
                  $scope.approvalCount = 0;
                  $timeout(function(){
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                  },500);
                  $scope.sewadarsCount = [];
                  sewadarsCount();                  
            };

            var sewadarsCount = function() {
                  var query = "select nominal_roll_id,sum(case when gender = 'M' then 1 else 0 end) Male,sum(case when gender = 'F' then 1 else 0 end) Female from ( SELECT DISTINCT sewadars.id, attendances.sewadar_type,sewadars.gender,attendances.nominal_roll_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where attendances.sewadar_type = 'permanent' UNION SELECT DISTINCT temp_sewadars.id, attendances.sewadar_type,temp_sewadars.gender,attendances.nominal_roll_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where attendances.sewadar_type = 'temporary' )group by nominal_roll_id";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                             $scope.sewadarsCount.push(res.rows.item(i)); 
                        }
                  });
            }
           
            var getNominalRollsData = function(query) {
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        $scope.nominals = []; 
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.nominals.push(res.rows.item(i)); 
                                    if(res.rows.item(i).status == 'Approved' || res.rows.item(i).status == 'dispatched') {
                                          $scope.nominalAprroveList.push(res.rows.item(i)); 
                                    }
                              }  
                        }
                        $scope.checkedNominal(); 
                  }, function (err) { 
                  });
            };
            $scope.markApproved = function () {
                  var approved_by_group_id = authService.getLoggedInUserData();
                  if($scope.nominals.length <= 0) {
                        $cordovaToast.show('There is no nominal roll to approve ', 'short', 'center'); 
                        return;   
                  }
                  else if($scope.nominals.length > 0 && $scope.approvalCount <= 0) {
                      $cordovaToast.show('Please select atleast one nominal roll ', 'short', 'center'); 
                      return; 
                  } else {                        
                        $scope.nominals.ids = $filter('nominalFilter')($scope.nominals,'isSelected');  
                        for(var i = 0; i<$scope.nominals.ids.length; i++) {
                              var updateQuery = "UPDATE nominal_roles SET status = 'Approved', approved_by = "+approved_by_group_id.group_id + " WHERE id = '"+$scope.nominals.ids[i]+"'";
                              updateNominal(updateQuery, 'approvedMany', $scope.nominals.ids[i]);                       
                        }
                  }
            }

            $scope.logOut = function() {
                  localStorage.removeItem("SCMS_user");
                  localStorage.removeItem("SCMS_token");
                  //localStorage.clear();
                  $timeout(function () {
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                  },500);                  
                  $cordovaToast.show('Logged out successfully', 'short', 'center');
                  $state.go("login");
            }

            $scope.markSelected = function (nominal) {                  
                  if(nominal.isSelected == true) {                        
                        $scope.approvalCount =  $scope.approvalCount  + 1;
                  }
                  if(nominal.isSelected == false) {
                        $scope.approvalCount =  $scope.approvalCount  - 1;
                  }
            };

            //refreshing page 
            $rootScope.$on('refreshPage',function(event, data){
                  setup();
            });


            $scope.checkedNominal = function() {
                  angular.forEach($scope.nominalAprroveList, function(item) {
                        angular.forEach($scope.nominals, function(val, i) {
                              if( val.id == item.id ) {
                                    $scope.nominals[i].isSelected = true;    

                              }
                        });
                  });
                 
            }; 

            var  updateNominal = function(query, str, data) {
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) { 
                        if(str == 'approvedMany') {
                              for(var i =0 ; i<$scope.nominals.length; i++) {
                                    if($scope.nominals[i].id == data) {
                                        $scope.nominals[i].status = 'Approved'; 
                                        $scope.approvalCount =  $scope.approvalCount  - (i+1); 
                                    }
                              }
                              $cordovaToast.show('Nominal Roll Approved', 'short', 'center'); 
                        } else if(str == 'Approved' && data.isSelected ){
                              $scope.approvalCount =  $scope.approvalCount  - 1;
                              
                        }else {
                              $cordovaToast.show('Nominal Roll Approval removed', 'short', 'center'); 

                        }
                  }, function (err) { 
                  });
            }


            $scope.quickActions = function(nominal) {
                  var msg = "All assigned sewadars will be deleted with this Nominal Roll. Confirm to Proceed.";
                  var approved_by_group_id = authService.getLoggedInUserData();
                  var txt = '';
                  if(nominal.status == 'Approved') {
                        $scope.buttonText = [
                              {text: '<i class="icon ion-ios-close icon-space"></i>Remove Approval'},
                              {text : '<i class="icon ion-edit"></i> Edit Nominal Roll'},
                              {text : '<i class="icon ion-trash-a del-nominal-on-tab"></i> Delete Nominal Roll'},
                              {text : '<i class="icon ion-paper-airplane"></i> Mark As Dispatched'}
                        ];
                        txt = 'pending';
                  }else if(nominal.status == 'dispatched') {
                        $scope.buttonText = [
                              {text : '<i class="icon ion-edit"></i> Edit Nominal Roll'},
                              {text : '<i class="icon ion-trash-a del-nominal-on-tab"></i> Delete Nominal Roll'}
                        ];

                  }else {
                        $scope.buttonText = [                   
                              {text: '<i class="icon ion-checkmark-circled icon-space"></i>Mark As Approved'},
                              {text : '<i class="icon ion-edit"></i> Edit Nominal Roll'},
                              {text : '<i class="icon ion-trash-a del-nominal-on-tab"></i> Delete Nominal Roll'}
                        ];
                        txt = 'Approved';
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
                                    case '<i class="icon ion-checkmark-circled icon-space"></i>Mark As Approved' :
                                          nominal.status = txt;
                                          if(txt=='Approved') {
                                                nominal.isSelected = true;

                                          } else {
                                                nominal.isSelected = false;
                                          }                                         
                                          var query = "UPDATE nominal_roles SET status = '"+txt+"', approved_by = "+approved_by_group_id.group_id + " WHERE id = '"+nominal.id+"'";
                                          updateNominal(query, txt, nominal);
                                          return true;   
                                    case '<i class="icon ion-edit"></i> Edit Nominal Roll': 
                                          nominalRollsService.setNominalRollsData(nominal);
                                          $state.go('addedit-nominal_rolls', {action: 'edit',id: nominal.id, user: 'secretary'});
                                          return true;  
                                    case '<i class="icon ion-trash-a del-nominal-on-tab"></i> Delete Nominal Roll' : 
                                         showDeleteConfirm(msg, nominal.id);
                                          return true; 
                                    case '<i class="icon ion-paper-airplane"></i> Mark As Dispatched' :
                                          nominal.status = 'dispatched';
                                          nominal.isSelected = true;
                                          var query = "UPDATE nominal_roles SET status = 'dispatched' WHERE id = '"+nominal.id+"'";
                                          $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                                          }, function(err){
                                          });
                                          return true;
                                    case '<i class="icon ion-ios-close icon-space"></i>Remove Approval' :
                                          nominal.status = txt;
                                          nominal.isSelected = false;
                                          var query = "UPDATE nominal_roles SET status = '"+txt+"' WHERE id = '"+nominal.id+"'";
                                          updateNominal(query, txt, nominal);
                                          return true; 

                              }
                        }
                  });
            }

            // var checkAttendanceInNominalRoll = function(nominalId) {
            //       //var msgForNominalAndAttendace = "There are some attendances associated with this nominal roll you may lost those after deleting. Are you sure you want to delete this nominal roll?";
            //       //var msgForNominal = "Are you sure you want to detete this nominal roll?";
            //       var msg = "All assigned sewadars will be deleted with this Nominal Roll. Confirm to Proceed.";
            //       var checkAttendanceInNominalRollQuery = "select * from attendances where nominal_roll_id = " + nominalId;
            //       $cordovaSQLite.execute($rootScope.db, checkAttendanceInNominalRollQuery).then(function(res) {
            //             // if(res.rows.length > 0) {
            //             //       showDeleteConfirm(msgForNominalAndAttendace, nominalId, 'key')
            //             // } else {
            //             //       showDeleteConfirm(msgForNominal, nominalId)
            //             // }
            //             showDeleteConfirm(msg, nominalId);
            //       }, function(err){
            //       });
            // }


            var showDeleteConfirm = function(str, n_id, key) {                             
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
                              text: "Delete",
                              type: 'button-positive',
                              onTap: function(){
                                    deleteNominalRoll(n_id);
                              }
                        }]
                  });                
            }; 

            var deleteNominalRoll = function(n_id) {
                  var deleteNominalRollQuery = " delete from nominal_roles where id =" + n_id;
                  $cordovaSQLite.execute($rootScope.db, deleteNominalRollQuery).then(function(res) {
                        for(var i=0; i <$scope.nominals.length; i++) {
                              if($scope.nominals[i].id == n_id) {
                                    deleteNominalRollAttendance(n_id);
                                    $scope.nominals.splice(i,true);
                              }
                        }
                        $cordovaToast.show('Nominal Roll Delete successfully', 'short', 'center');         
                  });
            } 

            var deleteNominalRollAttendance = function(n_id) {
                  var deleteNominalRollAttendanceQuery = " delete from attendances where nominal_roll_id =" + n_id;
                  $cordovaSQLite.execute($rootScope.db, deleteNominalRollAttendanceQuery).then(function(res) {                               
                  });
            }     

            $scope.getListForNominalRolls = function(){
                  var dbName = 'database.sqlite';
                  $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'}); 
                  var query =  "select nr.*, (CASE WHEN v.id NOTNULL THEN v.name ELSE 'null' END) AS vehicle_type, s.name as sewa_name, d.name as jatha_name from nominal_roles AS nr left join vehicles as v ON v.id = nr.vehicle_id left join sewas as s ON s.id = nr.sewa_id left join departments as d ON d.id = nr.department_id";
                  getNominalRollsData(query);
            };            
            setup();
      };

      SecretaryHomeController.$inject  = ['$log', '$scope', '$state', '$filter', '$cordovaSQLite', '$timeout', 'nominalRollsService', '$cordovaToast', '$ionicHistory', '$ionicActionSheet', '$rootScope', 'authService', '$ionicPopup'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("SecretaryHomeController", SecretaryHomeController);
})();


