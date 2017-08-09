(function() {
       'use strict';
      /**
      * SatsangPlaceController
      **/
      var SatsangPlaceController = function($log, $scope, authService, $ionicHistory) {
            var setup = function() {
                  $log.debug("Satsang Place Information Controller");
                  $scope.info = authService.getSansangPlaceInfo();
                 
            }; 

            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.placeInfo = function(value) {                  
                  authService.setSansangPlaceInfo(value);
            };
            setup();
      };
      SatsangPlaceController.$inject  = ['$log', '$scope', 'authService', '$ionicHistory'];
      angular
      .module('SCMS_ATTENDANCE')
      .controller("SatsangPlaceController", SatsangPlaceController);
})();

