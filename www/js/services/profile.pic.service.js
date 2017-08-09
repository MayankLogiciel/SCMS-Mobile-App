(function() {
   
    'use strict';
    var profilePicService = function() {  	
    	var timeOfPic = ''
    	this.setTimeOfPic= function(time) {
	        timeOfPic = time;
    	};
	    this.getTimeOfPic = function(time) {
	        return timeOfPic;
    	}; 
	};

    profilePicService.$inject  = [];

    angular
        .module('SCMS_ATTENDANCE')
        .service("profilePicService", profilePicService);
})();
