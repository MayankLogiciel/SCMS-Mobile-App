(function(){

    'use strict';
   /**
   actionEnter used for perform action after enter key pressed
   **/
    var actionEnter = function() {          
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.actionEnter, {
                            'event': event
                        });
                    });
                    event.preventDefault();         
                }
            });
        };
    }
    actionEnter.$inject = [];

    angular
    .module('SCMS_ATTENDANCE')
    .directive("actionEnter", actionEnter);
})();
