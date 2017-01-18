angular.module('autocompleteService')
    .controller('dropdownAutocompleteCtrl', function ($scope, $http, $filter, $timeout, $q) {

    $scope.selectedValue = function (field, select) {
      var val = field.name.split(';');
      if(val.length === 3) {
          return field.value;
      } else {
          return select;
      }
    };

    var hasNextChunk = true,
        queryParams = {params: {}},
        tempCollection, count = 30;

    function getInfinityScrollChunk() {
        $scope.isRequestMoreItems = true;
        return $http.get($scope.autocompleteData.apiUrl, queryParams).then(function (res) {
            if(angular.isDefined(res.config.params.sFind) && angular.isArray(res.data)){
                angular.forEach(res.data, function (el) {
                    if(angular.isDefined(el.sID) && angular.isDefined(el.sNote)){
                        el.sFind = el.sNote + " " + el.sID;
                    } else if (angular.isDefined(el.sID) && angular.isDefined(el.sName_UA)) {
                        el.sFind = el.sName_UA + " " + el.sID;
                    } else if (angular.isDefined(el.sID_UA) && angular.isDefined(el.sName_UA)) {
                        el.sFind = el.sName_UA + " " + el.sID_UA;
                    }
                });
            } else if(typeof res.data === 'object' && res.data.aSubjectGroupTree) {
                var response = subjectUserFilter(res.data.aSubjectGroupTree);
                angular.forEach(response, function (user) {
                    user.sName = user.sFirstName + " " + user.sLastName;
                })
            }
            return res;
        });
    }

    // filter for resp from getSubjectGroupsTree, with tree list
    var subjectUserFilter = function (arr) {
        var allUsers = [],
            filteredUsers = [],
            logins = [];

        function loop(arr) {
            angular.forEach(arr, function(item) {
                if(item.aUser) {
                    angular.forEach(item.aUser, function(user) {
                        allUsers.push(user);
                    })
                }
                if(item.aSubjectGroupChilds && item.aSubjectGroupChilds.length > 0){
                    loop(item.aSubjectGroupChilds)
                }
            })
        }

        loop(arr);

        for(var i=0; i<allUsers.length; i++) {
            if(logins.indexOf(allUsers[i].sLogin) === -1) {
                filteredUsers.push(allUsers[i]);
                logins.push(allUsers[i].sLogin);
            }
        }
        return filteredUsers;
    };

    var getAdditionalPropertyName = function() {
        return ($scope.autocompleteData.additionalValueProperty ? $scope.autocompleteData.additionalValueProperty : $scope.autocompleteData.prefixAssociatedField) + '_' + $scope.autocompleteName;
    };

    var getNameWithPostFix = function (field) {
      return field && field.id ? field.id.split('_') : null;
    };

    $scope.requestMoreItems = function(collection) {
        if ($scope.isRequestMoreItems || !hasNextChunk) {
            return $q.reject();
        }

        return ($scope.autocompleteData ? getInfinityScrollChunk() : $timeout(getInfinityScrollChunk, 200))
            .then(function(response) {
                var resp = response.data.aSubjectGroupTree ? response.data.aSubjectGroupTree : response.data;
                if(response.data.aSubjectGroupTree) {
                    resp = subjectUserFilter(response.data.aSubjectGroupTree);
                }
                Array.prototype.push.apply(collection, $filter('orderBy')(resp, $scope.autocompleteData.orderBy));
                if (!$scope.autocompleteData.hasPaging || response.data.length < count) {
                    hasNextChunk = false;
                }
                if ($scope.autocompleteData.hasPaging) {
                    queryParams.params.skip = collection.length;
                }
                return collection;
            }, function(err) {
                return $q.reject(err);
            })
            .finally(function() {
                $scope.isRequestMoreItems = false;
            });
    };

    $scope.refreshList = function(queryKey, queryValue, params) {
        if (!angular.isDefined(queryParams.params[queryKey])) {
            hasNextChunk = true;
        }
        if (!angular.equals(queryParams.params[queryKey], queryValue)) {
            // if ($scope.autocompleteData.hasPaging || !angular.isDefined(queryParams.params[queryKey])) {
            if ($scope.autocompleteData.hasPaging) {
                queryParams.params.count = count;
                queryParams.params.skip = 0;
            }
            $scope.isRequestMoreItems = false;
            hasNextChunk = true;
            var ps = params ? params.split(';')[2] : null;
            if(ps && ps.indexOf('sID_SubjectRole=Executor') > -1) {
                var param = ps.split(',');
                angular.forEach(param, function (p) {
                    angular.forEach($scope.taskForm, function (field, key) {
                        if('aRow' in field) {
                            angular.forEach(field.aRow, function (row, rkey) {
                                angular.forEach(row.aField, function (f, fkey) {
                                    if(p.split('=')[1] === f.id) {
                                        setParams(f, key, rkey, fkey);
                                    }
                                })
                            })
                        }
                        if(p.split('=')[1] === field.id) {
                            setParams(field, key);
                        }
                    })
                });
                function setParams(field, key, rowKey, fieldKey) {
                    queryParams.params[field.id] = field.value;
                    if(key && rowKey && fieldKey) {
                        $scope.$watch('taskForm['+ key +'].aRow['+ rowKey + '].aField[' + fieldKey + '].value', function (newValue) {
                            $scope.refreshList(field.id, newValue);
                        })
                    } else {
                        $scope.$watch('taskForm['+ key +'].value', function (newValue) {
                            $scope.refreshList($scope.taskForm[key].id, newValue);
                        })
                    }
                }
                if(queryValue) {
                    queryParams.params.sFind = queryValue;
                }
            } else {
                queryParams.params[queryKey] = queryValue
            }
            $scope.requestMoreItems([]).then(function (items) {
                // $timeout(function () {
                //   $scope.$select.items = items;
                // }, 0, !angular.equals(queryParams.params[queryKey], queryValue));
                $scope.$select.items = items;
                !angular.equals(queryParams.params[queryKey], queryValue);
            });
        } else {
            tempCollection = tempCollection || $scope.$select.items;
            $scope.$select.items = $filter('filter')(tempCollection, queryValue);
        }
        // }
    };
    $scope.onSelectDataList = function (item, tableName, rowIndex, field) {
        var additionalPropertyName = getAdditionalPropertyName();
        var nameWithPostFix = getNameWithPostFix(field);
        if (rowIndex || rowIndex >= 0) {
            var form = $scope.activitiForm ? $scope.activitiForm.formProperties : $scope.taskForm;
            angular.forEach(form, function (property) {
                if (property.id === tableName) {
                    angular.forEach(property.aRow[rowIndex].aField, function (field, key, obj) {
                        if (field.id === additionalPropertyName) {
                            if(obj[key].hasOwnProperty('default')) {
                                obj[key].default = item[$scope.autocompleteData.prefixAssociatedField];
                            } else {
                                obj[key].value = item[$scope.autocompleteData.prefixAssociatedField];
                            }
                        }
                        if(nameWithPostFix && nameWithPostFix[1]) {
                            if(isNaN(parseInt(nameWithPostFix[1])) && nameWithPostFix[1] === field.id.split('_')[1]) {
                                obj[key].value = item[field.id.split('_')[0]];
                            }
                        }
                    });
                }
            });
        } else {
            if ($scope.formData && $scope.formData.params[additionalPropertyName]) {
                $scope.formData.params[additionalPropertyName].value = item[$scope.autocompleteData.prefixAssociatedField];
            } else if($scope.taskForm) {
                angular.forEach($scope.taskForm, function (field, key, obj) {
                    if(field.id === additionalPropertyName) {
                        obj[key].value = item[$scope.autocompleteData.prefixAssociatedField];
                    }
                })
            }
        }
    };
});
