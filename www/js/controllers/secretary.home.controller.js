(function() {
       'use strict';
      /**
      * SecretaryHome Controller
      **/
      var SecretaryHomeController = function($log,$scope, $state, $filter, $cordovaSQLite, $timeout, nominalRollsService, $cordovaToast, $ionicHistory, $ionicActionSheet, $rootScope, authService, $ionicPopup, $stateParams, $ionicPopover, cfpLoadingBar) {
            var setup = function() {
                  $log.debug("Nominal Rolls Controller");
                  $scope.nominals = [];   
                  $scope.nominalAprroveList = [];
                  $scope.nominal = {};              
                  $scope.getListForNominalRolls(); 
                  $scope.approvalCount = 0;
                  $scope.sewadarsCount = [];
                  $scope.selectedStatus = 'All';
                  $scope.tempData = [];
                  sewadarsCount(); 
                  if($state.current.name == "app") {
                        $timeout(function(){
                              $ionicHistory.clearCache();
                              $ionicHistory.clearHistory();
                        },500);
                  }     
            };

            $scope.goBack = function() {
                  $ionicHistory.goBack();
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
            $scope.openSyncNominalPopover = function($event) {
                  $ionicPopover.fromTemplateUrl('templates/popovers/sync.delete.nominal.rolls.popover.html', {
                        scope: $scope,
                  }).then(function(popover) {
                        $scope.popover = popover; 
                        $scope.popover.show($event);
                  });
            };

            var closeSyncDeletePopOver = function(){
                  $scope.popover.hide();                  
            }

            $scope.$on('$destroy', function () {
                  $scope.popover.remove();
            });
           
            var getNominalRollsData = function(query) {
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {

                        $scope.nominals = []; 
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    res.rows.item(i).status = (res.rows.item(i).status == 'approved')?'Approved':res.rows.item(i).status;
                                    $scope.nominals.push(res.rows.item(i));
                                    $scope.tempData.push(res.rows.item(i)); 
                              }  
                        }
                  }, function (err) { 
                  });
                  cfpLoadingBar.complete();
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
                  $cordovaToast.show('Logged out successfully', 'short', 'center');
                  $state.go("login");
            }

            $scope.markSelected = function (nominal) { 
                  if(nominal.isSelected) {
                        $scope.approvalCount =  $scope.approvalCount  + 1;
                  }else {
                        $scope.approvalCount =  $scope.approvalCount  - 1;
                  }   
            };

            //refreshing page 
            $rootScope.$on('refreshPage',function(event, data){
                  setup();
            });

            var  updateNominal = function(query, str, data) {
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) { 
                        if(str == 'approvedMany') {
                              for(var i =0 ; i<$scope.nominals.length; i++) {
                                    if($scope.nominals[i].id == data) {
                                        $scope.nominals[i].status = 'Approved'; 
                                        $scope.nominals[i].isSelected = false; 
                                    }
                              }
                              //$cordovaToast.show('Nominal Roll Approved', 'short', 'center');
                              $scope.approvalCount = 0; 
                        }else {
                              $cordovaToast.show('Nominal Roll Approval removed', 'short', 'center');
                        }
                  }, function (err) { 
                  });
            }


            $scope.quickActions = function(nominal) {
                  var msg = "All assigned sewadars will be deleted with this Nominal Roll. Confirm to Proceed.";
                  var msgDispatched = "Nominal rolls having status approved and have sewadar/sewadars will be disspached only.";
                  var approved_by_group_id = authService.getLoggedInUserData();
                  var txt = '';
                  if(nominal.status == 'Approved' || nominal.status == 'approved') {
                        $scope.buttonText = [
                              {text: '<i class="icon ion-ios-close icon-space"></i>Remove Approval'},
                              {text : '<i class="icon ion-edit"></i> Edit Nominal Roll'},
                              {text : '<i class="icon ion-trash-a del-nominal-on-tab"></i> Delete Nominal Roll'},
                              {text : '<i class="icon ion-paper-airplane"></i> Mark As Dispatched'}
                        ];
                        txt = 'pending';
                  }
                  else if(nominal.status == 'dispatched') {
                        $scope.buttonText = [
                              {text: '<i class="icon ion-checkmark-circled icon-space"></i>Mark As Approved'},
                              {text : '<i class="icon ion-trash-a del-nominal-on-tab"></i> Delete Nominal Roll'}
                        ];
                        txt = 'Approved';
                  }
                  else {
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
                                          var query = "UPDATE nominal_roles SET status = '"+txt+"', approved_by = "+approved_by_group_id.group_id + " WHERE id = '"+nominal.id+"'";
                                          updateNominal(query, txt, nominal);
                                          return true;   
                                    case '<i class="icon ion-edit"></i> Edit Nominal Roll': 
                                          nominalRollsService.setNominalRollsData(nominal);
                                          $state.go('addedit-nominal_rolls', {action: 'edit',id: nominal.id, user: 'secretary'});
                                          return true;  
                                    case '<i class="icon ion-trash-a del-nominal-on-tab"></i> Delete Nominal Roll' : 
                                         showConfirm(msg, nominal.id, 'deleted');
                                          return true; 
                                    case '<i class="icon ion-paper-airplane"></i> Mark As Dispatched' :
                                          if(
                                                (!angular.isDefined(nominal.FemaleCounts) &&!angular.isDefined(nominal.MaleCounts)) ||
                                                (nominal.FemaleCounts == 0 && nominal.MaleCounts == 0)
                                           ) {
                                                $cordovaToast.show('You cannot dispatch as no sewadar added to this nominal', 'short', 'center');
                                                return true;
                                          }                                         
                                          showConfirm(msgDispatched, nominal, 'dispatched');                                          
                                          return true;
                                    case '<i class="icon ion-ios-close icon-space"></i>Remove Approval' :
                                          if(
                                                (angular.isDefined(nominal.FemaleCounts) || angular.isDefined(nominal.MaleCounts)) &&
                                                (nominal.FemaleCounts > 0 || nominal.MaleCounts > 0)
                                          ) {
                                                $cordovaToast.show('You cannot remove approval as sewadar added to this nominal', 'short', 'center');
                                                return true;
                                          }
                                          nominal.status = txt;
                                          var query = "UPDATE nominal_roles SET status = '"+txt+"' WHERE id = '"+nominal.id+"'";
                                          updateNominal(query, txt, nominal);
                                          return true;
                              }
                        }
                  });
            }

            var showConfirm = function(str, n_id, key) { 
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
                              text: (key == 'deleted') ? 'Delete' : 'OK',
                              type: 'button-positive',
                              onTap: function(){
                                    switch(key) {
                                          case 'deleted': 
                                                deleteNominalRoll(n_id);
                                                return true;
                                          case 'dispatched': 
                                                markAsDispatched(n_id);
                                                return true;
                                          case 'delete-selected': 
                                                delSelected();
                                                return true;
                                          case 'dispatched-selected': 
                                                markAsDispatchedSelected();
                                                return true;
                                          }                                      
                              }
                        }]
                  });                
            }; 

            $scope.deleteSelected = function() {
                  if($scope.nominals.length > 0 && $scope.approvalCount <= 0) {
                      $cordovaToast.show('Please select atleast one nominal roll ', 'short', 'center'); 
                      return; 
                  }
                  var msg = "All assigned sewadars will be deleted with all Nominal Rolls. Confirm to Proceed.";
                  showConfirm(msg, 'all', 'delete-selected');
            }

            var delSelected = function () {
                  $scope.nominals.ids = $filter('nominalFilter')($scope.nominals,'isSelected');  
                  angular.forEach($scope.nominals.ids, function (row, index) {
                        var query = "UPDATE nominal_roles SET status = 'deleted' WHERE id = '"+row+"'";                 
                        $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                              angular.forEach($scope.nominals, function (row1, i) {
                                    if(row == row1.id) {
                                          $scope.nominals.splice(i, true);                                          
                                    }
                              });
                        }, function(err){
                        });
                  });
                  $scope.approvalCount = 0;
            }

            $scope.dispatchedSelected = function() {
                  if($scope.nominals.length > 0 && $scope.approvalCount <= 0) {
                      $cordovaToast.show('Please select atleast one nominal roll ', 'short', 'center'); 
                      return; 
                  }
                  var msg = "Nominal rolls having status approved and have sewadar/sewadars will be disspached only.";
                  showConfirm(msg, 'all', 'dispatched-selected');            
            }

            var markAsDispatchedSelected = function () {
                  $scope.nominals.ids = $filter('nominalFilter')($scope.nominals,'isSelected');  
                  angular.forEach($scope.nominals.ids, function(value,j) {
                        angular.forEach($scope.nominals, function(val,i) {
                              if(
                                    (value == val.id && 
                                    (val.status == 'Approved' || val.status == 'dispatched')) && 
                                    ((val.MaleCounts > 0) || 
                                    (val.FemaleCounts > 0))
                              ) {
                                    var query = "UPDATE nominal_roles SET status = 'dispatched' WHERE id = '"+value+"'";
                                    $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                                          $scope.nominals[i].status = 'dispatched'; 
                                          $scope.nominals[i].isSelected = false; 
                                    }, function(err){
                                    });
                                    
                              }else {
                                    $scope.nominals[i].isSelected = false; 
                              }
                            
                        });   
                  });
                  $scope.approvalCount = 0;
            }


            var markAsDispatched = function(nominal) {
                  nominal.status = 'dispatched';
                  var query = "UPDATE nominal_roles SET status = 'dispatched' WHERE id ="+nominal.id;
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                  }, function(err){
                  });
            }

            var deleteNominalRoll = function(n_id) {
                  var query = "UPDATE nominal_roles SET status = 'deleted' WHERE id ="+n_id;
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i=0; i <$scope.nominals.length; i++) {
                              if($scope.nominals[i].id == n_id) {
                                    $scope.nominals.splice(i,true);
                              }                             
                        }                      
                  }, function(err){
                  });
            } 

            var deleteNominalRollAttendance = function(n_id) {
                  var query = "UPDATE attendances SET status = 'deleted' WHERE nominal_roll_id =" + n_id;
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                  }, function(err){
                  });                  
            }  

            $scope.$on('floating-menu:open', function(){
                  $scope.isDisabled = true; 
            });
            $scope.$on('floating-menu:close', function(){
                  $scope.isDisabled = false; 
            });

            $scope.openStatusPopover = function($event) {
                  $ionicPopover.fromTemplateUrl('templates/popovers/secrectary.filter.popover.html', {
                        scope: $scope,
                        //backdropClickToClose: false                  
                  }).then(function(popover) {
                        $scope.popover = popover; 
                        $scope.popover.show($event);
                  });
            };

            var closeStatusPopover = function() {
                  $scope.popover.hide();
            }

            $scope.byStatus = function(str) {
                  $scope.nominals = []; 
                  $scope.selectedStatus = str;
                  closeStatusPopover();
                  switch (str){
                        case 'all':
                        $scope.nominals = $scope.tempData;
                        return;
                        default :
                        angular.forEach($scope.tempData, function(val) {
                              if(val.status == str) {
                                    $scope.nominals.push(val);
                              }
                        });                        
                  }
            }

            $scope.getListForNominalRolls = function(){
                  cfpLoadingBar.start();
                  var dbName = 'database.sqlite';
                  $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'}); 
                  var query =  "select nr.*, (CASE WHEN v.id NOTNULL THEN v.name ELSE 'null' END) AS vehicle_type, s.name as sewa_name, d.name as jatha_name from nominal_roles AS nr left join vehicles as v ON v.id = nr.vehicle_id left join sewas as s ON s.id = nr.sewa_id left join departments as d ON d.id = nr.department_id where nr.status <> 'deleted'";
                  getNominalRollsData(query);
            };            
            setup();
      };

      SecretaryHomeController.$inject  = ['$log', '$scope', '$state', '$filter', '$cordovaSQLite', '$timeout', 'nominalRollsService', '$cordovaToast', '$ionicHistory', '$ionicActionSheet', '$rootScope', 'authService', '$ionicPopup', '$stateParams', '$ionicPopover', 'cfpLoadingBar'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("SecretaryHomeController", SecretaryHomeController);
})();