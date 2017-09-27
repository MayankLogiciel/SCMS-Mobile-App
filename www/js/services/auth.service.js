(function() {
   
    'use strict';
    var authService = function() {  	
    	var DBErr;
    	var db;
	    this.setLoggedInUserData = function(user) {
	        if(user && angular.isDefined(user)) {
	            localStorage.SCMS_user = angular.toJson(user, true);
	        }
    	};
	    this.getLoggedInUserData = function() {
	        if(localStorage.SCMS_user){
	            return angular.fromJson(localStorage.SCMS_user);
	        }else {
	            return null;
	        }
    	}; 

    	this.setSansangPlaceInfo= function(place) {
	        if(place && angular.isDefined(place)) {
	            localStorage.SCMS_SatsangPlace = angular.toJson(place, true);
	        }
    	};
	    this.getSansangPlaceInfo = function() {
	        if(localStorage.SCMS_SatsangPlace){
	            return angular.fromJson(localStorage.SCMS_SatsangPlace);
	        }else {
	            return null;
	        }
    	}; 

    	this.setAppVisitedCount = function() {
            var appVisitedCount = JSON.parse(localStorage.scms_appVisitedCounter || 0);
            appVisitedCount++;
            localStorage.scms_appVisitedCounter = appVisitedCount;
        }

        this.getAppVisitedCount =  function(){
            return localStorage.scms_appVisitedCounter;
        }

    	this.setDatabaseNotFound= function(err) {
	        DBErr = err;
    	};
	    this.getDatabaseNotFound = function() {
	        return DBErr;
    	}; 

    	this.setToken = function(token) {
    		if(token && angular.isDefined(token)) {
	            localStorage.SCMS_token = angular.toJson(token, true);
	        }
    	}
    	this.getToken = function() {
	        if(localStorage.SCMS_token){
	            return angular.fromJson(localStorage.SCMS_token);
	        }else {
	            return null;
	        }
    	}; 
    	this.setDB = function(data) {
    		db = data;
    	}
    	this.getDB = function() {
	        return db;
    	}; 

	};

    authService.$inject  = [];

    angular
        .module('SCMS_ATTENDANCE')
        .service("authService", authService);
})();
