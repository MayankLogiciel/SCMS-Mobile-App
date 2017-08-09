(function(){

     'use strict';
    /**
    *jathaMembersDirective Directive
    **/
    var jathaMembersDirective = function() { 
      return {
    		templateUrl: 'templates/jatha.members.listing.html'
  		};
    }
    jathaMembersDirective.$inject = [];

    angular
    .module('SCMS_ATTENDANCE')
    .directive("jathaMembersDirective", jathaMembersDirective);
})();