(function() {
     'use strict';
      /**
      * Satsang_Day_Attendance Controller
      **/
      var NominalRollsSewadarAttendanceController = function($log, $scope, $state, $ionicHistory, $cordovaSQLite, $ionicPopover, $ionicModal, $filter, ionicDatePicker, $stateParams, $rootScope, $timeout, $cordovaToast, cfpLoadingBar, nominalRollsService, $cordovaPrinter, authService, $ionicPopup, $cordovaFile, profilePicService, $ionicActionSheet) {
            var setup = function() {
                  $log.debug("Nominal Rolls Attendance Controller");
                  $scope.nominalRollsData = {};
                  $scope.placeInfo = authService.getSansangPlaceInfo();
                  $scope.nominal_id = $stateParams.id;
                  $scope.nominal_status = $stateParams.status;
                  $scope.tempSewadarAttendance = [];
                  $scope.sewadarAttendance = [];
                  $scope.sewadarPrintList = [];                  
                  $scope.showError = false;                  
                  $scope.sewadar ={}; 
                  $scope.start = 10;
                  $scope.end = $scope.start+10;
                  $scope.currentDate =  $filter('date')(new Date(), 'yyyy-MM-dd'); 
                  $scope.LetterNumber =  $filter('date')(new Date(), 'yyyy/M');                 
                  if($scope.nominal_id) {                      
                        $scope.nominalRollsData = nominalRollsService.getNominalRollsData(); 
                        if($scope.nominalRollsData.incharge_id == 'null') {
                              $scope.nominalRollsData.incharge_id = null;
                        }else {
                              $scope.nominalRollsData.incharge_id = $scope.nominalRollsData.incharge_id;
                        }                      
                        $scope.LetterNumber = $scope.LetterNumber + '/' + $scope.nominalRollsData.id;
                        if($scope.nominalRollsData.sewa_name == 'Misc Sewa') {
                              $scope.nominalRollsData.sewa_name = $scope.nominalRollsData.new_sewa;  
                        } else {
                              $scope.nominalRollsData.sewa_name = $scope.nominalRollsData.sewa_name; 
                        }
                        $scope.nominalRollsData.vehicle_type = (nominalRollsService.getNominalRollsData().vehicle_type == 'null') ? '' : nominalRollsService.getNominalRollsData().vehicle_type;
                        $scope.nominalRollsData.vehicle_no = (nominalRollsService.getNominalRollsData().vehicle_no == 'null') ? '' : nominalRollsService.getNominalRollsData().vehicle_no;
                        $scope.nominalRollsData.driver_name = (nominalRollsService.getNominalRollsData().driver_name == 'null') ? '' : nominalRollsService.getNominalRollsData().driver_name;
                        var oneDay = 24*60*60*1000; 
                        $scope.startDate = new Date($scope.nominalRollsData.date_from);
                        var endDate = new Date($scope.nominalRollsData.date_to);
                        $scope.diffDays = Math.round(Math.abs(($scope.startDate.getTime() - endDate.getTime())/(oneDay)));
                        $scope.getListFromSewadarsForAttendance(); 
                        if($scope.nominalRollsData.status == 'pending') {
                              $scope.isCurrentDate = false; 
                        } else {
                              $scope.isCurrentDate = true;
                        }                                    
                  }
                  if(profilePicService.getTimeOfPic()=='') {
                        $scope.timeStampPhoto = '';
                  }else {
                        $scope.timeStampPhoto =  profilePicService.getTimeOfPic();
                  }
                  $scope.imagePath = cordova.file.externalApplicationStorageDirectory + 'import/sewadar_pics/'; 
                  $scope.defaultImage = 'img/imgUnavailable.png';
                  $scope.TempSewadarData = {};
                  $scope.refId = (new Date())/1000|0;
                  $scope.isBatchNumber = true;
            };
            $scope.goBack = function() {
                  $ionicHistory.goBack();
            };

            $scope.$on('floating-menu:open', function(){
                  $scope.isDisabled = true; 
            });
            $scope.$on('floating-menu:close', function(){
                  $scope.isDisabled = false; 
            });

            $scope.openNameOrBadgePopover = function($event) {
                  $ionicPopover.fromTemplateUrl('templates/popovers/nameorbadgebutton.popover.html', {
                        scope: $scope,
                  }).then(function(popover) {
                        $scope.popover = popover; 
                        $scope.popover.show($event);
                  });
            };

            $scope.openJathaMembers = function() {
                  $state.go("jatha-members");
            }

            $scope.closeNameBadgePopover = function() {
                  $scope.popover.hide();
            }

            //refreshing page 
            $rootScope.$on('refreshPage',function(event, data){
                  $scope.nominalRollsData.incharge_id = null;
            });

            $scope.markAsIncharge = function(sewadar) {
                  console.log(sewadar);
                  if(!angular.isDefined(sewadar.batch_no) || sewadar.batch_no == null) {
                        var incharge_type = 't';
                  }else {
                        var incharge_type = 'p';
                  }
                  $scope.buttonText = [                   
                  {text: '<i class="icon ion-checkmark-circled icon-space"></i>Mark As Incharge'},
                  ];
                  var buttons = [];
                  angular.forEach($scope.buttonText, function (val) {  
                        buttons.push({text: val.text});
                  }); 
                  $ionicActionSheet.show({                        
                        buttons: buttons,
                        titleText: 'Quick Actions',
                        cancelText: '<i class="icon ion-close-round assertive"></i> Cancel',
                        cancel: function() {
                              $log.debug('CANCELLED');
                        },
                        buttonClicked: function(index) {
                              switch (index){
                                    case 0 :
                                          var query = "UPDATE nominal_roles SET name = '"+sewadar.name+"', contact_no = "+sewadar.sewadar_contact+", incharge_id = "+sewadar.id+", incharge_type = '"+incharge_type+"' WHERE id = '"+$scope.nominal_id+"'";
                                          $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                                                $cordovaToast.show(sewadar.name +' is the incharge of this nominal roll', 'short', 'center');
                                                $scope.nominalRollsData.incharge_id = sewadar.id; 
                                                $scope.nominalRollsData.incharge_type = incharge_type;
                                          });
                                          return true;   

                              }
                        }
                  });
            }
            $scope.byNameOrBatch = function(str) {
                  switch (str){
                        case 'name':
                        $scope.isBatchNumber = false;
                        return;
                        case 'batch':
                        $scope.isBatchNumber = true;
                        return;
                  }
            }

            var getSewadarData = function(query) { 
                  cfpLoadingBar.start();
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        //$scope.totalRows = res.rows.length;
                        $scope.sewadarPrintList = [];
                        if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.sewadarAttendance.push(res.rows.item(i));                                    
                              } 
                        }
                        cfpLoadingBar.complete()
                        findImage();
                  }, function (err) { 
                  }).finally(function(){ 
                        $scope.$broadcast('scroll.infiniteScrollComplete'); 
                  });
            };

            var findImage = function() {
                  angular.forEach($scope.sewadarAttendance, function(val, i){
                        $cordovaFile.checkFile($scope.imagePath, val.photo)
                        .then(function (success) {
                              $scope.sewadarAttendance[i].isImageFound = true;
                        }, function (error) {
                              $scope.sewadarAttendance[i].isImageFound = false;
                        });  
                  });
            }
            
            $scope.SaveDataToAttandanceTable = function(sewadar) {                  
                  var CheckQuery = "SELECT sewadar_id FROM attendances where sewadar_id ='"+sewadar.id+"' AND nominal_roll_id ='"+$scope.nominal_id+"'";
                  $cordovaSQLite.execute($rootScope.db, CheckQuery).then(function(res) {
                        if(res.rows.length==0) {
                              SaveDataToAttandanceTableNested(1, sewadar);                              
                        } else {
                              $cordovaToast.show('Sewadar alredy exist', 'short', 'center');
                        }
                  }, (err) => { 
                  });
            };

            var SaveDataToAttandanceTableNested = function(index, sewadar) {
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  var type = 'nominal_roll';
                  var batch_type = 'permanent'; 
                  var reference_id = $scope.refId;
                  var sewadar_type = 'permanent';
                  var Insertquery;
                  var date = new Date($scope.startDate);
                  var nominalAttendanceDate= $filter('date')(new Date(date.setDate(date.getDate() + (index -1))), 'yyyy-MM-dd');
                  Insertquery = "INSERT INTO attendances('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id') VALUES ('"+nominalAttendanceDate+"','"+sewadar.id+"','"+$scope.nominalRollsData.sewa_id+"', '"+reference_id+"', '"+type+"', '"+batch_type+"','"+$scope.current+"','"+$scope.current+"', '"+sewadar_type+"','"+$scope.nominal_id+"')";
                  $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(res) {
                        if(index >= $scope.diffDays + 1) {
                              $scope.sewadarAttendance.unshift(sewadar);                              
                              $cordovaToast.show('Sewadar added', 'short', 'center');

                        }else{
                              SaveDataToAttandanceTableNested(++index, sewadar);
                        }
                  }, (err) => {                  
                  }); 
            };

            $scope.CheckedGender =function(gender) {
                  switch (gender){
                        case 'Male':
                        $scope.TempSewadarData.Female = false;   
                        $scope.TempSewadarData.Male = true;
                        $scope.TempSewadarData.gender = 'M';
                        return;
                        case 'Female':
                        $scope.TempSewadarData.Female = true;
                        $scope.TempSewadarData.Male = false;
                        $scope.TempSewadarData.gender = 'F';
                        return;
                  }
            }

            $scope.addTempSewadar = function(TempSewadarData) {
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  if(!angular.isDefined(TempSewadarData.Male) && !angular.isDefined(TempSewadarData.Female)) {
                        $scope.showError = true;
                        return;
                  }
                  $scope.closePopoverForTempSewadar();
                  var Insertquery = "INSERT INTO temp_sewadars('name', 'guardian', 'gender', 'address', 'age', 'created_at', 'updated_at') VALUES ('"+TempSewadarData.name+"','"+TempSewadarData.guardian+"','"+TempSewadarData.gender+"', '"+TempSewadarData.address+"', '"+TempSewadarData.age+"','"+$scope.current+"','"+$scope.current+"')";
                  $cordovaSQLite.execute($rootScope.db, Insertquery).then(function(resTemp) {
                        $scope.tempID = resTemp.insertId
                        addTempSewadarNested(1, TempSewadarData);
                  }, (err) =>{

                  });
                  setFocus();
            };

            function setFocus() {
                  //Set focus on input textbox;
                  $timeout(function() {
                        var input = document.querySelector(".att-search");
                        input.focus();
                  }, 100);
            }

            var addTempSewadarNested = function(index, TempSewadarData) {
                  $scope.current = $filter('date')(new Date(), 'yyyy-MM-dd h:mm:ss');
                  var type = 'nominal_roll';
                  var batch_type = 'temporary';
                  var reference_id = $scope.refId;
                  var sewadar_type = 'temporary';
                  var date = new Date($scope.startDate);
                  var  insertAttedanceForTempSewadar;
                  var nominalAttendanceDate= $filter('date')(new Date(date.setDate(date.getDate() + (index -1))), 'yyyy-MM-dd');
                  insertAttedanceForTempSewadar = "INSERT INTO attendances ('date', 'sewadar_id', 'sewa_id','reference_id', 'type', 'batch_type', 'created_at', 'updated_at', 'sewadar_type', 'nominal_roll_id') VALUES ('"+nominalAttendanceDate+"','"+$scope.tempID+"','"+$scope.nominalRollsData.sewa_id+"', '"+reference_id+"', '"+type+"', '"+batch_type+"','"+$scope.current+"', '"+$scope.current+"', '"+sewadar_type+"','"+$scope.nominal_id+"')";
                  $cordovaSQLite.execute($rootScope.db, insertAttedanceForTempSewadar).then(function(res) {
                        if(index >= $scope.diffDays+1) {
                              $scope.sewadarAttendance.unshift(TempSewadarData);
                              $scope.TempSewadarData = {};

                              $cordovaToast.show('Sewadar added', 'short', 'center');                              
                        }else{
                              addTempSewadarNested(++index, TempSewadarData, res);
                        }
                  }, (err) => {

                  });      
            }
            $scope.getListFromSewadarsForAttendance = function(){
                  var query = "SELECT DISTINCT sewadars.id, sewadars.name, sewadars.gender,sewadars.address, sewadars.batch_no, sewadars.guardian, sewadars.age, sewadars.photo, sewadars.designation_name, sewadars.department_name, sewadars.dob, sewadars.sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where attendances.nominal_roll_id = '"+$scope.nominal_id+"' AND attendances.sewadar_type = 'permanent' UNION SELECT DISTINCT temp_sewadars.id, temp_sewadars.name,temp_sewadars.gender,temp_sewadars.address, NULL as batch_no,  temp_sewadars.guardian,  temp_sewadars.age, NULL as photo, NULL as designation_name, NULL as department_name, NULL as dob, NULL as sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where attendances.nominal_roll_id = '"+$scope.nominal_id+"' group by att_id ORDER BY att_created_at DESC";
                  getSewadarData(query);
            }; 

            $scope.openPopoverForTempSewadar = function($event) {
                  $ionicPopover.fromTemplateUrl('templates/popovers/temp.sewadar.popover.html', {
                        scope: $scope,
                        backdropClickToClose: false                  
                  }).then(function(popover) {
                        $scope.popover = popover; 
                        $scope.popover.show($event);
                  });
            };


            $scope.closePopoverForTempSewadar = function() {
                  $scope.popover.hide();                  
            };
            $scope.$on('popover.hidden', function() {
                  $scope.popover.remove();
            });

            var setBlankRows = function(callback, incharge) {
                  if( !angular.isDefined($scope.sewadarPrintList) 
                        || !angular.isArray($scope.sewadarPrintList)) {
                        return;
                  }
                  var females = [];
                  var males = [];
                  if(incharge.gender == 'F') {
                        females.push(incharge);
                  }
                  if(incharge.gender == 'M') {
                        males.push(incharge);
                  }
                  angular.forEach($scope.sewadarPrintList, function(val) {

                        if( val.gender == 'M' ) {
                              males.push(val);
                        }
                        if( val.gender == 'F' ) {
                              females.push(val);
                        }
                  });

                  if( females.length > 0) {
                        if(males.length > 0) {
                              males.push({name:'', age: '', gender: '', id: null, guardian: '', batch_no: '', address: ''});
                              males.push({name:'', age: '', gender: '', id: null, guardian: '', batch_no: '', address: ''});
                        }
                  }                  

                  $scope.males = males;

                  males = males.concat(females);
                  $scope.sewadarPrintList = males;

                  if( angular.isDefined(callback) ) {
                        callback();
                  }
            };

            $scope.print = function() {
                  $scope.sewadarPrintList = [];
                  if($scope.nominalRollsData.incharge_id == null) {
                        $cordovaToast.show('Please select nominal rolls incharge', 'short', 'center');
                        return;
                  }
                  cfpLoadingBar.start();
                  $scope.signature = '';
                  $scope.incharge = {};
                  if($scope.placeInfo == null) {
                        $scope.placeInfo = {
                              place: '',
                              area: '',
                              zone: '',
                              mobile1: '',
                              mobile2: ''
                        };
                  } 
                  if(angular.isDefined($scope.placeInfo.mobile2) && $scope.placeInfo.mobile2 != '') {
                        $scope.placeInfo.mobile2 = ' / ' + $scope.placeInfo.mobile2;  
                  }else {
                        $scope.placeInfo.mobile2 = '';   
                  }

                  if(angular.isDefined($scope.placeInfo.mobile1) && $scope.placeInfo.mobile1 != '') {
                        $scope.placeInfo.mobile1 = $scope.placeInfo.mobile1;  
                  }else {
                        $scope.placeInfo.mobile1 = '';   
                  }

                  if(angular.isDefined($scope.placeInfo.place) && $scope.placeInfo.place != '') {
                        $scope.placeInfo.place = $scope.placeInfo.place;  
                  }else {
                        $scope.placeInfo.place = '';   
                  }

                  if(angular.isDefined($scope.placeInfo.area) && $scope.placeInfo.area != '') {
                        $scope.placeInfo.area = $scope.placeInfo.area;  
                  }else {
                        $scope.placeInfo.area = '';   
                  }

                  if(angular.isDefined($scope.placeInfo.zone) && $scope.placeInfo.zone != '') {
                        $scope.placeInfo.zone = $scope.placeInfo.zone;  
                  }else {
                        $scope.placeInfo.zone = '';   
                  }

                  if($scope.nominalRollsData.incharge_type == 't') {
                        var getIncharch = "SELECT * from temp_sewadars where id = "+$scope.nominalRollsData.incharge_id ;
                  }else {
                        var getIncharch = "SELECT * from sewadars where id = "+$scope.nominalRollsData.incharge_id ;
                  }
                  
                  $cordovaSQLite.execute($rootScope.db, getIncharch).then(function(res) { 
                        for(var i= 0; i<res.rows.length; i++) {
                              $scope.incharge = res.rows.item(i);
                        }
                        $scope.incharge.batch_no = (!angular.isDefined($scope.incharge.batch_no)) ? 'Open' : $scope.incharge.batch_no;
                  });
                  var getSign = "SELECT signature from users  where group_id = "+$scope.nominalRollsData.approved_by ;
                  $cordovaSQLite.execute($rootScope.db, getSign).then(function(res) { 
                        for(var i= 0; i<res.rows.length; i++) {
                              $scope.signature = 'data:image/jpeg;base64,' + res.rows.item(i).signature;
                        }
                  });

                  var query = "SELECT DISTINCT sewadars.id, sewadars.name, sewadars.gender,sewadars.address, sewadars.batch_no, sewadars.guardian, sewadars.age, sewadars.photo, sewadars.designation_name, sewadars.department_name, sewadars.dob, sewadars.sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id FROM sewadars INNER JOIN attendances ON sewadars.id=attendances.sewadar_id where attendances.nominal_roll_id = '"+$scope.nominal_id+"' AND attendances.sewadar_type = 'permanent' AND attendances.sewadar_id <> "+$scope.nominalRollsData.incharge_id+" UNION SELECT DISTINCT temp_sewadars.id, temp_sewadars.name, temp_sewadars.gender,temp_sewadars.address, NULL as batch_no, temp_sewadars.guardian, temp_sewadars.age, NULL as photo, NULL as designation_name, NULL as department_name, NULL as dob, NULL as sewadar_contact, attendances.sewadar_id as att_id, attendances.created_at as att_created_at, attendances.nominal_roll_id FROM temp_sewadars INNER JOIN attendances ON temp_sewadars.id=attendances.sewadar_id where attendances.nominal_roll_id = '"+$scope.nominal_id+"' AND attendances.sewadar_id <> "+$scope.nominalRollsData.incharge_id+" group by att_id ORDER BY gender desc, batch_no desc";
                  $cordovaSQLite.execute($rootScope.db, query).then(function(res) {
                        $scope.totalRows = res.rows.length;
                        $scope.males = [];
                        //if(res.rows.length > 0) {
                              for(var i= 0; i<res.rows.length; i++) { 
                                    $scope.sewadarPrintList.push(res.rows.item(i));  
                                    if(res.rows.item(i).gender == 'M') {
                                          $scope.males.push(res.rows.item(i)); 
                                    }                                                                      
                              } 
                              var htmlBodyStart = '<html><body>';
                              var header = '<div style="width: 99%; margin: auto; margin-top: -27px;"> <div style="width: 20%; display:inline-block; vertical-align: middle;"> <div> <img src="img/nomination.png" style="width: 55px; margin-top: -20px; alt="nomination-logo"> </div> </div> <div style="width: 58%; display:inline-block;"> <div style="text-align: center;"> <h3> SATSANG CENTERS IN INDIA <br> NOMINAL ROLL SEWA JATHA </h3> </div> </div> <div style="width: 20%; display:inline-block; vertical-align: top;"> <div style="text-align: right;"> <h4>SCI/2016/84</h4> </div> </div> </div>'; 
                              var subHeader = '<table style="width: 99%; margin: auto;"><tr><td style="width:50%">Name of Satsang Place :&nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.placeInfo.place+'</span></td><td style="width:30%">Area :&nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.placeInfo.area+'</span> </td><td style="width:20%">Zone :<span style="font-weight: bold; font-size: 14px;">'+$scope.placeInfo.zone+'</span></td></tr><tr><td style="width:50%">Name of Jathedar : &nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.nominalRollsData.name+'</span></td><td colspan="2" style="width:50%">Name of Driver :</span> &nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.nominalRollsData.driver_name+'</span></td></tr><tr><td>Type of Vehicle : &nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.nominalRollsData.vehicle_type+'</span></td><td colspan="2">Vehicle No : &nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.nominalRollsData.vehicle_no+'</span></td></tr><tr><td style="width:40%">Place of Sewa : &nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.nominalRollsData.sewa_name+'</span></td><td style="width:30%">Duration From :&nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.nominalRollsData.date_from+'</span></td><td style="width:30%">To :&nbsp;<span style="font-weight: bold; font-size: 14px;">'+$scope.nominalRollsData.date_to+'</span></td></tr><tr><td colspan="3">(Mention Beas Department or Center as Applicable)</td></tr></table>';
                              var tableStart = '<table style="border-collapse: collapse; width: 99%; margin-right: auto; margin-left: auto; margin-top: 10px"> <thead style="display: table-header-group"> <tr> <th style="border: 1px solid #000; font-size: 10px; ">Sr.No.</th> <th style="border: 1px solid #000; font-size: 10px;">Name of Sewadar / <br>Sewadarni</th> <th style="border: 1px solid #000; font-size: 10px; ">Father'+'s /Husband'+'s <br>Name</th> <th style="border: 1px solid #000;font-size: 10px;">Male / <br>Female</th> <th style="border: 1px solid #000; font-size: 10px;">&nbsp;&nbsp;&nbsp;Age&nbsp;&nbsp;&nbsp;</th> <th style="border: 1px solid #000;font-size: 10px;">R/O Village / Town / Location / District</th> <th style="border: 1px solid #000;font-size: 10px;">Badge <br>No.</th> </tr> </thead>';
                              var tableEnd = '</table>';
                              var tableRows = []; 
                              var tableRowsContinue = [];                              
                              var fixedFooter = '<table style="width: 99%; margin: auto; position:fixed; bottom:0px; left:0; right:0;  margin-bottom:0px;"><br><br><br><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: left;"><span style="border-top:1px solid #000; padding-right: 30px; padding-left: 30px;">(Signature of Jathedar)</span></td><td colspan="2" style="width: 25%; text-align:right; margin-right: 100px"></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: bottom  ; text-align: left;">Letter No. : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.LetterNumber+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: right;"><span style="padding-right: 36px; padding-left: 36px;"><img style="margin-right: 70px" src="'+$scope.signature+'" " width="70"></span></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: left;">Jatha : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.nominalRollsData.jatha_name+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: right;"><span style="border-top:1px solid #000; padding-right: 36px; padding-left: 36px;">(Signature of Functionary)</span></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: left;">Issue Date : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.nominalRollsData.date_from+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: right;"><span style="padding-right: 50px;">(Affix Rubber Stamp)</span></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: ;">Contact No. : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.nominalRollsData.contact_no+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: center;">Contact No. : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.placeInfo.mobile1+''+$scope.placeInfo.mobile2+'</span></td></tr></table>';    
                              var footer = '<br><br><table style="width: 99%; margin: auto;"><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: left;"><span style="border-top:1px solid #000; padding-right: 30px; padding-left: 30px;">(Signature of Jathedar)</span></td><td colspan="2" style="width: 25%;"></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: bottom  ; text-align: left;">Letter No. : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.LetterNumber+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: right;"><span style="padding-right: 36px; padding-left: 36px;"><img style="margin-right: 70px" src="'+$scope.signature+'" " width="70"></span></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: left;">Jatha : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.nominalRollsData.jatha_name+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: right;"><span style="border-top:1px solid #000; padding-right: 36px; padding-left: 36px;">(Signature of Functionary)</span></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: left;">Issue Date : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.nominalRollsData.date_from+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: right;"><span style="padding-right: 50px;">(Affix Rubber Stamp)</span></td></tr><tr><td colspan="2" style="width: 25%; vertical-align: top; text-align: ;">Contact No. : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.nominalRollsData.contact_no+'</span></td><td colspan = "2"  style="width: 25%; vertical-align: top; text-align: center;">Contact No. : &nbsp;<span style="padding-right: 50px; border-bottom: 1px solid #000;">'+$scope.placeInfo.mobile1+' '+$scope.placeInfo.mobile2+'</span></td></tr></table>';    
                              setBlankRows(function() {
                                    for(var i=0; i<$scope.sewadarPrintList.length;i++) {
                                          if(!angular.isDefined($scope.sewadarPrintList[i].guardian) || $scope.sewadarPrintList[i].guardian == null) {
                                                $scope.sewadarPrintList[i].guardian = 'N/A'; 
                                          }
                                          if(!angular.isDefined($scope.sewadarPrintList[i].age) || $scope.sewadarPrintList[i].age == null) {
                                                $scope.sewadarPrintList[i].age = 'N/A';
                                          }
                                          if(!angular.isDefined($scope.sewadarPrintList[i].batch_no) || $scope.sewadarPrintList[i].batch_no == null) {
                                                $scope.sewadarPrintList[i].batch_no = 'Open';
                                          }
                                          
                                          var offset = 0;
                                          if($scope.incharge.gender == 'M') {
                                                var tableRow = '<tr height = "28" > <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+(i+1+offset)+'</td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;">'+$scope.sewadarPrintList[i].name + '</td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;">'+$scope.sewadarPrintList[i].guardian+'</td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+$scope.sewadarPrintList[i].gender+'</td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+$scope.sewadarPrintList[i].age+'</td> <td style="border: 1px solid #000; font-size: 10px; text-overflow:ellipsis; padding-left: 5px">'+$scope.sewadarPrintList[i].address+'</td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+$scope.sewadarPrintList[i].batch_no+'</td> </tr>';
                                                if(i===22) {
                                                      var footerRow = '<tr><td colspan = 7>'+footer+'</td></tr><tr ><td colspan = 7></td></tr><tr ><td colspan = 7></td></tr><tr ><td colspan = 7></td></tr>';
                                                      tableRow = tableRow.concat(footerRow);
                                                } 
                                                if(i==0) {
                                                      var elem= document.createElement("table");
                                                      elem.innerHTML = tableRow;
                                                      var rows = elem.getElementsByTagName("tr");
                                                      angular.forEach(rows, function(row, key){
                                                            row.setAttribute("style", "font-weight: bold");
                                                      });
                                                      tableRow = elem.innerHTML;
                                                }

                                          }
                                          if($scope.incharge.gender == 'F') {
                                                var tableRow = '<tr height = "28"> <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+(i+1+offset)+'</td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;">'+$scope.sewadarPrintList[i].name + '</td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;">'+$scope.sewadarPrintList[i].guardian+'</td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+$scope.sewadarPrintList[i].gender+'</td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+$scope.sewadarPrintList[i].age+'</td> <td style="border: 1px solid #000; font-size: 10px; text-overflow:ellipsis; padding-left: 5px">'+$scope.sewadarPrintList[i].address+'</td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+$scope.sewadarPrintList[i].batch_no+'</td> </tr>';
                                                if(i===22) {
                                                      var footerRow = '<tr><td colspan = 7>'+footer+'</td></tr><tr ><td colspan = 7></td></tr><tr ><td colspan = 7></td></tr><tr ><td colspan = 7></td></tr>';
                                                      tableRow = tableRow.concat(footerRow);
                                                }

                                                if(i == $scope.males.length) {
                                                      var elem= document.createElement("table");
                                                      elem.innerHTML = tableRow;
                                                      var rows = elem.getElementsByTagName("tr");
                                                      angular.forEach(rows, function(row, key){
                                                            row.setAttribute("style", "font-weight: bold");
                                                      });
                                                      tableRow = elem.innerHTML;
                                                }

                                          } 
                                          // if($scope.sewadarPrintList.length >= 23) {                                                
                                          //       if(i===$scope.sewadarPrintList.length-1) {
                                          //             var tableEndFooter = tableEnd;
                                          //             tableRow = tableRow.concat(tableEndFooter); 
                                          //       }                                              
                                          // }                                        
                                          tableRows.push(tableRow);
                                    }
                              }, $scope.incharge);

                                        
                              var tableRowsToString = "";
                              var tableRowsContinueToString = "";
                              tableRowsToString= tableRows.join(' ');  
                              tableRowsContinueToString= tableRowsContinue.join(' '); 
                              var printedPage =  htmlBodyStart + header + subHeader + tableStart + tableRowsToString ;
                              var printedPage1 =  htmlBodyStart + header + subHeader + tableStart + tableRowsToString ;
                              
                              var printedPageContinue = htmlBodyStart + tableStart + tableRowsContinueToString + tableEnd ;
                              if($scope.sewadarPrintList.length >= 23) {  
                                    if($scope.sewadarPrintList.length > 23) {
                                          var pageNo = Math.floor(($scope.sewadarPrintList.length - 24) / 36);
                                          var printRecord = 36 * (pageNo + 1) + 23;
                                          var emptyRowsG;
                                          for(var s=$scope.sewadarPrintList.length; s < printRecord; s++){  
                                                emptyRowsG = '<tr height = "28" > <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+(s+1)+'</td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;"></td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;"></td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;"></td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;"></td> <td style="border: 1px solid #000; font-size: 10px; text-overflow:ellipsis; padding-left: 5px"></td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;"></td> </tr>'                                         
                                                printedPage = printedPage.concat(emptyRowsG);
                                          }                        
                                          var printPageFinal = printedPage;
                                    }                                  
                              } else {
                                    var emptyRows;
                                    for(var r=$scope.sewadarPrintList.length+1; r<24; r++){  
                                          emptyRows = '<tr height = "28" > <td style="border: 1px solid #000; font-size: 10px; text-align: center;">'+r+'</td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;"></td> <td style="border: 1px solid #000; font-size: 10px; padding-left: 5px; width: 125px;"></td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;"></td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;"></td> <td style="border: 1px solid #000; font-size: 10px; text-overflow:ellipsis; padding-left: 5px"></td> <td style="border: 1px solid #000; font-size: 10px; text-align: center;"></td> </tr>'                                         
                                          printedPage1 = printedPage1.concat(emptyRows);
                                    }
                                    var printPageFinal = printedPage1 + fixedFooter;  
                              }
                              if($cordovaPrinter.isAvailable()) {
                                    $cordovaPrinter.print(printPageFinal, { duplex: 'long',  portrait: true}, function (res) {
                                          alert(res ? 'Done' : 'Canceled');                              
                                    });
                              };
                       // }
                        cfpLoadingBar.complete();
                  }, function (err) { 
                  });
            };
            // implemented by anuj singh 28-06-17
            $scope.markAttendenceByQRCode = function() {
                  $timeout(function(){
                        angular.element(document.querySelector('#search-by-qrcode-nominal-rolls-attendence')).triggerHandler('tap');;
                  },0); 
            }
 
            setup();
      };

NominalRollsSewadarAttendanceController.$inject  = ['$log', '$scope', '$state', '$ionicHistory', '$cordovaSQLite', '$ionicPopover', '$ionicModal', '$filter', 'ionicDatePicker','$stateParams', '$rootScope', '$timeout', '$cordovaToast', 'cfpLoadingBar', 'nominalRollsService', '$cordovaPrinter', 'authService', '$ionicPopup', '$cordovaFile', 'profilePicService', '$ionicActionSheet'];

angular
.module('SCMS_ATTENDANCE')
.controller("NominalRollsSewadarAttendanceController", NominalRollsSewadarAttendanceController);
})();


