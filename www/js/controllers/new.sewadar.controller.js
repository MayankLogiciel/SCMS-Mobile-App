(function () {
    'use strict';
    /**
    * NewSewadarController
    **/
    var NewSewadarController = function ($log, $scope, $rootScope, $ionicHistory, $state, $cordovaSQLite, $filter, $timeout, $cordovaFile, $cordovaToast, cfpLoadingBar, $stateParams) {

        $scope.imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/';
        $scope.imageCachePath = cordova.file.externalCacheDirectory;
        $scope.defaultImage = 'img/imgUnavailable.png';
        $scope.searchSewadar = [];
        $scope.isImageNotAvailable = false;
        $scope.isImageInCache = false;

        var sewadarLimit = 5;
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var initCreateSewadar = function() {

            $scope.skillDetailBlock = false;
            $scope.vehicleDetailBlock = false;
            $scope.namdaanDetailBlock = false;
            $scope.otherDetailBlock = false;
            $scope.referenceDetailBlock = false;
            $scope.personalDetailBlock = true;
            
            $scope.vehicles = [];
            $scope.areaList = [];
            $scope.occupationList = [];
            $scope.skillList = [];
            $scope.departmentList = [];
            $scope.designationList = [];
            
            $scope.sewadar = {
                gender: 'M',
                is_namdaan: 'Y',
                batch_type: 'T',
                batch_status: 'active',
                holds_badge_at: 'Y',
                can_donate: 'Y'
            }

            getVehicleList();
            getAreaList();
            getOccupationList();
            getSkillList();
            getDepartmentList();
            getDesignationList();

            if ($stateParams.action == 'edit') {
                $timeout(function(){
                    setUserDataForEdit($stateParams.sewadar);
                },500)
            }
            
        }

        var checkPhotoAvailable = function(photo) {
            $cordovaFile.checkFile(($scope.isImageInCache ? $scope.imageCachePath : $scope.imagePath), photo).then(function (success) { 
                $scope.isImageNotAvailable = false;
            },function(err) {
                $scope.isImageNotAvailable = true;
            });
        }
        
        var setUserDataForEdit = function(sewadar) {
            console.log($stateParams);

            $scope.sewadar.photo = sewadar.photo ? sewadar.photo : '';
            checkPhotoAvailable($scope.sewadar.photo);

            $scope.sewadar.name = sewadar.name ? sewadar.name : '';
            $scope.sewadar.gender = sewadar.gender ? sewadar.gender : 'M';
            $scope.sewadar.guardian = sewadar.guardian ? sewadar.guardian : '';
            $scope.sewadar.age = sewadar.age ? sewadar.age : '';
            $scope.sewadar.dob = sewadar.dob ? new Date(sewadar.dob + 'T00:00:00.000Z') : '';
            $scope.sewadar.marital_status = sewadar.marital_status ? sewadar.marital_status : '';
            $scope.sewadar.address = sewadar.address ? sewadar.address : '';
            $scope.sewadar.pin_code = sewadar.pin_code ? sewadar.pin_code : '';
            $scope.sewadar.qualification = sewadar.qualification ? sewadar.qualification : '';
            $scope.sewadar.holds_badge_at = sewadar.holds_badge_at ? sewadar.holds_badge_at : '';
            $scope.sewadar.blood_group = sewadar.blood_group ? sewadar.blood_group : '';
            $scope.sewadar.can_donate = sewadar.can_donate ? sewadar.can_donate : '';
            $scope.sewadar.occupation_id = sewadar.occupation_id ? sewadar.occupation_id : '';
            $scope.sewadar.occupation_details = sewadar.occupation_details ? sewadar.occupation_details : '';
            
            angular.forEach($scope.areaList, function(val) {
                if (val.id == sewadar.area_id) {
                    $scope.sewadar.area = val;
                    break;
                }
            })
            
            // $scope.sewadar.land_line = sewadar. ? sewadar. : '';
            // $scope.sewadar.mobile_number = sewadar. ? sewadar. : '';
            
            $scope.sewadar.is_namdaan = sewadar.is_namdaan ? sewadar.is_namdaan : '';
            $scope.sewadar.date_of_namdaan = sewadar.date_of_namdaan ? new Date(sewadar.date_of_namdaan + 'T00:00:00.000Z') : '';
            $scope.sewadar.place_of_namdaan = sewadar.place_of_namdaan ? sewadar.place_of_namdaan : '';
            
            setReferedBy($scope.sewadar.refered_by);
            
            $scope.sewadar.batch_no = sewadar.batch_no ? sewadar.batch_no : '';
            $scope.sewadar.batch_status = sewadar.batch_status ? sewadar.batch_status : '';
            $scope.sewadar.batch_type = sewadar.batch_type ? sewadar.batch_type : '';
            
            angular.forEach($scope.departmentList, function(val) {
                if (val.id == sewadar.department_id) {
                    $scope.sewadar.department = val;
                    break;
                }
            })

            angular.forEach($scope.designationList, function(val) {
                if (val.id == sewadar.designation_id) {
                    $scope.sewadar.designation = val;
                    break;
                }
            })

            console.log($scope.occupationList);
            console.log($scope.areaList);
            console.log($scope.departmentList);
            console.log($scope.designationList);
            console.log($scope.sewadar);
        }

        var setReferedBy = function (referedBy) {
            // TODO
            var query = "select * from sewadars WHERE id='"+referedBy+"' LIMIT 1";
            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                if(res.rows.length) {
                    var selectedSewadar = res.rows.item(0);
                    $scope.sewadar.ref_sewadar_name = selectedSewadar.name;
                    $scope.sewadar.ref_badge_number = selectedSewadar.batch_no;
                    $scope.sewadar.ref_department = selectedSewadar.department_name;
                    $scope.sewadar.refered_by = selectedSewadar.id;
                }
            });
                
        }

        var getVehicleList = function() {
            var query = "SELECT name as vehicle_name, id as vehicle_id FROM vehicles ORDER BY vehicle_name ASC";
            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                if(res.rows.length) {
                        for(var i= 0; i<res.rows.length; i++) { 
                            $scope.vehicles.push(res.rows.item(i));                                   
                        }
                }
            });
        }
        
        var getAreaList = function() {
            var query = "SELECT name as area_name, id as area_id FROM areas";
            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                if(res.rows.length) {
                        for(var i= 0; i<res.rows.length; i++) { 
                            $scope.areaList.push(res.rows.item(i));                                   
                        }
                }
            });
        }
        
        var getOccupationList = function() {
            var query = "SELECT name as occupation_name, id as occupation_id FROM occupations";
            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                if(res.rows.length) {
                        for(var i= 0; i<res.rows.length; i++) { 
                            $scope.occupationList.push(res.rows.item(i));                                   
                        }
                }
            });
        }
        
        var getSkillList = function() {
            var query = "SELECT name as skill_name, id as skill_id FROM skills";
            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                if(res.rows.length) {
                        for(var i= 0; i<res.rows.length; i++) { 
                            $scope.skillList.push(res.rows.item(i));                                   
                        }
                }
            });
        }
        
        var getDepartmentList = function() {
            var query = "SELECT name as department_name, id as department_id FROM departments";
            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                if(res.rows.length) {
                        for(var i= 0; i<res.rows.length; i++) { 
                            $scope.departmentList.push(res.rows.item(i));                                   
                        }
                }
            });
        }
        
        var getDesignationList = function() {
            var query = "SELECT name as designation_name, id as designation_id FROM designations";//designations
            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                if(res.rows.length) {
                        for(var i= 0; i<res.rows.length; i++) { 
                            $scope.designationList.push(res.rows.item(i));                                   
                        }
                }
            });
        }

        $scope.toggleBlock = function(block) {
            console.log(block)
            $timeout(function(){
                switch (block) {
                    case 1:
                        $scope.personalDetailBlock = !$scope.personalDetailBlock;
                        break;
                    case 2:
                        $scope.namdaanDetailBlock = !$scope.namdaanDetailBlock;
                        break;
                    case 3:
                        $scope.referenceDetailBlock = !$scope.referenceDetailBlock;
                        break;
                    case 4:
                        $scope.skillDetailBlock = !$scope.skillDetailBlock;
                        break;
                    case 5:
                        $scope.vehicleDetailBlock = !$scope.vehicleDetailBlock;
                        break;
                    case 6:
                        $scope.otherDetailBlock = !$scope.otherDetailBlock;
                        break;
                }
			},200)
        }

        var getSelectedSkills = function() {
            var selectedIds = [];
            for (let index = 0; index < $scope.skillList.length; index++) {
                if($scope.skillList[index].skill_selected == true) {
                    selectedIds.push($scope.skillList[index].skill_id)
                }
            }
            return selectedIds;
        }

        var getSelectedVehicles = function() {
            var selectedIds = [];
            for (let index = 0; index < $scope.vehicles.length; index++) {
                if($scope.vehicles[index].vehicle_selected == true) {
                    selectedIds.push($scope.vehicles[index].vehicle_id)
                }
            }
            return selectedIds;
        }
        
        var setVendor = function() {
            return JSON.stringify({
                sewadars_mobile_number: [($scope.sewadar.mobile_number ? $scope.sewadar.mobile_number : '')],
                sewadars_land_line_number: [($scope.sewadar.land_line ? $scope.sewadar.land_line : '')],
                sewadars_skills: getSelectedSkills(),
                sewadars_vehicle_ids: getSelectedVehicles()
            })
        }
        
        $scope.saveSewadar = function () {
            console.log($scope.sewadar);
            console.log($scope.vehicles);
            if ($stateParams.action == 'edit') {
                console.log($scope.sewadar);
            } else {

                if ($scope.sewadar.photo && $scope.sewadar.photo != null && $scope.sewadar.photo != '' ) {
    
                    var query = "SELECT * FROM sewadars WHERE batch_no = '" + $scope.sewadar.batch_no + "'";
                    $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        console.log(res);
                        if(res.rows.length > 0) {
                            $cordovaToast.show('Badge Number already exist', 'short', 'center');
                            return;
                        } else { //if batch no not match
    
                            var searchId = "SELECT id FROM sewadars ORDER BY id DESC LIMIT 1";
                            $cordovaSQLite.execute($rootScope.db, searchId).then(function(res) {
                                var sewadar_id;
                                if(res.rows.length) {
                                    sewadar_id = res.rows.item(0).id + 1; 
                                } else {
                                    sewadar_id = 1;
                                }
    
                                var Insertquery = "INSERT INTO sewadars("
                                + "'id', 'name', 'gender', 'age', 'dob', 'address', 'pin_code', 'area_id', 'area_name', 'occupation_id', 'occupation_details', 'qualification', 'marital_status', 'guardian',"
                                + "'holds_badge_at', 'blood_group', 'can_donate', 'is_namdaan', 'date_of_namdaan', 'place_of_namdaan', 'refered_by', 'department_id', 'department_name', 'batch_type', 'batch_status',"
                                + "'designation_id', 'designation_name', 'batch_no', 'created_at', 'updated_at', 'vendor', 'server_id')"
                                + " VALUES ('" + sewadar_id + "','"
                                + ($scope.sewadar.name ? $scope.sewadar.name : '') + "','"
                                + ($scope.sewadar.gender ? $scope.sewadar.gender : '') + "','" 
                                + ($scope.sewadar.age ? $scope.sewadar.age : '') + "', '" 
                                + $scope.sewadar.dob.split('T')[0] + "', '" 
                                + ($scope.sewadar.address ? $scope.sewadar.address : '') + "', '"
                                + ($scope.sewadar.pin_code ? $scope.sewadar.pin_code : '') + "','" 
                                + JSON.parse($scope.sewadar.area).area_id + "','" 
                                + JSON.parse($scope.sewadar.area).area_name + "', '" 
                                + ($scope.sewadar.occupation_id ? $scope.sewadar.occupation_id : '') + "','"
                                + ($scope.sewadar.occupation_details ? $scope.sewadar.occupation_details : '') + "','" 
                                + ($scope.sewadar.qualification ? $scope.sewadar.qualification : '') + "','" 
                                + ($scope.sewadar.marital_status ? $scope.sewadar.marital_status : '') + "','" 
                                + ($scope.sewadar.guardian ? $scope.sewadar.guardian : '') + "','"
                                + ($scope.sewadar.holds_badge_at ? $scope.sewadar.holds_badge_at : '') + "','" 
                                + ($scope.sewadar.blood_group ? $scope.sewadar.blood_group : '') + "','" 
                                + ($scope.sewadar.can_donate ? $scope.sewadar.can_donate : '') + "','" 
                                + ($scope.sewadar.is_namdaan ? $scope.sewadar.is_namdaan : '') + "','" 
                                + $scope.sewadar.date_of_namdaan.split('T')[0] + "','"
                                + ($scope.sewadar.place_of_namdaan ? $scope.sewadar.place_of_namdaan : '') + "','" 
                                + ($scope.sewadar.refered_by ? $scope.sewadar.refered_by : '') + "','" 
                                + ($scope.sewadar.department ? JSON.parse($scope.sewadar.department).department_id : '') + "','" 
                                + ($scope.sewadar.department ? JSON.parse($scope.sewadar.department).department_name : '') + "','"
                                + ($scope.sewadar.batch_type ? $scope.sewadar.batch_type : '') + "','" 
                                + ($scope.sewadar.batch_status ? $scope.sewadar.batch_status : '') + "','" 
                                + ($scope.sewadar.designation ? JSON.parse($scope.sewadar.designation).designation_id : '') + "','"
                                + ($scope.sewadar.designation ? JSON.parse($scope.sewadar.designation).designation_name : '') + "','"
                                + ($scope.sewadar.batch_no ? $scope.sewadar.batch_no : '') + "','"
                                + setDateFormat(new Date().toISOString()) + "','"
                                + setDateFormat(new Date().toISOString()) + "','"
                                + setVendor() + "','" + 0 + "')";
                                console.log(Insertquery);
                                $cordovaSQLite.execute($rootScope.db, Insertquery).then(function (res) {
                                    console.log(res)
                                    copyNewPhoto(cordova.file.externalCacheDirectory, $scope.sewadar.photo, $scope.imagePath, $scope.sewadar.photo, $scope.sewadar.batch_no);
                                    $cordovaToast.show('Sewadar created.', 'short', 'center');
                                },function(err) {
                                    $cordovaToast.show(err.message, 'short', 'center');
                                });
    
                            },function (err) {
                                $cordovaToast.show('Something Went Wrong..', 'short', 'center');
                                console.log(err)
                            })
                            
                        } 
                    });
    
                } else {
                    $cordovaToast.show('Please select profile picture', 'short', 'center');
                }

            }

        }

        var setDateFormat = function(date) {
            var formatedDate = date.split('.')[0].split('T');
            return formatedDate[0] + ' ' + formatedDate[1];
        }

        var copyNewPhoto = function(fromPath, copiedPhotoName, toPath, replacedPhotoName, sewadar_batch_no) {
            var photo_update_status = 1;
            
            $cordovaFile.copyFile(fromPath, copiedPhotoName, toPath, replacedPhotoName).then(function(success) {
                var query = "UPDATE sewadars SET photo = '"+replacedPhotoName+"', photo_update_status = '"+photo_update_status+"', image_modified_at = '"+setDateFormat(new Date().toISOString())+"' WHERE sewadars.batch_no = '"+sewadar_batch_no+"'";      
                $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                    console.log(res)
                    // $cordovaToast.show('Profile picture updated', 'short', 'center');      
                }, function(err) {
                    console.log(err);
                });
            });
        }

        $scope.calculateAge = function () {
            if ($scope.sewadar.dob) {
                var ageDifMs = Date.now() - $scope.sewadar.dob.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                $scope.sewadar.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        }

        $scope.clickPhoto = function() {

            console.log('click picture action');

            var cameraOptions = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                correctOrientation: true,
                targetWidth: 200,
                targetHeight: 200
            }

            navigator.camera.getPicture(onCameraSuccess, onCameraFail, cameraOptions);

        }
        var onCameraSuccess = function(imageData) {
            console.log(imageData)
            $timeout(function(){
				$scope.$apply(function(){
                    var photoLink = imageData.split('/');
                    $scope.sewadar.photo = photoLink[photoLink.length-1];
                    $scope.isImageInCache = true;
                    checkPhotoAvailable($scope.sewadar.photo)
				});
			},0)
        }

        var onCameraFail = function(error) {
            console.log(error);
        }

        $scope.selectedSewadardetails = function(sewadar) {
            console.log(sewadar)

            $scope.sewadar.ref_sewadar_name = sewadar.name;
            $scope.sewadar.ref_badge_number = sewadar.batch_no;
            $scope.sewadar.ref_department = sewadar.department_name;
            $scope.sewadar.refered_by = sewadar.id;
            $scope.searchSewadar = [];

            console.log($scope.sewadar);
        }

        $scope.search = function(searchQuery) {
            console.log(searchQuery)
            $scope.str = searchQuery;
            getSewadarList(searchQuery);                                              
        };

        var getSewadarList = function (searchQuery) {
            
            if (searchQuery != '') {
                cfpLoadingBar.start();
            } else {
                return;
            }
            
            if (angular.isNumber(searchQuery) && searchQuery > 0) {
                
                var createIndexForBatch = "CREATE INDEX batch_index ON sewadars(batch_no)";
                
                $cordovaSQLite.execute($rootScope.db, createIndexForBatch).then(function(res1) {},function(err) {});
                
                var query = "select * from sewadars INDEXED BY batch_index where batch_no LIKE '"+searchQuery+'%'+"' OR batch_no = '"+searchQuery+"' order by batch_no LIMIT "+sewadarLimit;
                searchData(query);

            } else if (angular.isString(searchQuery) && searchQuery.length > 1) {

                var createIndexForName = "CREATE INDEX name_index ON sewadars(name)";
                
                $cordovaSQLite.execute($rootScope.db, createIndexForName).then(function(res2) {});
                
                var query = "select * from sewadars INDEXED BY name_index where name  LIKE '"+'%'+searchQuery+'%'+"' OR name='"+searchQuery+"' order by name LIMIT "+sewadarLimit;
                searchData(query);

            } else {
                cfpLoadingBar.complete();
                $cordovaToast.show('Please enter atleast 2 characters', 'short', 'center');
            }
        }

        var searchData = function(query) {
            
            console.log(query);

            $cordovaSQLite.execute($rootScope.db, query).then(function(res) {

                if(res.rows.length > 0) {
                    for(var i= 0; i<res.rows.length; i++) { 
                        $scope.searchSewadar.push(res.rows.item(i)); 
                    } 
                    findImage();
                } else {
                    $cordovaToast.show('No result found', 'short', 'center');
                } 

                cfpLoadingBar.complete();
            }, function (err) {
                cfpLoadingBar.complete();
            });
            
            console.log($scope.searchSewadar);
            
        }

        var findImage = function() {
            angular.forEach($scope.searchSewadar, function(val, i){
                  $cordovaFile.checkFile($scope.imagePath, val.photo)
                  .then(function (success) {
                        $scope.searchSewadar[i].isImageFound = true;
                  }, function (error) {
                        $scope.searchSewadar[i].isImageFound = false;
                  });  
            });
        }

        initCreateSewadar();
    };
  
    NewSewadarController.$inject = ['$log', '$scope', '$rootScope', '$ionicHistory', '$state', '$cordovaSQLite', '$filter', '$timeout', '$cordovaFile', '$cordovaToast', 'cfpLoadingBar', '$stateParams'];
  
    angular
      .module('SCMS_ATTENDANCE')
      .controller("NewSewadarController", NewSewadarController);
  })();
  
  