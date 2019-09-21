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
                  $state.go('import-database');
            }
           
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
                                                if (result && userType == 'Secretary') {
                                                      $cordovaToast.show('Logged in successfully', 'short', 'center');
                                                      $state.go("secretary-home");
                                                      saveUserToLocalStoarge(userData);
                                                      return; 
                                                }

                                                if(result) {
                                                      $cordovaToast.show('Logged in successfully', 'short', 'center');
                                                      $state.go("app");
                                                      saveUserToLocalStoarge(userData, loginData.password);
                                                      return;
                                                }

                                                $cordovaToast.show('Invalid password', 'short', 'center');
                                               
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