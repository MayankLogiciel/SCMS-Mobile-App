(function() {
   
    'use strict';
    var satsangDayAttendanceListService = function() { 
        var satsangAttendanceDate; 	
    	
        this.setSatsangAttendanceDate = function(date) {
            satsangAttendanceDate = date;
        };
        
        this.getSatsangAttendanceDate = function() {
            return satsangAttendanceDate;           
        }; 

	    
	};

    satsangDayAttendanceListService.$inject  = [];

    angular
        .module('SCMS_ATTENDANCE')
        .service("satsangDayAttendanceListService", satsangDayAttendanceListService);
})();
