(function(){

     'use strict';
    /**
    *sewadarsListingDirective Directive
    **/
    var sewadarsListingDirective = function() { 
      return {
    		templateUrl: 'templates/sewadars.listing.html'
  		};
    }
    sewadarsListingDirective.$inject = [];

    angular
    .module('SCMS_ATTENDANCE')
    .directive("sewadarsListingDirective", sewadarsListingDirective);
})();