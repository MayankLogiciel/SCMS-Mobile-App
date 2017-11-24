angular
	.module('SCMS_ATTENDANCE')
	.factory('requestIntercepter', function($log, $q){


		return{
            responseError: function(rejection) {
                console.log(rejection);
                //var InterceptorFactory = $injector.get('InterceptorFactory');
                switch(rejection.status){
                    case 500:
                        console.log("hello");
                        break;
                    case 400: 
                        console.log("hello");                               
                        break;
                    case 404: 
                        console.log("hello");                              
                        break; 
                    case 401:  
                        console.log("hello");                             
                        break;
                    case -1:  
                        console.log("hello");                             
                        break; 
                }//end of switch
                return $q.reject(rejection);
            } 
        };
	})
    .config(function($httpProvider) {
        //$httpProvider.defaults.headers['hello'] = 'work';
        $httpProvider.interceptors.push('requestIntercepter');
    });