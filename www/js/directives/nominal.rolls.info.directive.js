angular.module('SCMS_ATTENDANCE')
    .directive('nominalRollsInfoDirective', function (nominalRollsService, $log, $ionicModal, $state, $cordovaSQLite, $rootScope, $timeout, $ionicPopup){
    return {
        restrict: "A",
        scope: {
            nominalRolesData : '=', 
            onDone : '&onDone',
            isSecrectary : "="
        },
        link: function($scope, elem, attrs) {
            
            var showInfoModal = function() {
                $ionicModal.fromTemplateUrl('templates/modals/nominal.info.modal.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    backdropClickToClose: false
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            }; 

            $scope.closeModalForNominalDetail = function() {
                $timeout(function () {
                    $scope.modal.hide();
                    angular.element(document.body).removeClass('modal-open');
                }, 0);
            };   

            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });


            var getFemaleIncharge = function() {
                if(
                    (($scope.nominalRolesData.incharge_id == 'null') ||
                    ($scope.nominalRolesData.incharge_id == 0) ||
                    ($scope.nominalRolesData.incharge_id == null)) &&  
                    (($scope.nominalRolesData.incharge_female_type != null ||
                    $scope.nominalRolesData.incharge_female_type != 'null'))
                ) {
                        $scope.isFemale = false;
                }else {

                        $scope.isFemale = true;    
                }
                
                if(!angular.isDefined($scope.nominalRolesData.incharge_female_type) || 
                    $scope.nominalRolesData.incharge_female_type == '' ||
                    $scope.nominalRolesData.incharge_female_type == null ||
                    $scope.nominalRolesData.incharge_female_type == 'null') {
                    $scope.nominalRolesData.femaleInchangeName = 'N/A';
                }else {
                    if($scope.nominalRolesData.incharge_female_type == 't') {
                        var query = "select name from temp_sewadars where id =" +  $scope.nominalRolesData.incharge_female_id;
                    } else {
                        var query = "select name from sewadars where id =" +  $scope.nominalRolesData.incharge_female_id;
                    }
                    $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        for(var i= 0; i<res.rows.length; i++) { 
                            $scope.nominalRolesData.femaleInchangeName = res.rows.item(i).name;  
                        }  
                    });
                }
                showInfoModal();
            }
            $scope.viewAndMarkAttendanceNominal = function(nominal) {
                nominalRollsService.setNominalRollsData(nominal);
                $state.go('nominal_rolls-list', {id:  nominal.id, status:  nominal.status});
                $scope.closeModalForNominalDetail();
            };  


            $scope.dispatchNominalRole = function(nominal) {
                var msgDispatched = "After dispached you will not able to add more sewadars or modify this nominal roll. Confirm to Proceed. ";
                showConfirm(msgDispatched, nominal);
            };  

            var showConfirm = function (str, nominal) {
                $ionicPopup.confirm({
                    title: 'Please Confirm',
                    template: str,
                    cssClass: 'confirm-delete',
                    buttons: [
                        {
                            text: "Cancel",
                            type: 'button-balanced',
                            onTap: function () {
                            }
                        },
                        {
                            text: 'OK',
                            type: 'button-positive',
                            onTap: function () {
                                markAsDispatched(nominal);
                            }
                        }]
                });
            };

            var markAsDispatched = function (nominal) {
                nominal.status = 'dispatched';
                var query = "UPDATE nominal_roles SET status = 'dispatched' WHERE id =" + nominal.id;
                $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
                    nominalRollsService.setNominalRollsData(nominal);
                    $scope.closeModalForNominalDetail();
                }, function (err) {
                });
            }


            $scope.editNominal = function(nominal) {
                nominalRollsService.setNominalRollsData(nominal);
                if($scope.isSecrectary == true) {
                    $state.go('addedit-nominal_rolls', {action: 'edit',id: nominal.id, user: 'secretary'});
                }else {
                    $state.go('addedit-nominal_rolls', {action: 'edit',id: nominal.id, user: ''});
                }
                $scope.closeModalForNominalDetail();
            } 

            elem.on('tap', getFemaleIncharge);
            $scope.$on('$destroy',function(){
                elem.off();
            });
        }

    };
})