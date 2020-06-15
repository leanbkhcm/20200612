var projectId;
var root = angular.module('rootApp', ['masterApp', 'functionApp']);
var app = angular.module('functionApp', ['ngSanitize', 'ui.select', 'ui.bootstrap.contextMenu']);
app.controller('functionCtrl', function ($scope, $http, $interval) {
    $scope.currentLang = null;
    $scope.functionMenu = [];
    //20200616
    $scope.inputFunctionIdx = 1;
    $scope.IsDisabledSaveBtn = true;

    //Set timer to tracking language changes
    $http.get("/lang/" + currentLang + '.functions.json')
        .then(function (response) {
            $scope.site = response.data;
            $scope.menuInit();
        });

    $interval(function () {
        if (currentLang != $scope.currentLang) {
            $scope.currentLang = currentLang;
            $http.get("/lang/" + currentLang + '.functions.json')
                .then(function (response) {
                    $scope.site = response.data;
                    $scope.menuInit();
                });

        }
    }, 1000);

    $scope.user = getSession('ee11cbb19052e40b07aac0ca060c23ee');
    $scope.user = JSON.parse($scope.user);
    // Get projects list
    $http.get(apiHost + 'admproject')
        .then(function (response) {
            $scope.projects = response.data;
            //console.log($scope.projects);
            // If has parameter: project
            if (projectId != null) {
                let index = $scope.projects.findIndex(project => project.projectID === projectId);
                if ($scope.projects[index] != null) {
                    $scope.LoadFunctions($scope.projects[index]);
                }

            }
            //.If has parameter: project
        });

    //$('#tableFunction').dataTable();
    // Load Functions
    $scope.LoadFunctions = function (project) {
        $http.get(apiHost + 'admfunction/GetFunctionsByProjectID?id=' + project.projectID)
            .then(function (response) {
                $scope.selectedProject = project;
                $scope.functions = response.data;
                //data = response.data;//20200616 removed
               
            });
    }
    //Select Function
    $scope.SelectFunction = function (funct) {
        $scope.selectedFunction = funct;

        $scope.functionCode = funct.functionID;
        $scope.functionName = funct.functionName;
        $scope.functionDesc = funct.functDescription;
        $scope.functionStatus = funct.status;
        $scope.functionIdx = funct.idx;
    }
    // New function function
    $scope.NewFunction = function () {
        //20200616
        if ($scope.selectedProject == null) {
            swal($scope.site.dl_warning, $scope.site.dg_noproject, "warning");
            return;
        }
        //$scope.StatusAcessGrp.selectedOption.status = $scope.StatusAcessGrp.availableOptions[0].status;//20200611 set default active as create new //20200613 temp remove
        $scope.IsDisabledSaveBtn = true;
        $("#modalFunction").modal({
            backdrop: 'static',
            keyboard: false
        });

        $('#modalFunction').modal('show');
        $scope.selectedFunction = null;
        $scope.functionCode = null;
        $scope.functionName = null;
        $scope.functionDesc = null;
        $scope.functionStatus = null;
        $scope.functionIdx = null;
    }
    // Edit function function
    $scope.EditFunction = function () {
        if ($scope.selectedFunction == null) {
            swal($scope.site.dl_warning, $scope.site.dg_nofunction, "warning");
        }
        else {
            //20200616
            //$scope.StatusAcessGrp.selectedOption.status = $scope.selectedAccessGroup.status;//20200613 temp remove
            $scope.IsDisabledSaveBtn = false;
            $("#modalFunction").modal({
                backdrop: 'static',
                keyboard: false
            });

            $('#modalFunction').modal('show');
        }
    }
    // Delete function function
    $scope.DeleteFunction = function () {
        if ($scope.selectedFunction == null) {
            swal($scope.site.dl_warning, $scope.site.dg_nofunction, "warning");
        }
        else {
            swal({
                title: $scope.site.dl_confirm,
                text: $scope.site.dl_notice,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55", confirmButtonText: $scope.site.btn_ok,
                cancelButtonText: $scope.site.btncancel,
                closeOnConfirm: true,
                closeOnCancel: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        $http.delete(apiHost + 'admfunction/deleteFunction?functionID=' + $scope.selectedFunction.functionID, null, 'application/json').then(function (response) {

                            // This function handles success
                            swal($scope.site.dg_success, $scope.site.dl_deletesuccess, "success");
                            let index = $scope.functions.findIndex(funct => funct.functionID === $scope.selectedFunction.functionID);
                            $scope.functions.splice(index, 1);

                            // alert(response.data);
                        }, function (response) {
                            // this function handles error
                            swal("Error!", response.data, "error");
                        });

                        //------------------

                    } else {
                        //swal("Cancelled", "Cancelled!", "error");
                    }
                });
        }
    }
    //Save changes
    $scope.SaveChanges = function () {
        // If create project
        if ($scope.selectedFunction == null) {
            $scope.function = {};
            $scope.function.functionID = $scope.functionCode;
            $scope.function.projectID = $scope.selectedProject.projectID;
            $scope.function.functionName = $scope.functionName;
            $scope.function.description = $scope.functionDesc;
            $scope.function.idx = $scope.functionIdx;
            $scope.function.status = $scope.functionStatus;
            $scope.function.userCreate = $scope.user.userID;
            $scope.function.dateCreate = new Date();

            $http.post(apiHost + 'admfunction/', JSON.stringify($scope.function), 'application/json').then(function (response) {
                // This function handles success
                //console.log(response);
                // if create successfully
                //functDescription
                $scope.function = response.data;
                $scope.functions.push(response.data);
                //data.push(response.data);//20200616 removed

                //$scope.function = null;
                $scope.IsDisabledSaveBtn = true;//20200616
                $('#modalFunction').modal('hide');
                swal($scope.site.dg_savesuccess, $scope.site.dg_savesuccess, "success");                
            }, function (response) {
                // this function handles error
                if (response.status == 500) {
                    swal("Error", response.data, "error");
                }
                else {
                    //swal("Error: " + response.data.title, response.data.errors.FunctionName[0], "error");
                    swal("Error: " + response.data.title, "error");
                }
                // console.log(response );
            });

            //------------------
        }
        // If update project
        else {
            $scope.function = $scope.selectedFunction;
            // $scope.project.projectID = $scope.projectCode;
            $scope.function.functionName = $scope.functionName;
            $scope.function.description = $scope.functionDesc;
            $scope.function.idx = $scope.functionIdx;
            $scope.function.status = $scope.functionStatus;
            $scope.function.userUpdate = $scope.user.userID;
            $scope.function.dateUpdate = new Date();

            $http.put(apiHost + 'admfunction/UpdateFunction?funcID=' + $scope.function.functionID, JSON.stringify($scope.function), 'application/json').then(function (response) {
                // This function handles success
                //console.log(response);
                // if update successfully
                let index = $scope.functions.findIndex(funct => funct.functionID === $scope.functions.functionID);
                $scope.functions[index] = response.data;
                $scope.functions[index].functDescription = response.data.description;
                $scope.function = null;
                $scope.IsDisabledSaveBtn = true;//20200616
                $('#modalFunction').modal('hide');
                swal($scope.site.dg_savesuccess, $scope.site.dg_savesuccess, "success");   
            }, function (response) {
                // this function handles error
                if (response.status != 400) {
                    swal("Error", response.data, "error");
                }
                else {
                    swal("Error", response.data, "error");
                    //swal("Error: " + response.data.title, response.data.errors.FunctionName[0], "error");
                }
                // console.log(response );
            });

            //------------------

        }
    }
    $scope.CommandsList = function () {
        if ($scope.selectedProject == null) {           
            swal($scope.site.dl_warning, $scope.site.dg_noproject, "warning");
        }
        else if ($scope.selectedFunction == null) {            
            swal($scope.site.dl_warning, $scope.site.dg_nofunction, "warning");
        }
        else {
            window.location.href = '/Command?projectId=' + $scope.selectedProject.projectID + '&functionId=' + $scope.selectedFunction.functionID;
        }

    }
    $scope.menuInit = function () {
        //Context Menu
        $scope.functionMenu = [
            // NEW IMPLEMENTATION
            {
                text: $scope.site.btn_new,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.NewFunction();
                    console.log($itemScope.function);

                }
            },
            {
                text: $scope.site.btn_edit,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.SelectFunction($itemScope.function);
                    $scope.EditFunction();
                }
            },
            {
                text: $scope.site.btn_delete,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.SelectFunction($itemScope.function);
                    $scope.DeleteFunction();
                }
            },
            {
                text: $scope.site.btn_commands,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.SelectFunction($itemScope.function);
                    $scope.CommandsList();
                }
            }

        ];
        //Menu context
    }

    //20200616
    $scope.EnableSavebtn = function () {
        if ($scope.functionName == null /*|| $scope.accessIdx == null*/) {
            $scope.IsDisabledSaveBtn = true;
            return;
        }

        if (($scope.functionName.length > 0) /*&& ($scope.accessIdx > -1) && ($scope.accessIdx < 100)*/) //range for accessIdx is from 0 to 99
            $scope.IsDisabledSaveBtn = false;
        else
            $scope.IsDisabledSaveBtn = true;
    }
});

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});