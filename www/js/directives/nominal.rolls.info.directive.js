angular.module('SCMS_ATTENDANCE')
.directive('nominalRollsInfoDirective', function(nominalRollsService, $log, $ionicModal, $state, $cordovaSQLite, $rootScope, $timeout){
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
                $scope.modal.hide();
            };   


            var getFemaleIncharge = function() {
                if(
                    (($scope.nominalRolesData.incharge_id == 'null') ||
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