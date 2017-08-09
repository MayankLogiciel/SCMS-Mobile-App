(function() {
       'use strict';
      var setFocusDirective = function() {          
            return {
                  restrict: 'AE',
                  controller: ['$scope', '$element', '$attrs', function($scope,$element, $attrs) {
                        $element[0].focus();
                  }]
                        
            }
      }
      setFocusDirective.$inject = [];

      angular
      .module('SCMS_ATTENDANCE')
      .directive("setFocusDirective", setFocusDirective);
})();
