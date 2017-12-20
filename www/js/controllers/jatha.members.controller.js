(function() {
       'use strict';
      /**
      * Jatha Members Controller
      **/
      var JathaMembersController = function($log, $scope, $filter, $ionicHistory, $state, $ionicPopup, $cordovaToast, $cordovaSQLite, cfpLoadingBar, $cordovaFile, $window, nominalRollsService, $ionicTabsDelegate, profilePicService, $rootScope, $timeout) {
            var setup = function() {
                  $log.debug("Jatha Members Controller");                  
                  $scope.maleMembers = [];
                  $scope.femaleMembers = [];
                  $scope.jathas = [];
                  $scope.tempArray = [];
                  idsFromAttedance();                  
                  if(profilePicService.getTimeOfPic()=='') {
                        $scope.timeStampPhoto = '';
                  }else {
                       $scope.timeStampPhoto =  profilePicService.getTimeOfPic();
                  }
                  $scope.imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/';
                  $scope.defaultImage = 'img/imgUnavailable.png';
                  $scope.maleSelectedCount = 0;
                  $scope.femaleSelectedCount = 0;
                  $scope.isFemale = false;
                  $scope.alreadyPresentSewadars = [];
                  $scope.maleIds = [];
                  $scope.femaleIds = [];
                  $scope.nominalRollsData = nominalRollsService.getNominalRollsData();
                  var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                  $scope.startDate = new Date($scope.nominalRollsData.date_from);
                  var endDate = new Date($scope.nominalRollsData.date_to);
                  $scope.diffDays = Math.round(Math.abs(($scope.startDate.getTime() - endDate.getTime())/(oneDay)));
            };      

            $scope.$on('$ionicView.enter', function() {
                  cfpLoadingBar.start(); 
                  $scope.getMaleMembers();
                  $scope.getFemaleMembers();
            }); 

            $scope.selectedJatha = function(jatha) {
                  $scope.jathaFlag = false;
                  if($scope.jathaFlag){
                        $scope.jathas = []; 
                  }
                  var jathaName;     
                  var query = "SELECT name as jatha_name FROM departments where id = " + jatha.department_id ;
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) {
                              jathaName = res.rows.item(i).jatha_name;
                        }
                  }); 
                  $timeout(function() {                        
                        $scope.maleMembers = [];
                        $scope.femaleMembers = []; 
                        $scope.nominalRollsData.jatha_name = jathaName;
                        $scope.jathaFlag = true;
                        $scope.getListForJatha();
                        $scope.getMaleMembers();
                        $scope.getFemaleMembers();
                  }, 100);
            }

            
            function htmlDecode(input) {
                  var e = document.createElement('div');
                  e.innerHTML = input;
                  return e.childNodes[0].nodeValue;
            }

            $scope.getListForJatha = function() {
                  var query = "SELECT name as jatha_name, id as department_id FROM departments ORDER BY jatha_name ASC";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        cfpLoadingBar.start();
                        if(res.rows.length > 0) {
                              $scope.jathas = [];
                              for(var i= 0; i<res.rows.length; i++) { 
                                    if($scope.nominalRollsData.jatha_name == res.rows.item(i).jatha_name) {
                                          res.rows.item(i).jatha_name = htmlDecode(res.rows.item(i).jatha_name + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10003;");
                                    }
                                    $scope.jathas.push(res.rows.item(i));                                   
                              }
                        }
                        cfpLoadingBar.complete();
                  }, function (err) { 
                  });
            };          

            $scope.tabClicked = function(member) {
                  switch (member){
                        case 'male':
                        $ionicTabsDelegate.select(0);
                        $scope.isFemale = false; 
                        return;
                        case 'female':
                        $ionicTabsDelegate.select(1);  
                        $scope.isFemale = true;
                        return;
                  }                  
            }

            var idsFromAttedance = function () {
                  $scope.nominalRollsData = nominalRollsService.getNominalRollsData();
                  var query = "select sewadar_id from attendances where nominal_roll_id = '"+$scope.nominalRollsData.id+"' AND batch_type = 'permanent' AND sewadar_type = 'permanent'";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) { 
                        for(var i= 0; i<res.rows.length; i++) {
                              $scope.alreadyPresentSewadars.push(res.rows.item(i));
                        }
                  });

            }

            $scope.checkedMale = function() {
                  angular.forEach($scope.alreadyPresentSewadars, function(item) {
                        angular.forEach($scope.maleMembers, function(val, i) {
                              if(val.id == item.sewadar_id ) {
                                    $scope.maleMembers[i].isDisabled = true;
                                    $scope.maleMembers[i].isSelected = true; 
                              }else {
                              }
                        });
                  });
                 
            }; 

            $scope.checkedFemale = function() {
                  angular.forEach($scope.alreadyPresentSewadars, function(item) {
                        angular.forEach($scope.femaleMembers, function(val, i) {
                              if(val.id == item.sewadar_id ) {   
                                    $scope.femaleMembers[i].isDisabled = true;                                                                     
                                    $scope.femaleMembers[i].isSelected = true;  
                              }
                        });
                  });
                 
            }; 
            $scope.addMaleSewadars = function() {
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  var type = 'nominal_roll';
                  var batch_type = 'permanent';
                  $scope.refId = (new Date())/1000|0; 
                  var sewadar_type = 'permanent';
                  var Insertquery;
                  var date = new Date($scope.startDate); 
                  var nominalAttendanceDate = date;  
                  if($scope.maleSelectedCount <= 0) {
                        $cordovaToast.show('There is no sewadar to add ', 'short', 'center'); 
                        return;   
                  }else {
                        $scope.initialValueMale = 0;
                        $scope.maleIdsLength = $scope.maleIds.length;
                        for(var i =0; i< $scope.maleIdsLength; i++) {
                              if($scope.tempArray.indexOf($scope.maleIds[i]) > -1) {
                                    continue;
                              }
                              var reference_id = $scope.refId+$scope.maleIds[i];
                              Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id') VALUES ('"+nominalAttendanceDate+"','"+$scope.maleIds[i]+"','"+$scope.nominalRollsData.sewa_id+"', '"+reference_id+"', '"+type+"', '"+batch_type+"','"+$scope.current+"','"+$scope.current+"', '"+sewadar_type+"','"+$scope.nominalRollsData.id+"')";
                              $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(res) {
                                          $scope.tempArray.push($scope.maleIds[i]);
                                          $scope.maleSelectedCount = 0;
                                          $state.go('nominal_rolls-list', {id: $scope.nominalRollsData.id, status: 'Approved'});
                                   
                              }, function(err) { 
                              }); 
                              $cordovaToast.show('Sewadar added', 'short', 'center'); 
                        }

                  }                 
            };


            $scope.addFemaleSewadars = function() {
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  var type = 'nominal_roll';
                  var batch_type = 'permanent';
                  $scope.refId = (new Date())/1000|0; 
                  var sewadar_type = 'permanent';
                  var Insertquery;
                  var date = new Date($scope.startDate); 
                  var nominalAttendanceDate = date;  
                  if($scope.femaleSelectedCount <= 0) {
                        $cordovaToast.show('There is no sewadar to add ', 'short', 'center'); 
                        return;   
                  }else {
                        $scope.initialValueFemale = 0;
                        $scope.femaleIdsLength = $scope.femaleIds.length;
                        for(var i =0; i<$scope.femaleIdsLength; i++) {
                              if($scope.tempArray.indexOf($scope.femaleIds[i]) > -1) {
                                    continue;
                              }
                              var reference_id = $scope.refId+$scope.femaleIds[i];
                              Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id') VALUES ('"+nominalAttendanceDate+"','"+$scope.femaleIds[i]+"','"+$scope.nominalRollsData.sewa_id+"', '"+reference_id+"', '"+type+"', '"+batch_type+"','"+$scope.current+"','"+$scope.current+"', '"+sewadar_type+"','"+$scope.nominalRollsData.id+"')";
                              $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(res) {
                                          $scope.tempArray.push($scope.femaleIds[i]);
                                          $scope.femaleSelectedCount = 0;
                                          $state.go('nominal_rolls-list', {id: $scope.nominalRollsData.id, status: 'Approved'});
                                   
                              }, function(err) { 
                              }); 
                              $cordovaToast.show('Sewadar added', 'short', 'center'); 
                        }

                  }                 
            };
           
            $scope.markSelected = function (member, type) { 
                 
                  if(member.isSelected == true && type == 'male') {                        
                        $scope.maleSelectedCount =  $scope.maleSelectedCount  + 1;
                        $scope.maleIds.push(member.id);
                  }
                  if(member.isSelected == false && type == 'male') {
                        $scope.maleSelectedCount =  $scope.maleSelectedCount  - 1;
                        $scope.maleIds.splice($scope.maleIds.indexOf(member.id), 1);
                  }
                  if(member.isSelected == true && type == 'female') {                        
                        $scope.femaleSelectedCount =  $scope.femaleSelectedCount  + 1;
                        $scope.femaleIds.push(member.id);

                  }
                  if(member.isSelected == false && type == 'female') {
                        $scope.femaleSelectedCount =  $scope.femaleSelectedCount  - 1;
                        $scope.femaleIds.splice($scope.femaleIds.indexOf(member.id), 1);
                  }
                  
            };

            $scope.getMaleMembers = function () {
                 
                  $scope.nominalRollsData = nominalRollsService.getNominalRollsData();                  
                  var getmaleQuery = "select * from sewadars where sewadars.gender = 'M' AND sewadars.department_name = '"+$scope.nominalRollsData.jatha_name+"' ORDER BY CAST(sewadars.batch_no AS INTEGER) ASC";
                  $cordovaSQLite.execute($rootScope.db,getmaleQuery).then(function(res) {
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) {
                                   $scope.maleMembers.push(res.rows.item(i));
                              }                               
                        }  
                  findImageMale(); 
                  $scope.checkedMale();
                  }, function (err) { 
                  });
            }

            var findImageMale = function() {
                  angular.forEach($scope.maleMembers, function(val, i){
                        $cordovaFile.checkFile($scope.imagePath, val.photo)
                        .then(function (success) {
                              $scope.maleMembers[i].isImageFound = true;
                        }, function (error) {
                              $scope.maleMembers[i].isImageFound = false;
                        });  
                  });
            }

            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };            
            
            $scope.getFemaleMembers = function () {
                  var getfemaleQuery = "SELECT * FROM sewadars where gender='F' AND sewadars.department_name = '"+$scope.nominalRollsData.jatha_name+"' ORDER BY CAST(sewadars.batch_no AS INTEGER) ASC ";
                  $cordovaSQLite.execute($rootScope.db,getfemaleQuery).then(function(res) {
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.femaleMembers.push(res.rows.item(i));                              
                              } 
                        } 
                  findImageFemale();
                  $scope.checkedFemale();  
                  cfpLoadingBar.complete();                      
                  }, function (err) { 
                  });
            }
            var findImageFemale = function() {
                  angular.forEach($scope.femaleMembers, function(val, i){
                        $cordovaFile.checkFile($scope.imagePath, val.photo)
                        .then(function (success) {
                              $scope.femaleMembers[i].isImageFound = true;
                        }, function (error) {
                              $scope.femaleMembers[i].isImageFound = false;
                        });  
                  });
            }           

            setup();
      };

      JathaMembersController.$inject  = ['$log', '$scope', '$filter', '$ionicHistory', '$state', '$ionicPopup', '$cordovaToast', '$cordovaSQLite', 'cfpLoadingBar', '$cordovaFile', '$window', 'nominalRollsService', '$ionicTabsDelegate', 'profilePicService', '$rootScope', '$timeout'];

      angular
      .module('SCMS_ATTENDANCE')
      .controller("JathaMembersController", JathaMembersController);
})();

