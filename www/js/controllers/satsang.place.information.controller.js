(function() {
       'use strict';
      /**
      * SatsangPlaceController
      **/
      var SatsangPlaceController = function($log, $scope, authService, $ionicHistory) {
            var setup = function() {
                  $log.debug("Satsang Place Information Controller");
                  $scope.info = authService.getSansangPlaceInfo();
                  if($scope.info == null) {
                        $scope.hideEdit = true;
                  }else {
                        $scope.hideEdit = false;
                  }
                  $scope.preServerUrl = 'http://';
                 
            }; 

            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.editInfo = function(){
                  $scope.hideEdit = true;
            }

            $scope.placeInfo = function(value) {                  
                  authService.setSansangPlaceInfo(value);
                  $scope.hideEdit = false;
            };
            setup();
      };
      SatsangPlaceController.$inject  = ['$log', '$scope', 'authService', '$ionicHistory'];
      angular
      .module('SCMS_ATTENDANCE')
      .controller("SatsangPlaceController", SatsangPlaceController);
})();

