(function() {
   
    'use strict';
    var satsangDayAttendanceService = function() { 
        this.setAttendaceClosedForDay = function(data) {
            if(data && angular.isDefined(data)) {
                localStorage.SCMS_AttendaceClosedForDay = angular.toJson(data, true);
            }
        };
        this.getAttendaceClosedForDay = function() {
            if(localStorage.SCMS_AttendaceClosedForDay){
                return angular.fromJson(localStorage.SCMS_AttendaceClosedForDay);
            }else {
                return null;
            }
        }; 	    
	};

    satsangDayAttendanceService.$inject  = [];

    angular
        .module('SCMS_ATTENDANCE')
        .service("satsangDayAttendanceService", satsangDayAttendanceService);
})();
