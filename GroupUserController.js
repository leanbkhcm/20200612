var root = angular.module('rootApp', ['masterApp', 'GroupUserApp']);
var app = angular.module('GroupUserApp', ['ngSanitize', 'ui.select', 'ui.bootstrap.contextMenu']);

app.controller('GroupUserCtrl', function ($scope, $http, $interval) {
    $scope.IsDisabledSaveBtn = true;//20200615
    $scope.user = getSession('ee11cbb19052e40b07aac0ca060c23ee');
    $scope.user = JSON.parse($scope.user);

    $scope.currentLang = null;
    $scope.groupMenu = [];

    $scope.enableModalLDAP = false;//20200617

    //Set timer to tracking language changes
    $http.get("/lang/" + currentLang + '.usergroup.json')
        .then(function (response) {
            $scope.site = response.data;
            //$scope.menuInit();
        });

    $interval(function () {
        if (currentLang != $scope.currentLang) {
            $scope.currentLang = currentLang;
            $http.get("/lang/" + currentLang + '.usergroup.json')
                .then(function (response) {
                    $scope.site = response.data;
                    //$scope.menuInit();
                });

        }
    }, 1000);

    $scope.setOULDAPtoModal = function (selectedOuldap) {
        $scope.selectedOULDAP = selectedOuldap;
        $scope.userGroupOU = $scope.selectedOULDAP.OULDAP;
        $scope.EnableSavebtn();      
    }

    $scope.findOULDAP = function (keyword) {
        //get data from api
        $http.get(apiHost + 'admgroupuser/GetListOU?ou=' + keyword)
            .then(function (response) {
                $scope.listUsingOULDAP = response.data;
                if ($scope.listUsingOULDAP.length > 0) {
                    $scope.selectedOULDAP = $scope.listUsingOULDAP[0];
                    $scope.userGroupOU = $scope.selectedOULDAP.OULDAP;//consider in case edit                 
                }
                else {// case: have no record LDAP found by keyword
                    if ($scope.selectedUserGroup != null) {//case editing, still keep all fields
                        $scope.selectedOULDAP = null;
                        $scope.userGroupOU = $scope.selectedUserGroup.ouldap;
                    }
                    else {// case create new group
                        $scope.selectedOULDAP = null;
                        $scope.userGroupOU = null;
                    }
                }
                $scope.EnableSavebtn();
            });

        //$scope.selectedOULDAP = selectedOuldap;
        //$scope.userGroupOU = selectedOuldap.OULDAP;
        //$scope.EnableSavebtn();
    }

    //$scope.listUsingOULDAP = [
    //    { "OULDAP": "OULDAP1" },
    //    { "OULDAP": "OULDAP2" },
    //    { "OULDAP": "OULDAP3" },
    //];

    //20200617 temp removed 
    //$http.get(apiHost + 'admgroupuser/GetListOU?ou='+'')
    //    .then(function (response) {
    //        $scope.listUsingOULDAP = response.data;
    //    });


    // Get projects list
    $http.get(apiHost + 'admproject')
        .then(function (response) {
            $scope.projects = response.data;
            // If has parameter: project
            if (projectId != null) {
                let index = $scope.projects.findIndex(project => project.projectID === projectId);
                if ($scope.projects[index] != null) {
                    $scope.LoadGroupUser($scope.projects[index]);
                }

            }
            //.If has parameter: project
            //console.log($scope.projects);
        });

    // Load Group User
    $scope.LoadGroupUser = function (project) {
        //$http.get(apiHost + 'AdmProject/GetListGrpUserByPrjID?projectID=' + project.projectID) //removed 20200615 
        $http.get(apiHost + 'AdmGroupUser/GetAllGroupUsersByProjectID?projectID=' + project.projectID)  //change to GetAllGroupUsersByProjectID on 20200615 
            .then(function (response) {
                $scope.selectedProject = project;
                $scope.userGroups = response.data;

            });
    }

    //$('#tableGroupUser').dataTable();
    // Select GroupUser
    $scope.SelectGroupUser = function (userGroup) {
        $scope.selectedUserGroup = userGroup;

        $scope.userGroupCode = userGroup.groupUserId;
        $scope.userGroupName = userGroup.groupUsername;
        $scope.userGroupDesc = userGroup.description;
        $scope.userGroupOU = userGroup.ouldap;

        ////20200616
        //if ($scope.listUsingOULDAP.length > 0) {
        //    let index = $scope.listUsingOULDAP.findIndex(group => group.OULDAP === userGroup.ouldap);
        //    if ($scope.listUsingOULDAP[index] != null) {
        //        $scope.selectedOULDAP = $scope.listUsingOULDAP[index];
        //    }
        //}
    }



    //20200615
    $scope.EnableSavebtn = function () {
        if ($scope.userGroupName != null && $scope.userGroupOU != null) {
            if ($scope.userGroupName.length > 0)
                $scope.IsDisabledSaveBtn = false;
        }
        else
            $scope.IsDisabledSaveBtn = true;
    }

    //20200617
    $scope.showModalLDAP = function () {
        $scope.enableModalLDAP = true;
    }

    $scope.closeModalLDAP = function () {
        $scope.enableModalLDAP = false;
    }

    // New GroupUser GroupUser
    $scope.NewGroupUser = function () {
        //20200615
        $scope.IsDisabledSaveBtn = true;

        if ($scope.selectedProject == null) {
            swal($scope.site.dl_warning, $scope.site.dg_noproject, "warning");
            return;
        }

        //if ($scope.listUsingOULDAP.length > 0)
        //    $scope.selectedOULDAP = $scope.listUsingOULDAP[0];//20200616
        $scope.selectedOULDAP = null; //20200616 error
        $scope.keywordOULDAP = null;//20200617
        $scope.userGroupOU = null;
        $scope.enableModalLDAP = false;//20200617

        //20200615
        $("#modalGroupUser").modal({
            backdrop: 'static',
            keyboard: false
        });

        $('#modalGroupUser').modal('show');
        $scope.selectedUserGroup = null;
        $scope.userGroupCode = null;
        $scope.userGroupName = null;
        $scope.userGroupDesc = null;
    }
    // Edit GroupUser GroupUser
    $scope.EditGroupUser = function () {
        if ($scope.selectedUserGroup == null) {
            swal($scope.site.dl_warning, $scope.site.dg_nogroup, "warning");
        }
        else {
            //20200615
            $scope.IsDisabledSaveBtn = false;
            $("#modalGroupUser").modal({
                backdrop: 'static',
                keyboard: false
            });

            $('#modalGroupUser').modal('show');
        }
    }

    $scope.DeleteGroupUser = function () {
        if ($scope.selectedUserGroup == null) {
            swal($scope.site.dl_warning, $scope.site.dg_nogroup, "warning");
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
                        console.log($scope.selectedUserGroup);
                        $http.delete(apiHost + 'admgroupuser/DeleteGroupUser?gUserID=' + $scope.selectedUserGroup.groupUserID, null, 'application/json').then(function (response) { //20200615 change from $scope.selectedUserGroup.groupUserId to $scope.selectedUserGroup.groupUserID

                            // This function handles success

                            let index = $scope.userGroups.findIndex(group => group.groupUserID === $scope.selectedUserGroup.groupUserID);//20200615
                            $scope.userGroups.splice(index, 1);
                            $scope.selectedUserGroup = null;
                            swal($scope.site.dg_success, $scope.site.dl_deletesuccess, "success");
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

    $scope.SaveChanges = function () {
        // If create UserGroup
        if ($scope.selectedUserGroup == null) {
            $scope.userGroup = {};
            $scope.userGroup.groupUserID = $scope.userGroupCode;
            $scope.userGroup.groupUsername = $scope.userGroupName;
            $scope.userGroup.description = $scope.userGroupDesc;

            //20200617
            if ($scope.userGroup.ouldap != $scope.selectedOULDAP.OULDAP)
                $scope.userGroupOU = $scope.selectedOULDAP.OULDAP;
            $scope.userGroup.ouldap = $scope.userGroupOU;//edited 20200616 

            $scope.userGroup.projectID = $scope.selectedProject.projectID;

            $scope.userGroup.userCreate = $scope.user.userID;
            $scope.userGroup.dateCreate = new Date();

            $http.post(apiHost + 'admGroupUser/', JSON.stringify($scope.userGroup), 'application/json').then(function (response) {
                // This function handles success
                //console.log(response);
                // if create successfully

                $scope.userGroup = response.data;
                $scope.userGroup.groupUserId = response.data.groupUserID;
                $scope.userGroups.push($scope.userGroup);
                $scope.userGroup = null;
                $scope.IsDisabledSaveBtn = true;

                $scope.selectedOULDAP = null;// 20200617

                $('#modalGroupUser').modal('hide');
                swal($scope.site.dg_success, $scope.site.dg_savesuccess, "success");
                // alert(response.data);
            }, function (response) {
                // this function handles error
                if (response.status == 500) {
                    swal("Error", response.data, "error");
                }
                else {
                    //swal("Error: " + response.data.title, response.data.errors.ProjectName[0], "error");//removed 20200615
                    swal("Error: " + response.data.title, "error");
                }
            });
        }
        // If update project
        else {
            $scope.userGroup = {};
            $scope.userGroup = $scope.selectedUserGroup;
            // $scope.project.projectID = $scope.projectCode;
            //$scope.userGroup.groupUserID = $scope.userGroupCode;
            $scope.userGroup.groupUsername = $scope.userGroupName;
            $scope.userGroup.description = $scope.userGroupDesc;

            //20200617
            if ($scope.selectedOULDAP != null)
                if ($scope.userGroup.ouldap != $scope.selectedOULDAP.OULDAP)
                    $scope.userGroupOU = $scope.selectedOULDAP.OULDAP; 20200616
            $scope.userGroup.ouldap = $scope.userGroupOU;

            $scope.userGroup.projectID = $scope.selectedProject.projectID;
            $scope.userGroup.userUpdate = $scope.user.userID;
            $scope.userGroup.dateUpdate = new Date();

            $http.put(apiHost + 'AdmGroupuser/UpdateGroupUser?grpUserID=' + $scope.userGroup.groupUserID, JSON.stringify($scope.userGroup), 'application/json').then(function (response) {
                let index = $scope.userGroups.findIndex(usrGroup => usrGroup.groupUserID === $scope.userGroup.groupUserID);
                $scope.userGroups[index] = response.data;
                $scope.userGroup = null;
                $scope.IsDisabledSaveBtn = true;//20200615

                $scope.selectedOULDAP = null;// 20200617
                $scope.selectedUserGroup = null;//20200617

                $('#modalGroupUser').modal('hide');
                swal($scope.site.dg_success, $scope.site.dg_savesuccess, "success");
                // alert(response.data);
            }, function (response) {
                // this function handles error
                if (response.status != 400) {
                    swal("Error", response.data, "error");
                }
                else {
                    swal("Error: " + response.data.title, response.data.errors.ProjectName[0], "error");
                }
                // console.log(response );
            });

            //------------------

        }
    }

    $scope.UsersList = function () {
        if ($scope.selectedProject == null) {
            swal($scope.site.dl_warning, $scope.site.dg_noproject, "warning");
        }
        else if ($scope.selectedUserGroup == null) {
            swal($scope.site.dl_warning, $scope.site.dg_nogroup, "warning");
        }
        else {
            window.location.href = '/SpecialUser?projectId=' + $scope.selectedProject.projectID + '&groupId=' + $scope.selectedUserGroup.groupUserID;
        }

    }

    $scope.menuInit = function () {
        // Menu context
        $scope.groupMenu = [
            // NEW IMPLEMENTATION
            {
                text: $scope.site.btn_new,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.NewGroupUser();
                    console.log($itemScope.groupUser);

                }
            },
            {
                text: $scope.site.btn_edit,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.SelectGroupUser($itemScope.groupUser);
                    $scope.EditGroupUser();
                }
            },
            {
                text: $scope.site.btn_delete,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.SelectGroupUser($itemScope.groupUser);
                    $scope.DeleteGroupUser();
                }
            },
            {
                text: $scope.site.btn_userlist,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    $scope.SelectGroupUser($itemScope.groupUser);
                    $scope.UsersList();
                }
            }

        ];
        //Menu context
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