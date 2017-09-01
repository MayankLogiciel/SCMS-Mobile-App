angular.module('SCMS_ATTENDANCE')
.directive('nominalRollsInfoDirective', function(nominalRollsService, $log, $ionicModal, $state, $cordovaSQLite, $rootScope){
    return {
        restrict: "A",
        scope: {
            nominalRolesData : '=', 
            onDone : '&onDone',
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

            elem.on('tap', showInfoModal);
            $scope.$on('$destroy',function(){
                elem.off();
            });
        }

    };
})