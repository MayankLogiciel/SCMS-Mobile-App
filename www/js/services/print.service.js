angular.module('SCMS_ATTENDANCE')

.service('printService', function($cordovaPrinter, $rootScope) {
	
    this.printUserForm = function(sewadar, isImageNotAvailable, skillList, vehicleList) {

        console.log(skillList, vehicleList);

        var skill = '';
        
        angular.forEach(skillList, function(val){
            skill = skill + '<li style="margin-bottom: 5px; float: left; width: 50%;">'+ val.name + ' ✓' + '</li>'
        })
        
        var vehicle = '';
        
        angular.forEach(vehicleList, function(val){
            vehicle = vehicle + '<li style="margin-bottom: 5px; float: left; width: 50%;">'+ val.name + ' ✓' +'</li>'
        })

        var photo = (sewadar.photo && !isImageNotAvailable) ? $rootScope.baseAppDir + 'import/sewadar_pics/' + sewadar.photo : 'img/imgUnavailable.png' ;
        var template = '<body style="font-size: 14px;">' +
            '<div style="max-width: 1170px;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto; margin-top: 25px;">' +
                '<div style="text-align: center;margin-bottom: 30px;"><h1 style="font-size: 20px;">RADHA SOAMI SATSANG BEAS <br>CENTRE LUDHIANA - VIII <br>APPLICATION FOR APPOINTMENT AS SEWADAR</h1></div>' +
                '<div style="width: 200px;border: 1px solid #eee;display: inline-block;height: 200px;float:right;position: relative;"><img src="' + photo + '" class="rounded" alt="Cinque Terre" style="max-width: 100%;position: absolute;left: 0;right: 0;top: 50%;transform: translateY(-50%);"></div>' +
                '<div style="display:block;margin-right:220px;">' +
                    '<div style="margin-bottom:10px;"><label style="float:left;width:50px;">Name</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:50px;">' + (sewadar.name ? sewadar.name : '')+ '</div></div>' +
                    '<div style="margin-bottom:10px;"><label style="float:left;width:150px;">Gender(Male/Female)</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:150px;">' + (sewadar.gender == 'M' ? 'Male' : 'Female') + '</div></div>' +
                    '<div style="margin-bottom:10px;"><label style="float:left;width:165px;">Father\'s Husband\'s Name</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:165px;">' + (sewadar.guardian ? sewadar.guardian : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;"><label style="float:left;width:135px;">Residential Address</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:135px;">' + (sewadar.address ? sewadar.address : '') + '</div><br><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:0;"></div></div>' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:62px;">Pin Code</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:62px;">' + (sewadar.pin_code ? sewadar.pin_code : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:35px;">Area</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:35px;">' + (sewadar.area_name ? sewadar.area_name : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:90px;">Landline No</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:90px;">' + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:75px;">Mobile No</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:75px;">' + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:90px;">Occupation</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:90px;">' + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:130px;">Occupation Details</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:130px;">' + (sewadar.occupation_details ? sewadar.occupation_details : '') + '</div></div>' +
                    '<div style="clear: both;"></div>' +
                    '<div style="margin-bottom:10px;"><label style="float:left;width:90px;">Qualification</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:90px;">' + (sewadar.qualification ? sewadar.qualification : '') + '</div></div>' +
                '</div>' +
                '<div style="display:block;">' +
                    '<div style="margin-bottom:10px;width: 33.1%;float:left;"><label style="float:left;width:35px;">Age</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:35px;">' + (sewadar.age ? sewadar.age : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 33.1%;float:left;"><label style="float:left;width:90px;">Date of Birth</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:90px;">' + (sewadar.dob ? sewadar.dob : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 33.1%;float:left;"><label style="float:left;width:138px;">Married/Un-Married</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:138px;">' + (sewadar.marital_status ? sewadar.marital_status : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 33.1%;float:left;"><label style="float:left;width:145px;">Are you initiated(y/n)</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:145px;">' + (sewadar.is_namdaan == 'Y' ? 'Yes' : 'No') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 33.1%;float:left;"><label style="float:left;width:115px;">Date of Initiation</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:115px;">' + (sewadar.date_of_namdaan ? sewadar.date_of_namdaan : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 33.1%;float:left;"><label style="float:left;width:118px;">Place of Initiation</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:118px;">' + (sewadar.place_of_namdaan ? sewadar.place_of_namdaan : '') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 65%;float:left;"><label style="float:left;width:280px;">Name of Guardian (in case of not initiated)</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:280px;">' + '' + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 34.1%;float:left;"><label style="float:left;width:60px;">Relation</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:60px;">' + '' + '</div></div>' +
                    '<div style="clear: both;"></div>' +
                    '<div style="margin-bottom:10px;width: 99.1%;"><label style="float:left;width:280px;">Date and place of initiation of the Guardian</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:280px;">' + '' + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 45%;float:left;"><label style="float:left;width:205px;">Whether Sewadar at Beas(Y/N)</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:205px;">' + (sewadar.holds_badge_at == 'Y' ? 'Yes' : 'No') + '</div></div>' +
                    '<div style="margin-bottom:10px;width: 31%;float:left;"><label style="float:left;width:90px;">Since When</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:90px;"></div></div>' +
                    '<div style="margin-bottom:10px;width: 23%;float:left;"><label style="float:left;width:38px;">Deptt</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:38px;"></div></div>' +
                    '<div style="margin-bottom:10px;width: 33%;float:left;"><label style="float:left;width:95px;">Introduced By</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:95px;"></div></div>' +
                    '<div style="margin-bottom:10px;width: 33%;float:left;"><label style="float:left;width:75px;">Badge No.</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:75px;"></div></div>' +
                    '<div style="margin-bottom:10px;width: 33%;float:left;"><label style="float:left;width:80px;">Department</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:80px;"></div></div>' +
                    '<div style="clear: both;"></div>' +
                    '<div style="margin-bottom:10px;width: 99.1%"><label style="float:left;width:165px;">Full Address (Introducer)</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:165px;">' + (sewadar.address ? sewadar.address : '') + '</div><br><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:0;"></div></div>' +
                    '<br><br><br><br>' +
                    '<div style="float: left;width: 100%;">' +
                        '<div style="width: 25%;float: left;"><div style="display:block;height:13px;border-bottom:1px solid #ccc;"></div><p style="text-align: center;">Signature of Introducer</p></div>' +
                        '<div style="width: 25%;float: right;"><div style="display:block;height:13px;border-bottom:1px solid #ccc;"></div><p style="text-align: center;">Signature of Applicant</p></div>' +
                    '</div>' +
                    '<div style="clear: both;"></div>' +
                    '<div style="margin-top: 35px;text-align: center;">' +
                        '<h3 style="margin-top: 0;margin-bottom: 0;font-size: 20px;">CERTIFICATE ABOUT CHARACTER, ANTECEDENT & GAURANTEE</h3>' +
                        '<p style="margin-top: 5px;">I fully know the above named applicant and I stand gaurantee for his good behaviour and conduct.</p>' +
                        '<br><br>' +
                        '<div style="float: left;width: 100%;">' +
                            '<div style="width: 35%;float: left;"><div style="display:block;height:13px;border-bottom:1px solid #ccc;"></div><p style="text-align: center;">Name & Signature of Jathedar</p><label style="float:left;width:75px;">Badge No.</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:75px;"></div></div>' +
                            '<div style="width: 35%;float: right;"><div style="display:block;height:13px;border-bottom:1px solid #ccc;"></div><p style="text-align: center;margin-bottom: 0;">Name & Signature of Guardian</p><p style="margin-top: 5px;">(In case not initiated)</p></div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="clear: both;"></div>' +
                    '<div style="margin-top: 30px;float: left;width: 100%;">' +
                        '<div style="width: 20%;float: left;"><label style="float:left;width:35px;">Date</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:35px;"></div></div>' +
                        '<div style="width: 25%;float: right;"><p style="margin-bottom: 0px;margin-top: 0;">Secretary Radha Soami Satsang Beas</p><p style="margin-top: 5px;text-align: center;">Centre Ludhiana - VIII</p></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div style="max-width: 1170px;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto; margin-top: 25px;">' +
                '<div style="text-align: center;margin-bottom: 30px;">' +
                    '<h3 style="font-size: 20px;margin-top: 0;">Additional Details:</h3>	' +
                '</div>' +
                '<div style="display:block;">' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:90px;">Blood Group</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:90px;">'+ (sewadar.blood_group ? sewadar.blood_group : '') +'</div></div>' +
                    '<div style="margin-bottom:10px;width: 50%;float:left;"><label style="float:left;width:200px;">Willing to Donate Blood(Y/N)</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:200px;">'+ (sewadar.can_donate == 'Y' ? 'Yes' : 'No') +'</div></div>' +
                    '<br>' +
                    '<div style="float: left;width: 100%;">' +
                        '<p>Skills</p>' +
                        '<div style="float: left;width: 100%;">' +
                            '<ol style="margin-top: 0;">' +
                                skill +
                                // '<li style="margin-bottom: 5px;float: left; width: 50%;">' +
                                //     '<div style="margin-bottom:10px;width: 40%;float:left;"><div style="float: left;height:13px;border-bottom:1px solid #ccc;width:100px;"></div><label style="float:left;margin-left:10px;">I</label></div>' +
                                // '</li>' +
                            '</ol>' +
                        '</div>' +
                    '</div>' +
                    '<br>' +
                    '<div style="float: left;width: 100%;">' +
                        '<p>Vehicle Owned</p>' +
                        '<div style="float: left;width: 100%;">' +
                            '<ol style="margin-top: 0;">' +
                                vehicle +
                                // '<li style="margin-bottom: 5px;float: left; width: 50%;">' +
                                //     '<div style="margin-bottom:10px;width: 40%;float:left;"><div style="float: left;height:13px;border-bottom:1px solid #ccc;width:100px;"></div><label style="float:left;margin-left:10px;">I</label></div>' +
                                // '</li>' +
                            '</ol>' +
                        '</div>' +
                    '</div>' +
                    '<div style="clear: both;"></div>' +
                    '<div style="margin-top: 30px;">' +
                        '<h2 style="font-size: 20px;text-align: center;margin-bottom: 25px;">DECLARATION BY SEWADAR FOR GETTING A BADGE</h2>' +
                        '<div>' +
                            '<div style="margin-bottom:10px;width: 40%;float:left;"><label style="float:left;width:18px;">I</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:18px;"></div></div>' +
                            '<div style="margin-bottom:10px;width: 35%;float:left;"><label style="float:left;width:65px;">S/D/W/O</label><div style="display:block;height:13px;border-bottom:1px solid #ccc;margin-left:65px;"></div></div>' +
                            '<div style="margin-bottom:10px;width: 15%;float:left;"><label style="float:left;width:130px;">hereby declares that</label></div>' +
                        '</div>' +
                        '<div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">1.</label><div style="display:block;margin-left:25px;">I am initiated from Beas.</div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">2.</label><div style="display:block;margin-left:25px;">That I have no badge at Beas or anywhere in Satsang Centres of India.</div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">3.</label><div style="display:block;margin-left:25px;">That my age is below 65 years as required by Beas/Centre. </div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">4.</label><div style="display:block;margin-left:25px;">That I am not addicted to any kind of intoxication and am physically fit for Sewa. </div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">5.</label><div style="display:block;margin-left:25px;">That I shall perform Sewa at centre or at Beas and in any department as required by the Management and shall abide to the changes in Sewa done by management from time to time. </div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">6.</label><div style="display:block;margin-left:25px;">That I shall be attend to my Sewa duties during Satsang days and otherwise as allottedto me by the management. </div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">7.</label><div style="display:block;margin-left:25px;">That I shall abide to the Rules and Regulations of centre and Beas and to the changes done in them from time to time. </div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">8.</label><div style="display:block;margin-left:25px;">That, in case of any mis-happening that occurs to me during Sewa, neither I nor my family members will claim any compensation from Centre or Beas as I am joining Sewa at my own free will. </div></div>' +
                            '<div style="margin-bottom:10px;width: 100%;float:left;"><label style="float:left;width:25px;">9.</label><div style="display:block;margin-left:25px;">That management shall have every right to cancel my badge without giving any reason. I shall accept it happily without any objection.</div></div>' +
                            '<div>' +
                                '<div style="margin-bottom:10px;float:left;"><label style="float:left;width:25px;">10.</label></div>' +
                                '<div style="margin-bottom:10px;width: 511px;float:left;"><label style="float:left;">That I am signing this document with my free will without any pressure. In the presence of </label></div>' +
                                '<div style="margin-bottom:10px;width: 17%;float:left;"><div style="display:block;height:13px;border-bottom:1px solid #ccc;"></div></div>' +
                            '</div>' +
                            '<br><br>' +
                            '<div style="clear: both;"></div>' +
                            '<p>The above statements have been read over to me in my own language and are true and correct to the best of my knowledge.</p>' +
                            '<br>' +
                            '<div style="float: left;width: 100%;">' +
                                '<div style="width: 25%;float: left;"><div style="display:block;height:13px;border-bottom:1px solid #ccc;"></div><p style="text-align: center;">Signature of Introducer</p></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</body>';

        if($cordovaPrinter.isAvailable()) {
            $cordovaPrinter.print(template, { duplex: 'long',  portrait: true}, function (res) {
                console.log(res ? 'Done' : 'Canceled');                              
            });
        };
    };

});
