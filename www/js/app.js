angular.module('SCMS_ATTENDANCE', ['ionic', 'ngCordova', 'validation', 'validation.rule', 'ionic-datepicker', 'angular-loading-bar', 'ngAnimate', 'dtrw.bcrypt', 'ion-floating-menu'])     
.run(function($ionicPlatform, $cordovaSQLite, $rootScope, $state, $ionicPopup, authService, $cordovaFile,  $timeout, $cordovaSplashscreen, cfpLoadingBar) {
      $ionicPlatform.ready(function() {
            $rootScope.isImageDirectoryNotFound = false;
            $rootScope.isDBNotFound = false;
            $rootScope.db;
            if(window.cordova && window.cordova.plugins.Keyboard) {      
                  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                  cordova.plugins.Keyboard.disableScroll(true);
            }
            if(window.StatusBar) {
                  StatusBar.styleDefault();
                  if(ionic.Platform.isIOS()){
                        $rootScope.baseAppDir = cordova.file.dataDirectory;
                  }else {
                        $rootScope.baseAppDir = cordova.file.externalApplicationStorageDirectory;
                  }
            }
            var hideSplashScreen = function (){
                  var user = authService.getLoggedInUserData();
                  if(!localStorage.SCMS_user) {
                        $state.go('login');
                  }else {
                        if(user.group_name== 'Secretary') {
                              $state.go('secretary-home');
                        }else {
                              $state.go('app');
                        }
                  }

                  $timeout(function() {
                        cfpLoadingBar.complete();
                        $cordovaSplashscreen.hide();
                  }, 100);
            };

            hideSplashScreen();


            var createFolder = function() {
                  $cordovaFile.createDir($rootScope.baseAppDir, "import", false)
                  .then(function (success) {
                        createFolderForPics();
                        checkDBAndCopy();
                  }, function (error) {
                        checkDBAndCopy();
                  });
            }


            var createFolderForPics = function() {
                  $cordovaFile.createDir($rootScope.baseAppDir + "import/", "sewadar_pics" , false)
                  .then(function (success) {                       
                  }, function (error) {                       
                       
                  });
            }

            createFolder();


            var checkDBAndCopy = function () {
                  var dataBasePath = $rootScope.baseAppDir + 'import/';
                  var dbName = 'database.sqlite';
                  var dataBaseFilePath = dataBasePath + dbName;
                  if(ionic.Platform.isIOS()){
                        $cordovaFile.checkFile(dataBasePath, dbName)
                        .then(function (success) {
                              window.plugins.sqlDB.copyDbFromStorage(dbName, 0, dataBaseFilePath, false, function(res) {
                                    $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'});                              
                               }, function(err) {
                                    $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'});
                              });
                        }, function(error) {
                              authService.setDatabaseNotFound('error');
                              $rootScope.databaseNotFoundPopup();
                              return true;
                        });      
                  }else {
                        window.plugins.sqlDB.checkDbOnStorage(dbName, dataBasePath, function(res) {
                              window.plugins.sqlDB.copyDbFromStorage(dbName, 0, dataBaseFilePath, false, function(res) {
                                    $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'});                              
                              }, function(err) {
                                    $rootScope.db = $cordovaSQLite.openDB({name: dbName, location: 'default'});
                              });
                        }, function(err){
                              if(err.code == 404) {
                                    authService.setDatabaseNotFound('error');
                                    $rootScope.databaseNotFoundPopup();                
                              }

                        });
                  }
            }

            $rootScope.databaseNotFoundPopup = function() {
                  $rootScope.dataBasePath = $rootScope.baseAppDir + 'import/';                  
                  $rootScope.data = {};              
                  var myPopup = $ionicPopup.show({
                        templateUrl: 'templates/popups/database.not.found.popup.html',
                        title: 'Database Not Found!',
                        scope: $rootScope,
                        cssClass: 'main-screen-popup',
                        buttons: [ { text: 'OK' }, ]
                  });
                  myPopup.then(function(res) {
                        myPopup.close();
                  });
            };

      });
})


.config(function (ionicDatePickerProvider) {
      var datePickerObj = {
            inputDate: new Date(),
            titleLabel: 'Select a Date',
            todayLabel: 'Today',
            closeLabel: 'Close',
            setLabel: 'Set',
            mondayFirst: false,
            weeksList: ["S", "M", "T", "W", "T", "F", "S"],
            monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
            templateType: 'popup',
            from: new Date(2012, 8, 1),
            //to: new Date(2018, 8, 1),
            showTodayButton: false,
            dateFormat: 'dd MMMM yyyy',
            closeOnSelect: true
            //disableWeekdays: []
      };
      ionicDatePickerProvider.configDatePicker(datePickerObj);
})

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeBar = false;
      cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
      //cfpLoadingBarProvider.includeSpinner = false;
      //cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Custom Loading Message...</div>';
}])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
      if(ionic.Platform.isIOS()){
            $ionicConfigProvider.views.swipeBackEnabled(false);
            $ionicConfigProvider.tabs.position("top"); 
      }
      $ionicConfigProvider.scrolling.jsScrolling(false);
      $stateProvider
      .state('login', {
            cache: false,
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
      })
      .state('import-database', {
            cache: false,
            url: '/import-database',
            templateUrl: 'templates/import.form.html',
            controller: 'ImportDatabaseAndPicController'
      })
      .state('satsang-attendance-list', {
            cache: false,            
            url: '/satsang-attendance-list',
            templateUrl: 'templates/satsang.attendance.list.html',
            controller: 'SatsangAttendanceListController'
      })
      .state('satsang-place', {
            url: '/satsang-place',
            templateUrl: 'templates/satsang.place.information.html',
            controller: 'SatsangPlaceController'
      })
      .state('secretary-home', {
            cache: false,            
            url: '/secretary-home/:action',
            templateUrl: 'templates/secretary_home.html',
            controller: 'SecretaryHomeController'
      })
      .state('app', {
            url: '/app',
            cache: false,
            templateUrl: 'templates/home.html',
            controller: 'AppController'
      })
      .state('satsang_day_attendance', {
            cache: false,
            url: '/satsang_day_attendance',
            templateUrl: 'templates/satsang_day_attendance.html',
            controller: 'SatsangDayAttendanceController'
      })
      .state('nominal_rolls', {
            cache: false,
            url: '/nominal_rolls',
            templateUrl: 'templates/nominal.rolls.html',
            controller: 'NominalRollsController'
      })
      .state('addedit-nominal_rolls', {
            cache: true,
            url: "/nominal_rolls/:action?:id/:user",
            templateUrl: 'templates/nominal.rolls.add_edit.html',
            controller: 'NominalRollsAddEditController' 
      }) 
      .state('nominal_rolls-list', {
            cache: false,
            url: "/nominal_rolls-list/:id/:status",
            templateUrl: 'templates/nominal.sewadar.attendance.list.html',
            controller: 'NominalRollsSewadarAttendanceController' 
      })   

      .state('jatha-members', {
            url: "/jatha-members",
            cache: false,
            templateUrl: 'templates/jatha.members.tabs.html',
            controller: 'JathaMembersController'
                       
      })    

      .state('sewadars', {
            url: "/sewadars",
            cache: true,
            templateUrl: 'templates/sewadars.html',
            controller: 'SewadarsController'
                       
      })     

      .state('sync-database-or-pics', {
            url: "/sync-database-or-pics",
            cache: false,
            templateUrl: 'templates/sync.db.pics.html',
            controller: 'SyncDBPicsController'
                       
      })   
});
