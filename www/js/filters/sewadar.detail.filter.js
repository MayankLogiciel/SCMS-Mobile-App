(function(){
     'use strict';

    var sewadarDetailFilter = function($filter){
    	var age = '---';
    	return function(sewadar){
        	var sewadarData = []; 
            if(angular.isDefined(sewadar) && angular.isDefined(sewadar.dob)){
            	var ageDifMs = Date.now() - new Date(sewadar.dob);
            	var ageDate = new Date(ageDifMs);
            	return Math.abs(ageDate.getUTCFullYear() - 1970);
        	}else {
        		return age;
        	};
        };
    };
    sewadarDetailFilter.$inject = ['$filter'];

    angular
        .module('SCMS_ATTENDANCE')
        .filter('sewadarDetailFilter', sewadarDetailFilter);
})();