(function(){

       'use strict';
   	/**
   	* Login Controller
   	**/
      var LoginController = function($log, $scope, $cordovaSQLite, $state, authService, $cordovaToast, $ionicPopup, bcrypt, cfpLoadingBar, $rootScope, $timeout, $ionicHistory) {  

            var setup = function() {
                  $log.debug("Login Controller");                  
                  $scope.loginData = { username: '', password: ''};    
                  if($state.current.name == "login") {
                        $timeout(function(){
                              $ionicHistory.clearCache();
                              $ionicHistory.clearHistory();
                        },500);
                  }               
            };

            $scope.importDatabase = function() {
                  $scope.DBErr = authService.getDatabaseNotFound();                 
                  if($scope.DBErr != 'error') {
                        getPicturesCount();
                        getNominalCount();
                        getSatsangAttendanceCount();
                        checkCount();
                  }else {
                        $state.go('import-database');
                  }
                  
            } 

            var checkCount = function() {
                  $timeout(function() {                        
                        if($scope.attendanceCount > 0 || $scope.nominalCount > 0 || $scope.picturesCount > 0){
                              showImportConfirm();
                        }else {
                              $state.go('import-database');
                        }
                  }, 500);
            }

            var getPicturesCount = function() {
                  var query = "SELECT COUNT(id) as count FROM sewadars WHERE sewadars.photo_update_status = 1";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.picturesCount = res.rows.item(i).count;                                                          
                        }                              
                  });
            }

            var getNominalCount = function() {
                  var query = "SELECT COUNT(id) as count FROM nominal_roles";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.nominalCount = res.rows.item(i).count;
                        }                              
                  });
            }

            var getSatsangAttendanceCount = function() {
                  var query = "SELECT COUNT(id) as count FROM attendances";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                              $scope.attendanceCount = res.rows.item(i).count;
                        }                              
                  });
            }

            var showImportConfirm = function() {
                  var myPopup = $ionicPopup.show({
                        scope: $scope,
                        templateUrl: 'templates/popups/confirm.before.import.html',
                        title: 'Unsynced Changes!',
                        cssClass: 'confirm-import',
                        buttons:[    
                        {
                              text: "Cancel",
                              type: 'button-balanced',
                              onTap: function(){
                                    return;
                              }
                        },
                        {
                              text: "Continue",
                              type: 'button-positive',
                              onTap: function(){
                                    $state.go('import-database');      
                              }
                        }]
                  });       
            };      
            

            $scope.login = function(loginData) {                  
                  $scope.DBErr = authService.getDatabaseNotFound();
                  if($scope.DBErr == 'error') {
                        $scope.databaseNotFoundPopup();
                        return;      
                  } else {                        
                        var chackEmail = "SELECT * FROM users where email = '"+loginData.username+"'";
                        $cordovaSQLite.execute($rootScope.db, chackEmail).then(function(res) { 
                              if(res.rows.length > 0) { 
                                    cfpLoadingBar.start();
                                    for(var i= 0; i<res.rows.length; i++) {
                                          var userData= res.rows.item(i);
                                          var userType = res.rows.item(i).group_name;
                                          bcrypt.compare(loginData.password, res.rows.item(i).password, function(err, result) {
                                                if(result && userType=='User') {
                                                      $cordovaToast.show('Logged in successfully', 'short', 'center');
                                                      $state.go("app");
                                                      saveUserToLocalStoarge(userData,loginData.password);
                                                } else if(result && userType=='Secretary') {
                                                      $cordovaToast.show('Logged in successfully', 'short', 'center');
                                                      $state.go("secretary-home");
                                                      saveUserToLocalStoarge(userData);
                                                }else {
                                                      $cordovaToast.show('Invalid password', 'short', 'center');
                                                }
                                          });
                                    }
                                    cfpLoadingBar.complete();
                              } else {
                                   $cordovaToast.show('Invalid email', 'short', 'center'); 
                              }
                        }, function(err) {

                        });                  
                  }
            };



            var saveUserToLocalStoarge = function (data,pass) {
                  data.userPassword = pass;
                  authService.setLoggedInUserData(data);
            }
            $scope.databaseNotFoundPopup = function() {
                  $scope.dataBasePath = $rootScope.baseAppDir + 'import/';                  
                  $scope.data = {};              
                  var myPopup = $ionicPopup.show({
                        templateUrl: 'templates/popups/database.not.found.popup.html',
                        title: 'Database Not Found!',
                        cssClass: 'main-screen-popup',
                        scope: $scope,
                        buttons: [ { text: 'OK' }, ]
                  });
                  myPopup.then(function(res) {
                        myPopup.close();
                  });
            };         

      setup();
};

LoginController.$inject  = ['$log', '$scope', '$cordovaSQLite', '$state', 'authService', '$cordovaToast', '$ionicPopup', 'bcrypt', 'cfpLoadingBar', '$rootScope', '$timeout', '$ionicHistory'];

angular
.module('SCMS_ATTENDANCE')
.controller("LoginController", LoginController);
})();