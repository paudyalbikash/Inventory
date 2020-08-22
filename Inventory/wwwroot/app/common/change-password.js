let changePassword = {
    init: function () {
        const _confirm = $.confirm({
            closeIcon: true,
            columnClass: "col-md-4",
            title: "Change password",
            content: function () {
                let html = ``;
                {
                    html =
                        `<div class="col-md-12">
                            <form id="change-password" novalidate="novalidate">
                                <div class="form-group">
                                    <label for="CurrentPassword">Current password</label>
                                    <input class="form-control" data-val="true" data-val-required=" The Current password field is required. " id="CurrentPassword" name="CurrentPassword" placeholder=" Current password " type="password">
                                    <span class="field-validation-valid" data-valmsg-for="CurrentPassword" data-valmsg-replace="true"></span>
                                    <span class="field-validation-valid" data-valmsg-for="OldPassword" data-valmsg-replace="true"></span>
                                </div>
                                <div class="form-group">
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
                const frm = _confirm.$content.find("#change-password");
                common.parseAttr(frm);
                frm.submitForm({
                    url: rootPath + "user/changepassword",
                    onSuccess: function (response) {
                        common.parseResponse(response,
                            function (response) {
                                _confirm.close();
                            });
                    }
                });
            },
            onContentReady: function () {
                const frm = _confirm.$content.find("#change-password");
                frm.find("#CurrentPassword").focus();
            }
        });
    }
};

export default changePassword;