(function () {
      'use strict';
      var searchPopoverDiretive = function ($ionicPopover, $cordovaSQLite, $cordovaToast, $cordovaFile, $rootScope, profilePicService) {
            return {
                  restrict: 'A',
                  controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                        $scope.imagePath = $rootScope.baseAppDir + 'import/sewadar_pics/';
                        $scope.defaultImage = 'img/imgUnavailable.png';
                        $scope.sewadarLimit = 10;
                        var isPopoverOpen = false;
                        var temp = '';
                        if (profilePicService.getTimeOfPic() == '') {
                              $scope.timeStampPhoto = '';
                        } else {
                              $scope.timeStampPhoto = profilePicService.getTimeOfPic();
                        }
                        $scope.search = function (searchQuery, type) {
                              if (temp == searchQuery && isPopoverOpen) {
                                    return;
                              }
                              console.log(isPopoverOpen);
                              temp = searchQuery;
                              if (!isPopoverOpen) {
                                    getSewadarList('open', searchQuery, type);
                              } else {
                                    getSewadarList('doNotopen', searchQuery, type);
                              }

                        };

                        var getSewadarList = function (str, searchQuery, type) {
                              if (type === 'open-sewadar') {
                                    if (searchQuery && searchQuery.length > 1) {
                                          var query = "select * from temp_sewadars where name  LIKE '" + searchQuery + '%' + "' OR name='" + searchQuery + "' order by name LIMIT " + $scope.sewadarLimit;
                                          searchPopoverData(query, str, type);
                                    }

                              } else {
                                    if (!isNaN(searchQuery) && angular.isNumber(+searchQuery)) {
                                          if (searchQuery.length > 0) {
                                                var createIndexForBatch = "CREATE INDEX batch_index ON sewadars(batch_no)";
                                                $cordovaSQLite.execute($rootScope.db, createIndexForBatch).then(function (res1) {
                                                }, function (err) {
                                                });
                                                var query = "select * from sewadars INDEXED BY batch_index where batch_no LIKE '" + searchQuery + '%' + "' OR batch_no = '" + searchQuery + "' order by batch_no LIMIT " + $scope.sewadarLimit;
                                                searchPopoverData(query, str);
                                          }
                                    } else {
                                          if (searchQuery.length > 1) {
                                                var createIndexForName = "CREATE INDEX name_index ON sewadars(name)";
                                                $cordovaSQLite.execute($rootScope.db, createIndexForName).then(function (res2) {

                                                });
                                                var query = "select * from sewadars INDEXED BY name_index where name  LIKE '" + '%' + searchQuery + '%' + "' OR name='" + searchQuery + "' order by name LIMIT " + $scope.sewadarLimit;
                                                searchPopoverData(query, str);
                                          } else {
                                                $cordovaToast.show('Please enter atleast 2 characters', 'short', 'center');

                                          }
                                    }
                              }
                        }

                        var searchPopoverData = function (query, str, type) {
                              if (type == 'open-sewadar') {
                                    $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
                                          $scope.sewadars = [];
                                          if (res.rows.length > 0) {
                                                for (var i = 0; i < res.rows.length; i++) {
                                                      $scope.sewadars.push(res.rows.item(i));
                                                }
                                                if (str == 'open') {
                                                      $scope.openPopoverForSewadar();
                                                }
                                          } else {
                                                $scope.closePopoverForSewadar();
                                                $cordovaToast.show('No suggestion found', 'short', 'center');
                                          }
                                    }, function (err) {
                                    });

                              } else {
                                    $cordovaSQLite.execute($rootScope.db, query).then(function (res) {
                                          $scope.sewadars = [];
                                          if (res.rows.length > 0) {
                                                for (var i = 0; i < res.rows.length; i++) {
                                                      $scope.sewadars.push(res.rows.item(i));
                                                }
                                                if (str == 'open') {
                                                      $scope.openPopoverForSewadar();
                                                }
                                                findImage();
                                          } else {
                                                $scope.closePopoverForSewadar();
                                                $cordovaToast.show('No result found', 'short', 'center');
                                          }
                                    }, function (err) {
                                    });

                              }
                        }

                        var findImage = function () {
                              angular.forEach($scope.sewadars, function (val, i) {
                                    $cordovaFile.checkFile($scope.imagePath, val.photo)
                                          .then(function (success) {
                                                $scope.sewadars[i].isImageFound = true;
                                          }, function (error) {
                                                $scope.sewadars[i].isImageFound = false;
                                          });
                              });
                        }

                        $scope.openPopoverForSewadar = function ($event) {
                              $ionicPopover.fromTemplateUrl('templates/popovers/sewadar.popover.html', {
                                    scope: $scope,
                                    backdropClickToClose: false
                              }).then(function (popover) {
                                    $scope.popover = popover;
                                    $scope.popover.show($event);
                                    isPopoverOpen = true;
                                    $rootScope.$broadcast('popover-open');
                              });
                        };

                        $scope.closePopoverForSewadar = function (date) {
                              if (isPopoverOpen) {
                                    $scope.popover.remove();
                              }
                              temp = '';
                              $scope.searchQuery = '';
                              if (!angular.isDefined(date) || date == 'undefined') {
                                    $element[0].focus();
                              }
                              isPopoverOpen = false;
                        };

                        $scope.$on('$destroy', function () {
                              $scope.popover.remove();
                        });
                  }]
            }
      }
      searchPopoverDiretive.$inject = ['$ionicPopover', '$cordovaSQLite', '$cordovaToast', '$cordovaFile', '$rootScope', 'profilePicService'];

      angular
            .module('SCMS_ATTENDANCE')
            .directive("searchPopoverDiretive", searchPopoverDiretive);
})();
