(function() {
   
    'use strict';
    var nominalRollsService = function() { 
        var nominalRollsCompleteData = []; 	
    	var nominalRollsdata;
        var nominalRollsDateFilterData;
        var nominalRollsSewaData = [];

        this.setnominalRollsCompleteData = function(data) {
            nominalRollsCompleteData = data;
        };
        
        this.getnominalRollsCompleteData = function() {
            return nominalRollsCompleteData;           
        }; 

	    this.setNominalRollsData = function(data) {
	        nominalRollsdata = data;
    	};
	    this.getNominalRollsData = function() {
			return nominalRollsdata;	       
    	}; 

        this.setNominalRollsDateFilterData = function(data) {
            nominalRollsDateFilterData = data;
            };
        this.getNominalRollsDateFilterData = function() {
            return nominalRollsDateFilterData;           
        }; 

	};

    nominalRollsService.$inject  = [];

    angular
        .module('SCMS_ATTENDANCE')
        .service("nominalRollsService", nominalRollsService);
})();
