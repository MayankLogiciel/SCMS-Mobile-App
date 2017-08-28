// Created by anuj singh on 27-06-17
angular.module('SCMS_ATTENDANCE')
.directive('scanQrDirective', function($cordovaSQLite,$rootScope,$cordovaFile, $cordovaToast, $log){
    return {
        restrict: "A",
        scope: {
            onUpdate : '&onUpdate',
            showScanner : '=showScanner'
        },
        link: function($scope, elem, attrs) {
            // Scans QR code
            $scope.scanQRCode = function() {
                if(cordova && cordova.plugins && cordova.plugins.barcodeScanner) {
                    cordova.plugins.barcodeScanner.scan(
                        function (result) {
                            if (result.text != "") {
                                processQRCode(result);
                            }
                        },
                        function (error) {
                            $cordovaToast.show('Scanning failed Please try again', 'short', 'center');
                        },
                        {
                            preferFrontCamera : false, // iOS and Android
                            showFlipCameraButton : true, // iOS and Android
                            showTorchButton : false, // iOS and Android
                            torchOn: false, // Android, launch with the torch switched on (if available)
                            prompt : "Place a barcode inside the scan area", // Android
                            resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                            formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                            disableAnimations : true, // iOS
                            disableSuccessBeep: false // iOS
                        });
                    }
                };
                // Process the QR code after scanning
                var processQRCode = function(scanResult) {
                    if (!angular.isDefined(scanResult) || 
                        !angular.isDefined(scanResult.text) || 
                        !angular.isObject(angular.fromJson(scanResult.text)) ||
                        !angular.isDefined(angular.fromJson(scanResult.text).batch_no)) {
                        $cordovaToast.show('Not a valid QR Code', 'short', 'center');
                    return;
                }
                if (parseInt(angular.fromJson(scanResult.text).batch_no) > 0) {
                    markAttendenceOfSewadar(parseInt(angular.fromJson(scanResult.text).batch_no));
                }
            }

            // Mark attendence of sewadar
            var markAttendenceOfSewadar = function(batch_no) {
                var imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/'; 
                var query = "select * from sewadars INDEXED BY batch_index where batch_no = '"+ batch_no +"'";
                $cordovaSQLite.execute($rootScope.db, query).then(function(res) { 
                    if(res.rows.length > 0) {
                        // checks whether user image exist or not
                        $cordovaFile.checkFile(imagePath, res.rows.item(0).photo)
                        .then(function (success) {
                            res.rows.item(0).isImageFound = true;
                        }, function (error) {
                            res.rows.item(0).isImageFound = false;
                        });
                        // update rows in attendence table
                        $scope.onUpdate({sewadar: res.rows.item(0)});
                    }else {
                        $cordovaToast.show('No result found', 'short', 'center');
                        $scope.scanQRCode();
                    } 
                }, function (err) {
                    $log.debug("err", err);
                });
            }

            elem.on('click', $scope.scanQRCode);
            $scope.$on('$destroy',function(){
                $log.debug('****************destroyed qr code directive*******************');
                elem.off();
            });
            $scope.showScanner.scanQRCode = $scope.scanQRCode; 
        }

    };
})