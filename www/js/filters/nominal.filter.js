(function(){
     'use strict';

    var nominalFilter = function(){
        return function(nominal, type){
            if(!type) return;
            if( type && type =='isSelected' ) {
                var ids = [];
                nominal.map(function(val, key){

                  if(val.isSelected == true) {
                    
                    ids.push(val.id);
                  }
                }); 
                return ids;
            }
        } 
    };

    nominalFilter.$inject = [];

    angular
        .module('SCMS_ATTENDANCE')
        .filter("nominalFilter", nominalFilter);
})();

