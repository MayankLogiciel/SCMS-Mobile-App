angular
	.module('SCMS_ATTENDANCE')
	.factory('requestIntercepter', function($log, $q, $cordovaToast, $injector){
        var message = {
            wrongUrl: "Please enter valid server URL",
            wrongRoute: "404: Please check your server URL",
            serverErrorMessage: "500: Whoops, looks like something went wrong",
            underProcessMessage: "Sync is already running on another device"
        }
        return{
            responseError: function(rejection) {
                console.log(rejection)
                rejection.status = (angular.isDefined(rejection.status))? rejection.status: rejection.http_status;
                var $state = $injector.get('$state');
                switch(rejection.status){
                    case 500:
                        $cordovaToast.show(message.serverErrorMessage, 'short', 'center'); 
                        break;
                    case 400: 
                        localStorage.removeItem("SCMS_token");                            
                        break;
                    case 422: 
                         $cordovaToast.show(message.underProcessMessage, 'short', 'center');                           
                        break;
                    case 429: 
                         $cordovaToast.show('Sync after sometime', 'short', 'center');                           
                        break;
                    case 404: 
                        if(rejection.statusText == 'Not Found') {
                            $cordovaToast.show(message.wrongRoute, 'short', 'center'); 
                        }
                        if(rejection.data.message) {
                            $cordovaToast.show(rejection.data.message, 'short', 'center'); 
                        }
                        break; 
                    case 401:  
                        if($state.current.name == "import-database") {
                            $cordovaToast.show(rejection.data.message, 'short', 'center'); 
                        }
                        localStorage.removeItem("SCMS_token"); 
                        break;
                    case 412:
                        if(angular.isDefined(rejection.data)) {
                            if(!angular.isObject(rejection.data.message)) {
                                $cordovaToast.show(rejection.data.message, 'short', 'center');
                            }else {
                                $cordovaToast.show(rejection.data.message[Object.keys(rejection.data.message)[0]][0], 'short', 'center');
                            }
                        }
                        break;
                    case -1: 
                        $cordovaToast.show(message.wrongUrl, 'short', 'center'); 
                        break;
                    default:
                        $cordovaToast.show(rejection.body || message.serverErrorMessage, 'short', 'center');
                }//end of switch
                return $q.reject(rejection);
            } 
        };
	})
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('requestIntercepter');
    });