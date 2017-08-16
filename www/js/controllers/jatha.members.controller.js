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
                  idsFromAttedance();                  
                  if(profilePicService.getTimeOfPic()=='') {
                        $scope.timeStampPhoto = '';
                  }else {
                       $scope.timeStampPhoto =  profilePicService.getTimeOfPic();
                  }
                  $scope.imagePath = cordova.file.externalApplicationStorageDirectory + 'import/sewadar_pics/';
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
                  $scope.getMaleMembers();
                  $scope.getFemaleMembers();
            }); 

            $scope.selectedJatha = function(jatha) {
                  $scope.jathaFlag = false;
                  if($scope.jathaFlag){
                        $scope.jathas = []; 
                  }
                  var jathaName;     
                  var query = "SELECT name as jatha_name FROM departments where id = " + jatha.department_id;
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
                  var query = "SELECT name as jatha_name, id as department_id FROM departments";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    if($scope.nominalRollsData.jatha_name == res.rows.item(i).jatha_name) {
                                          res.rows.item(i).jatha_name = htmlDecode(res.rows.item(i).jatha_name + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10003;");
                                    }
                                    $scope.jathas.push(res.rows.item(i));                                   
                              }
                        }
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
                  var query = "select sewadar_id from attendances where nominal_roll_id = '"+$scope.nominalRollsData.id+"'";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) { 
                        for(var i= 0; i<res.rows.length; i++) {
                              $scope.alreadyPresentSewadars.push(res.rows.item(i));
                        }
                  });

            }

            $scope.checkedMale = function() {
                  angular.forEach($scope.alreadyPresentSewadars, function(item) {
                        angular.forEach($scope.maleMembers, function(val, i) {
                              if( val.id == item.sewadar_id ) {
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
                              if( val.id == item.sewadar_id ) {   
                                    $scope.femaleMembers[i].isDisabled = true;                                                                     
                                    $scope.femaleMembers[i].isSelected = true;  
                              }
                        });
                  });
                 
            }; 
            $scope.addMaleSewadars = function() {
                  if($scope.maleSelectedCount <= 0) {
                        $cordovaToast.show('There is no sewadar to add ', 'short', 'center'); 
                        return;   
                  }else {
                        $scope.initialValueMale = 0;
                        $scope.maleIdsLength = $scope.maleIds.length;
                        $scope.days = $scope.diffDays + 1;
                        numberOfMaleToAdd(0, $scope.maleIdsLength)
                  }                 
            };
            var numberOfMaleToAdd = function(c, l) {
                  if(c < l) {
                        howManyTimeMaleSewadarAdd(0, $scope.days);
                  }else {
                        $cordovaToast.show('Sewadar added', 'short', 'center'); 
                        $scope.maleSelectedCount = 0;
                        $state.go('nominal_rolls-list', {id: $scope.nominalRollsData.id, status: 'Approved'}); 
                  }
            }
            
            var howManyTimeMaleSewadarAdd = function (c, l) {
                  if(c < l) {
                        addMaleSewadarsNested(c);
                  }else {
                       numberOfMaleToAdd(++$scope.initialValueMale, $scope.maleIdsLength);
                  }
            }
            var addMaleSewadarsNested = function(i) { 
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  var type = 'nominal_roll';
                  var batch_type = 'permanent';
                  $scope.refId = (new Date())/1000|0; 
                  var reference_id = $scope.refId;
                  var sewadar_type = 'permanent';
                  var Insertquery;
                  var date = new Date($scope.startDate);                 
                  var nominalAttendanceDate= $filter('date')(new Date(date.setDate(date.getDate() + (i))), 'yyyy-MM-dd');
                  Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id') VALUES ('"+nominalAttendanceDate+"','"+$scope.maleIds[$scope.initialValueMale]+"','"+$scope.nominalRollsData.sewa_id+"', '"+reference_id+"', '"+type+"', '"+batch_type+"','"+$scope.current+"','"+$scope.current+"', '"+sewadar_type+"','"+$scope.nominalRollsData.id+"')";
                  $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(res) {
                        if(i == 0) {                              
                              howManyTimeMaleSewadarAdd(i+1, $scope.days);
                        }else{
                              howManyTimeMaleSewadarAdd(i+1, $scope.days);
                        }
                  }, (err) => {                  
                  }); 
            };

            $scope.addFemaleSewadars = function() {
                  if($scope.femaleSelectedCount <= 0) {
                        $cordovaToast.show('There is no sewadar to add ', 'short', 'center'); 
                        return;   
                  }else {
                        $scope.initialValueFemale = 0;
                        $scope.femaleIdsLength = $scope.femaleIds.length;
                        $scope.days = $scope.diffDays + 1;
                        numberOfFemaleToAdd(0, $scope.femaleIdsLength)
                  }                 
            };
            var numberOfFemaleToAdd = function(c, l) {
                  if(c < l) {
                        howManyTimeFemaleSewadarAdd(0, $scope.days);
                  }else {
                        $cordovaToast.show('Sewadar added', 'short', 'center'); 
                        $scope.femaleSelectedCount = 0;
                        $state.go('nominal_rolls-list', {id: $scope.nominalRollsData.id, status: 'Approved'}); 
                  }
            }
            
            var howManyTimeFemaleSewadarAdd = function (c, l) {
                  if(c < l) {
                        addFemaleSewadarsNested(c);
                  }else {
                       numberOfFemaleToAdd(++$scope.initialValueFemale, $scope.femaleIdsLength);
                  }
            }


            var addFemaleSewadarsNested = function(i) {
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  var type = 'nominal_roll';
                  var batch_type = 'permanent';
                  $scope.refId = (new Date())/1000|0; 
                  var reference_id = $scope.refId;
                  var sewadar_type = 'permanent';
                  var Insertquery;
                  var date = new Date($scope.startDate); 
                  var nominalAttendanceDate= $filter('date')(new Date(date.setDate(date.getDate() + (i))), 'yyyy-MM-dd');
                  Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id') VALUES ('"+nominalAttendanceDate+"','"+$scope.femaleIds[$scope.initialValueFemale]+"','"+$scope.nominalRollsData.sewa_id+"', '"+reference_id+"', '"+type+"', '"+batch_type+"','"+$scope.current+"','"+$scope.current+"', '"+sewadar_type+"','"+$scope.nominalRollsData.id+"')";
                  $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(res) {
                        if(i == 0) {                              
                              howManyTimeFemaleSewadarAdd(i+1, $scope.days);
                        }else{
                              howManyTimeFemaleSewadarAdd(i+1, $scope.days);
                        }
                  }, (err) => {                  
                  }); 
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
                  cfpLoadingBar.start(); 
                  $scope.nominalRollsData = nominalRollsService.getNominalRollsData();                  
                  var getmaleQuery = "select * from sewadars where sewadars.gender = 'M' AND sewadars.department_name = '"+$scope.nominalRollsData.jatha_name+"'";
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
                  var getfemaleQuery = "SELECT * FROM sewadars where gender='F' AND sewadars.department_name = '"+$scope.nominalRollsData.jatha_name+"'";
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

