(function(){

    'use strict';

    var picAndDatabaseTransferService = function($q, $http) {        
        var server_url;
        //Upload pic to server
        this.uploadPicture = function(data){
            var _defer  = $q.defer();
            $http({
                method: 'post',
                url: SCMS_SERVER_URL + 'sewadar/image-update/photo/' + data.id,
                data: data,
                timeout: _defer.promise
            }).then(function(response){
                _defer.resolve(response);
            },function(err) {
                _defer.reject(err);

            });
            return _defer.promise;   
        }; 

        this.getTokenFromServer = function(email, password, config, serverUrl) {
            var _defer  = $q.defer();
            $http({
                method: 'post',
                url: serverUrl + '/api/login/user',
                data: {email: email, password: password, configuration: config},
                ignoreLoadingBar: true,
                timeout: _defer.promise
            }).then(function(response){
                _defer.resolve(response);
            },function(err) {
                _defer.reject(err);

            });
            return _defer.promise; 
        } 


        this.setDataToUpload = function(data) {
            if(data && angular.isDefined(data)) {
                localStorage.SCMS_data_to_upload = angular.toJson(data, true);
            }
        };
        this.getDataToUpload = function() {
            if(localStorage.SCMS_data_to_upload){
                return angular.fromJson(localStorage.SCMS_data_to_upload);
            }else {
                return null;
            }
        }; 


        this.setLastImagesDownloadedTime = function(date) {
            if(date && angular.isDefined(date)) {
                localStorage.SCMS_DownloadedDateTime = angular.toJson(date, true);
            }
        };
        this.getLastImagesDownloadedTime = function() {
            if(localStorage.SCMS_DownloadedDateTime){
                return angular.fromJson(localStorage.SCMS_DownloadedDateTime);
            }else {
                return null;
            }
        }; 
        
        this.resetSync = function (data) {
            var _defer = $q.defer();
            $http({
                method: 'get',
                url: data.url,
                headers: data.headers,
                timeout: _defer.promise
            }).then(function (response) {
                _defer.resolve(response);
            }, function (err) {
                _defer.reject(err);
            });
            return _defer.promise;
        }; 
    };

    picAndDatabaseTransferService.$inject  = ['$q', '$http'];

    angular
        .module('SCMS_ATTENDANCE')
        .service("picAndDatabaseTransferService", picAndDatabaseTransferService);
})();
