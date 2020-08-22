import permission from "../common/permission.js";

let userMgmt = {
    grid: null,
    title: "Users",
    init: function () {
        common.activateNav("user-management");
        common.setTitle(userMgmt.title);
        userMgmt.layout();
    },
    layout: function () {
        let html = "";
        html += `<div class="card">
                <div class="card-body">
                <div data-list="users">  
                </div>
                </div>
                </div>`;
        common.setWorkspace(html);

        const gridDataSource = new DevExpress.data.DataSource({
            load: function () {
                const d = $.Deferred();
                $.ajax({
                    url: domain + "user/get",
                    success: function (data) {
                        d.resolve(data);
                    },
                    error: function () {
                        d.reject("Error on loading data");
                    }
                });
                return d.promise();
            },
            insert: function (values) {
                const d = $.Deferred();
                $.ajax({
                    url: domain + "user/set",
                    method: "POST",
                    data: values,
                    success: function (e) {
                        if (e.HasError) {
                            d.reject(e.Message);
                        } else {
                            d.resolve("Successfully Updated");
                        }
                    }
                });
                return d.promise();
            }
        });

        $('[data-list="users"]').dxDataGrid({
            columnHidingEnabled: true,
            dataSource: gridDataSource,
            allowColumnReordering: true,
            columnAutoWidth: true,
            wordWrapEnabled: true,
            searchPanel: {
                visible: true
            },
            editing: {
                allowAdding: true,
                allowDeleting: false,
                allowUpdating: false,
                mode: "form",
                startEditAction: "dblClick",
                texts: {
                    confirmDeleteMessage: null,
                    addRow: "Add new user"
                }
            },
            onRowRemoving: function (e) {
                e.cancel = true;
                userMgmt.delete(e);
            },
            stateStoring: {
                enabled: true,
                type: "localStorage",
                storageKey: "userMgmt"
            },
            export: {
                enabled: true,
                fileName: "User List"
            },
            showRowLines: true,
            showBorders: true,

            columns: [
                {
                    dataField: "Id",
                    visible: false,
                    formItem: {
                        visible: false
                    }
                },
                {
                    width: 60,
                    cellTemplate: function (c, o) {
                        let img = o.data.Avatar;
                        if (!img) {
                            img = dataHelper.avatarUrl;
                        }
                        c.append(`<img src="${img}" width="38" height="38" class="rounded-circle" alt="">`);
                    },
                    allowEditing: false,
                    formItem: {
                        visible: false
                    }
                },
                {
                    dataField: "Name",
                    caption: "Name",
                    validationRules: [
                        {
                            type: "required"
                        }
                    ],
                    cellTemplate: function (c, o) {
                        c.append(`<p anchor data-id='${o.data.Id}'>${o.value}</p>`);
                    },
                    width: 200
                },
                {
                    dataField: "UserName",
                    editorOptions: {
                        inputAttr: {
                            autocomplete: "new-password"
                        }
                    },
                    validationRules: [
                        {
                            type: "required"
                        },
                        {
                            type: "custom",
                            validationCallback: userMgmt.validateUsername
                        }
                    ]
                },
                {
                    dataField: "Email",
                    editorOptions: {
                        inputAttr: {
                            autocomplete: "new-password"
                        }
                    },
                    validationRules: [
                        {
                            type: "required"
                        },
                        {
                            type: "email"
                        },
                        {
                            type: "custom",
                            validationCallback: userMgmt.validateEmail
                        }
                    ]
                },
                {
                    dataField: "Password",
                    visible: false,
                    editorOptions: {
                        mode: "password",
                        elementAttr: {
                            class: "password-textbox"
                        },
                        inputAttr: {
                            autocomplete: "new-password"
                        }
                    },
                    validationRules: [
                        {
                            type: "required"
                        },
                        {
                            type: "stringLength",
                            min: 5,
                            message: "Password must have at least 5 symbols"
                        }
                    ]
                },
                {
                    dataField: "ConfirmPassword",
                    visible: false,
                    editorOptions: {
                        mode: "password"
                    },
                    validationRules: [
                        {
                            type: "compare",
                            comparisonTarget: function () {
                                var password = $(".password-textbox").dxTextBox("instance");
                                if (password) {
                                    return password.option("value");
                                }
                            },
                            message: "'Password' and 'Confirm Password' do not match."
                        }
                    ]

                },
                {
                    dataField: "Status"
                },
                {
                    formItem: {
                        visible: false
                    },
                    cellTemplate: function (c, o) {
                        let items = [
                            {
                                name: "Edit",
                                id: "edit"
                            },
                            {
                                name: "Reset Password",
                                id: "password"
                            }];

                        if (o.data.CurrentUser !== true) {
                            if (o.data.Status === true) {
                                items.push({ name: "Deactivate", id: "inactive" });
                            }
                            else {
                                items.push({ name: "Activate", id: "active" });
                            }
                        }

                        c.dxDropDownButton({
                            icon: "overflow",
                            dropDownOptions: {
                                width: 150
                            },
                            onItemClick: function (e) {
                                userMgmt.manage(e.itemData, o.data, o.component);
                            },
                            displayExpr: "name",
                            items: items
                        });


                    }
                }

            ],
            onRowPrepared: function (e) {
                if (e.rowType === "data" && e.data.Status === false) {
                    e.rowElement.addClass('table-danger');
                }
            },
            onToolbarPreparing: function (e) {
                const a = e.toolbarOptions.items.find(x => x.name === "addRowButton");
                if (a) {
                    a.options.text = "Add New";
                    a.options.width = 136;
                    a.showText = "always";
                }
                e.toolbarOptions.items.unshift({
                    locateInMenu: "always",
                    text: "Refresh",
                    onClick: function () {
                        e.component.refresh();
                    }
                },
                    {
                        locateInMenu: "always",
                        text: "Reset Layout",
                        onClick: function () {
                            localStorage.removeItem(e.component.option("stateStoring.storageKey"));
                        }
                    });
            },
            paging: {
                enabled: false
            },
            pager: {
                showInfo: true
            }
        }).dxDataGrid("instance");



    },
    manage(e, data, ctx) {
        switch (e.id) {
            case "edit":
                userMgmt.Edit(data, ctx);
                break;
            case "password":
                userMgmt.resetPassword(data, ctx);
                break;
            case "active":
                userMgmt.setActive(data, ctx);
                break;
            case "inactive":
                userMgmt.setInActive(data, ctx);
                break;
        }

    },

    Edit: function (data, ctx) {
        const _confirm = $.confirm({
            closeIcon: true,
            columnClass: "col-md-4",
            title: "Change Email",
            content: function () {
                let html = ``;
                {
                    html =
                        `<div class="col-md-12">
                            <form id="change-user" novalidate="novalidate">
                                <div class="form-group">
                                    <input type="hidden" Id = "Id"/>
                                    <label for="Email">Email</label>
                                    <input class="form-control" data-val="true" id="Email" name="Email" placeholder="Email" data-req="true" type="email">
                                </div>
                                 <div class="form-group">
                                    <label for="Name">Name</label>
                                    <input class="form-control" data-val="true" id="Name" name="Name" placeholder="Name" data-req="true" type="text">
                                </div>
                                <div class="form-group">
                                    <label for="UserName">User Name</label>
                                    <input class="form-control" data-val="true" id="UserName" name="UserName" placeholder="Username" data-req="true" type="text">
                                </div>
                                <button class="btn btn-primary" type="submit"><span class="ladda-label">Change </span></button>
                            </form>
                        </div>`;
                }
                return html;
            },

            buttons: {
                btnClose: {
                    btnClass: "btn-close-modal",
                    text: "Close",
                    isHidden: true
                }
            },
            onOpenBefore: function () {
                const frm = _confirm.$content.find("#change-user");
                common.parseAttr(frm);
                dataHelper.populateData(frm, data);
                frm.submitForm({
                    url: rootPath + "user/edit",
                    onSuccess: function (response) {
                        common.parseResponse(response,
                            function (response) {
                                ctx.refresh();
                                _confirm.close();
                            });
                    }
                });
            },
            onContentReady: function () {
                const frm = _confirm.$content.find("#change-user");
                frm.find("#Email").focus();
            }
        });

    },

    resetPassword: function (data, ctx) {
        const _confirm = $.confirm({
            closeIcon: true,
            columnClass: "col-md-4",
            title: "Reset password",
            content: function () {
                let html = ``;
                {
                    html =
                        `<div class="col-md-12">
                            <form id="change-password-user" novalidate="novalidate">
                                <div class="form-group">

                                    <input type="hidden" name="Id" id="Id" value="${data.Id}"/>
                                    <label for="Password">New password</label>
                                    <input class="form-control" data-val="true" data-val-length=" The new password must be at least 5 characters long. " data-val-length-max="100" data-val-length-min="5" data-val-required=" The new password field is required. " id="Password" name="Password" placeholder="New password " type="password">
                                    <span class="field-validation-valid" data-valmsg-for="NewPassword" data-valmsg-replace="true"></span>
                                </div>
                                <div class="form-group">
                                    <label for="ConfirmPassword">Confirm new password</label>
                                    <input class="form-control" data-val="true" data-val-equalto=" The new password and confirm password not matched. " data-val-equalto-other="*.NewPassword" id="ConfirmPassword" name="ConfirmPassword" placeholder=" Confirm new password " type="password">
                                    <span class="field-validation-valid" data-valmsg-for="ConfirmPassword" data-valmsg-replace="true"></span>
                                </div>
                                <button class="btn btn-primary" type="submit"><span class="ladda-label">Change </span></button>
                            </form>
                        </div>`;
                }
                return html;
            },

            buttons: {
                btnClose: {
                    btnClass: "btn-close-modal",
                    text: "Close",
                    isHidden: true
                }
            },
            onOpenBefore: function () {
                const frm = _confirm.$content.find("#change-password-user");
                common.parseAttr(frm);
                frm.submitForm({
                    url: rootPath + "user/resetuserpassword",
                    onSuccess: function (response) {
                        common.parseResponse(response,
                            function (response) {
                                _confirm.close();
                            });
                    }
                });
            },
            onContentReady: function () {
                const frm = _confirm.$content.find("#change-password-user");
                frm.find("#NewPassword").focus();
            }
        });

    },

    setActive: function (data, ctx) {
        $.ajax({
            url: rootPath + "user/setactivestatus/" + data.Id,
            success: function (res) {
                common.parseResponse(res, function (response) {
                    ctx.refresh();
                });
            }
        });
    },
    setInActive: function (data, ctx) {
        $.ajax({
            url: rootPath + "user/setinactivestatus/" + data.Id,
            success: function (res) {
                common.parseResponse(res, function (response) {
                    ctx.refresh();
                });
            }
        });
    },
    get: function () {
        $.ajax({
            url: rootPath + "user/get",
            success: function (result) {
                if (typeof onSuccess === "function") {
                    onSuccess(result);
                }
            }
        });
    },

    validateUsername: function (params) {
        $.ajax({
            url: rootPath + "user/validateusername",
            method: "POST",
            data: { userName: params.value, Id: params.data.Id },
            success: function (result) {
                params.rule.isValid = result.Result;
                params.rule.message = result.Message;
                params.validator.validate();
            }
        });
        return false;
    },
    validateEmail: function (params) {
        $.ajax({
            url: rootPath + "user/validateemail",
            method: "POST",
            data: { email: params.value, Id: params.data.Id },
            dataType: "json",
            contentType: "application/json",
            success: function (result) {
                params.rule.isValid = result.Result;
                params.rule.message = result.Message;
                params.validator.validate();
            }
        });
        return false;
    }
};
export default userMgmt;