(function(){

     'use strict';
    /**
    *nameOrBadgeButtonDirective Directive
    **/
    var nameOrBadgeButtonDirective = function($ionicPopover) { 
      return {
      restrict: 'E',
      scope: {},
      template: '<span class="button ion-arrow-swap" on-tap="nameOrBadgeButtonDirective.show($event)"></span>',
      link: function(scope, element, attrs) {
        $ionicPopover.fromTemplateUrl('templates/popovers/nameorbadgebutton.popover.html', {
            scope: scope,
        }).then(function(popover) {
          scope.nameOrBadgeButtonDirective = popover;  
        });      
      }
    }
    }
    nameOrBadgeButtonDirective.$inject = ['$ionicPopover'];

    angular
    .module('SCMS_ATTENDANCE')
    .directive("nameOrBadgeButtonDirective", nameOrBadgeButtonDirective);
})();

