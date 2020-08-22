var rootPath = '/';
var common = {
    setFancyBox: function (ctx) {
        $(ctx).fancybox({
            selector: ctx,
            thumbs: {
                autoStart: true
            },
            caption: function () { return $(this).attr('caption'); }
        });
    },

    setDocumentViewer: function (ctx) {
        $(ctx).fancybox({
            closeBtn: true,
            toolbar: false,
            caption: function () { return $(this).attr('caption'); },
            iframe: {
                preload: false
            }
        });
    },

    getYearList: function (ctx, selected, label) {
        let html = '';
        if (label !== false && label !== null) {
            html = '<option value="">Year</option>';
        }
        else if (label !== null) {
            html += '<option value="">' + label + '</option>';
        }

        for (let i = 2074; i <= 2080; i++) {
            let _selected = i === selected ? 'selected=""' : '';
            html += '<option value="' + i + '" ' + _selected + '>' + i + '</option>';
        }
        if (ctx) {
            $(ctx).html(html);
        }
        return html;
    },

    getMonthList: function (ctx, selected, label) {
        let html = '';
        if (label !== false && label !== null) {
            html = '<option value="">Month</option>';
        }
        else if (label !== null) {
            html += '<option value="">' + label + '</option>';
        }

        let month = '';
        for (let i = 1; i <= 12; i++) {
            let _selected = i === selected ? 'selected=""' : '';
            month = i === 1 ? 'Baishakh' : i === 2 ? 'Jestha' : i === 3 ? 'Ashadh' : i === 4 ? 'Srawan' : i === 5 ? 'Bhadra' : i === 6 ? 'Aswin' : i === 7 ? 'Kartik' : i === 8 ? 'Mansir' : i === 9 ? 'Paush' : i === 10 ? 'Magh' : i === 11 ? 'Falgun' : i === 12 ? 'Chaitra' : '';
            html += '<option value="' + i + '" ' + _selected + '>' + month + '</option>';
        }
        if (ctx) {
            $(ctx).html(html);
        }
        return html;
    },

    getRandomText: function (len, upper) {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let _len = len ? len : 5;
        for (let i = 0; i < _len; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        if (!upper)
            return text.toLowerCase();
        return text.toUpperCase();
    },

    getRandomNumber: function (negative) {
        let text = "";
        let possible = "0123456789";
        let _len = 5;
        for (let i = 0; i < _len; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return parseNumber(negative ? '-' + text : text);
    },

    launch: function () {
        $(document).on('click', '[data-dismiss="modal"]', function () {
            $(this).closest('.jconfirm-open').find('.jconfirm-closeIcon').trigger('click');
        });

        $(document).on('click', 'a.nav-link.nav-modules', function () {
            if ($(this).attr('nav')) {
                common.activateNav($(this).attr('nav'));
            }
        });

        $(document).on('click', '#tab-container > li.nav-item > span', function () {
            var anchor = $(this).prev();
            $(anchor.attr('href')).remove();
            $('.fav-icon').removeClass('active');
            $(this).parent().remove();
            if ($('[work-space]').find('li.nav-item').length === 0) {
                $('[work-space]').empty();
                let url = '?p=';
                window.history.pushState(null, null, url);
            }

            $('#tab-container .nav-modules').last().click();
        });

        $(document).on('click', '#tab-container .nav-modules', function (e) {
            e.preventDefault();
            common.activateTab(this.id);
        });
    },

    setSelectedByText: function (ctx, text) {
        let item = $(ctx).find('option').filter(function () { return $(this).html() === text; }).val();
        if (typeof item !== 'undefined') {
            $(ctx).val(item);
        }
    },

    parseToJson: function (response, json) {
        if (response && typeof response !== 'object') {
            json = JSON.parse(response);
        }
        return json;
    },

    getSelectListText: function (ctx) {
        if (!ctx)
            return '';
        return $('option:selected', $(ctx)).text();
    },

    resetForm: function (form) {
        $(form).find(":input[type='checkbox']").attr('checked', false);
        $(form).find("#Id").val('');
        $(form).trigger('reset');
        $('option[selected]', $(form)).removeAttr('selected');
        $('option[value=""]', $(form)).val('');
        $(form).find('.chosen-select').chosen('destroy');
        $(form).find('.chosen-select').chosen('update');
    },

    validateResponse: function (response) {
        if (response && response.redirectUrl) {
            $('.btn-close-modal').trigger('click');
            location.href = response.redirectUrl;
            return false;
        }
        return true;
    },

    parseResponse: function (response, onSuccess) {
        if (response && !response.HasError && response.Response) {
            if (typeof onSuccess === 'function') {
                if (typeof response.Response === 'object') {
                    onSuccess(response.Response);
                } else {
                    onSuccess(JSON.parse(response.Response));
                }
            }
        } else {
            onSuccess(new Array());
        }
    },

    isFunction: function (response) {
        return typeof response === 'function';
    },

    setTabContent: function (moduleId, title, nav, container, overwrite, code) {
        if (overwrite) {
            let ctx = $('a[href="#' + moduleId + '"]');
            ctx.closest('.nav-item').find('span').trigger('click');
        }

        if ($('#' + moduleId + '-tab').length > 0) {
            $('#' + moduleId + '-tab').trigger("click");
        } else {
            if ($('#tab-container').length === 0) {
                let _tab = `<ul class="nav nav-tabs topnav" role='tablist' id='tab-container'></ul>`;
                _tab += `<div class="tab-content" id='page-tab-content'></div>`;
                $('[work-space]').html(_tab);
            }
            let _li = `<li  class='nav-item relative'><a class="nav-link nav-modules" nav="${nav ? nav : ''}" id="${moduleId}-tab" href="#${moduleId}">${title}</a><span>x</span></li>`;
            $('#tab-container').append(_li);
            let html = `<div class="tab-pane" id="${moduleId}" role="tabpanel" aria-labelledby="${moduleId}-tab">`;
            if (container)
                html += container;
            html += `</div>`;

            $('#page-tab-content').append(html);
            $('.nav-tabs a[href="#' + moduleId + '"]').click();
            common.activateNav(nav, code);
        }

        common.removeOverlay();
    },

    activateTab: function (tab) {
        $("#tab-container .nav-modules").removeClass("active show");
        $('#' + tab).addClass("active show");
        $('#page-tab-content .tab-pane').removeClass("active show");
        $($('#' + tab).attr("href")).addClass("active show");
    },

    setWorkspace: function (value, ctx) {
        if (!ctx)
            ctx = $('[work-space]');
        $(ctx).html(value);
    },

    setLocalStorage: function (key, val) {
        localStorage.setItem(key, val);
    },

    getLocalStorage: function (key, number) {
        let val = localStorage.getItem(key);
        if (number && val)
            return parseNumber(val);
        return val;
    },

    setTitle(title) {
        if (title && $('[header-title]').length > 0) {
            let htm = `<h1>${title}</h1>`;
            $('[header-title]').html(htm);
        }
    },

    clearLocalStorage: function (key) {
        localStorage.removeItem(key);
    },

    hideSidebar: function () {
        $('body').addClass('sidebar-xs').removeClass('sidebar-mobile-main');
    },

    showSideBar: function () {
        $('body').removeClass('sidebar-xs').addClass('sidebar-mobile-main');
    },

    activateNav: function (txt, code, noroute) {
        let ctx = $('[data-nav="' + txt + '"]');
        if (code)
            ctx = $('[data-nav="' + txt + '"][data-code="' + code + '"]');
        if (!ctx.length)
            return;
        $('.fav-icon').removeClass('active');
        $('.nav-item').removeClass('active');
        $('.nav-item').removeAttr('active');
        $('.anchor[data-nav]').removeClass('active');
        let parent = $(ctx).closest('#childNav').attr('data-parent');
        if (parent) {
            $('[data-item="' + parent + '"]').addClass('active');
            $('#childNav[data-parent="' + parent + '"]').show();
        }
        parent = $(ctx).closest('[data-parent]');
        if (parent) {
            parent = parent.attr('data-parent');
            $('.nav-item[data-item="' + parent + '"]').addClass('active');
        }
        $(ctx).addClass('active');
        if (!noroute) {
            let p = $(ctx).attr('data-nav');
            let c = $(ctx).attr('data-code');
            this.updateUrl(p, c);
        }
    },

    updateUrl: function (top, child) {
        const uParam = new URLSearchParams(window.location.search);
        const p = uParam.get('p');
        const c = uParam.get('c');
        if (p !== top || parseString(c) !== parseString(child)) {
            let data = {
                parent: top,
                child: child
            };
            let url = '?p=' + top;
            if (child)
                url += '&c=' + child;
            window.history.pushState(data, null, url);
        }
    },

    removeOverlay: function () {
        $('.sidebar-overlay.open').trigger('click');
    },

    manageHistory: function () {
        const uParam = new URLSearchParams(window.location.search);
        const p = uParam.get('p');
        const c = uParam.get('c');
        if (p) {
            let parent = $('[data-nav="' + p + '"]');
            if (c) {
                parent = $('[data-nav="' + p + '"][data-code="' + c + '"]');
            }
            if (parent) {
                $(parent).first().trigger('click');
            }
        }
        else {
            $("[data-nav='dashboard']").click();
        }
        

        //common.activateModule();
    },

    parseAttr: function (form) {
        $('input[type=password],input[type=time],input[type=date],input[type=email],input[type=text],textarea,input[type=number],select,input[type=hidden], input[type=color]', $(form)).each(function () {
            let id = $(this).attr('id');

            if ($(this).attr('data-label') && $(this).closest('div').find('label[for="' + id + '"]').length === 0) {
                let lblHtml = '<label for="' + id + '">' + $(this).attr('data-label') + '</label>';
                if ($(this).attr('data-description')) {
                    lblHtml += `<span class="description">` + $(this).attr('data-description') + `</span>`;
                }
                $(this).closest('div:not(.input-group)').prepend(lblHtml);
            }
            let label = $('label[for="' + $(this).attr('id') + '"]', $(form));

            let text = label.text();

            if (!$(this).attr('name')) {
                $(this).attr('name', id);
            }
            $(this).attr('data-val', true);
            if ($(this).attr('type') === 'Email' || $(this).attr('type') === 'email') {
                $(this).attr('data-val-email', 'Not a valid email address.');
                $(this).attr('data-val-regex', 'Not a valid email address.');
            }

            if ($(this).attr('type') === 'number') {
                $(this).attr('data-val-number', 'The field ' + text.toLowerCase() + ' must be a number.');
            }

            if ($(this).attr('data-req')) {
                if (!$(this).attr('data-val-required')) {
                    $(this).attr('data-val-required', 'The ' + text.toLowerCase() + ' field is required.');
                }
            }
            if (!$(this).attr('placeholder') && $(this).attr('type') !== 'hidden') {
                $(this).attr('placeholder', text);
            }
            if ($(this).closest('[parent]').length > 0) {
                $(this).closest('[parent]').append('<span class="field-validation-valid" data-valmsg-for="' + id + '" data-valmsg-replace="true"></span>');
            }
            else if (!$(this).is(":hidden") && $(this).closest('div:not(.input-group)').find('[data-valmsg-for="' + id + '"]').length === 0) {
                $(this).closest('div:not(.input-group)').append('<span class="field-validation-valid" data-valmsg-for="' + id + '" data-valmsg-replace="true"></span>');
            }
            if ($(this).attr('data-req') && label.find('.req-flag').length === 0) {
                label.append('<span class="req-flag"> *</span>');
            }
            if ($(this).hasClass('fcr')) {
                $(this).removeClass('fcr');
                $(this).addClass('form-control-rounded');
            }
            if ($(this).hasClass('fc')) {
                $(this).removeClass('fc');
                $(this).addClass('form-control');
            }
            if ($(this).hasClass('fc-sm')) {
                $(this).removeClass('fc-sm');
                $(this).addClass('form-control-sm');
            }
            if ($(this).hasClass('chosen-select')) {
                common.setChosen($(this));
            }

        });
        if ($(form).find(":submit").hasClass('ladda-button')) {
            $(form).find(':submit').attr('data-style', 'expand-left');
            let btnText = $(form).find(':submit').text();
            $(form).find(':submit').html('<span class="ladda-label">' + btnText + '</span>');
        }
        setTimeout(function () {
            common.initMitiMask();
            $.validator.unobtrusive.parse($(form));
        }, 200);
        $(form).find('a').attr('tabindex', -1);
        $.validator.setDefaults({ ignore: ":hidden:not(select)" });
    },

    setMask: function (ctx, mask, placeholder) {
        let _mask = mask ? mask : $(ctx).attr('data-mask') ? $(ctx).attr('data-mask') : '';
        let _placeholder = placeholder ? placeholder : $(ctx).attr('mask-placeholder') ? $(ctx).attr('mask-placeholder') : '';
        $(ctx).inputmask(_mask, {
            placeholder: _placeholder
        });
    },

    setChosen: function (ctx, optionalLabel) {
        if ($(ctx).length === 0)
            return false;
        $(ctx).attr('data-placeholder', optionalLabel);
        $(ctx).chosen('destroy');
        $(ctx).chosen({
            width: $(ctx).attr('data-width') ? $(ctx).attr('data-width') : '100%',
            allow_single_deselect: true,
            no_results_text: "Oops, nothing found!"
        });
        $(ctx).chosen('update');
    },

    initMitiMask: function (ctx) {
        if (ctx) {
            $(ctx).attr('autocomplete', "off");
            setTimeout(function () {
                common.setMask(ctx, '9999-99-99', 'yyyy-MM-dd');
                //$(ctx).nepaliDatePicker({
                //    npdMonth: true,
                //    npdYear: true,
                //    npdYearCount: 10
                //});
            }, 200);
        }
        else {
            $(".mask-miti").attr('autocomplete', "off");
            setTimeout(function () {
                common.setMask('.mask-miti', '9999-99-99', 'yyyy-MM-dd');
                $('.mask-miti').npdatepicker({
                    //daysOfWeekDisabled: [6],
                    language: "np",
                    todayHighlight: true,
                    autoclose: true,
                    clearBtn: true,
                    todayBtn: true
                });
            }, 200);
        }

        common.setMask('[mask="miti"]', '9999-99-99', 'yyyy-MM-dd');

        $(document).on('keyup', ".mask-miti", function (e) {
            if (e.keyCode === 46) {
                $(this).val(null);
            }
        });

        $(document).on('keyup', '[mask="miti"]', function (e) {
            if (e.keyCode === 46) {
                $(this).val(null);
            }
        });
    },

    lockForm: function (form) {
        $('[data-temp-field]').remove();
        var btn = $(form).find(':submit');
        $(btn[0]).attr('disabled', 'disabled');
    },

    unlockForm: function (form) {
        $('[data-temp-field]').remove();
        gotVal = true;
        var btn = $(form).find(':submit');
        $(btn[0]).attr('disabled', false);
    },

    handleError: function (response) {
        if (response.Key) {
            if (response.Key.startsWith('[')) {
                $(response.Key).trigger('click');
            } else {
                $('[data-valmsg-for="' + response.Key + '"]').html('<span for="' + response.Key + '">' + response.Message + '</span>');
                $('[data-valmsg-for="' + response.Key + '"]').removeClass('field-validation-valid');
                $('[data-valmsg-for="' + response.Key + '"]').addClass('field-validation-error');
                $('#' + response.Key).addClass('input-validation-error');
                $('#' + response.Key).focus();
            }
        }

        if (response.Message) {
            common.displayError(response.Message, 'Error!!!');
        } else if (response && response.responseJSON && response.responseJSON.message) {
            common.displayError(response.responseJSON.message, 'Error!!!');
        }
        else {
            common.displayError('Unable to process your request. Please try again later.', 'Error!!!');
        }
    },

    displayMessage: function (message, title) {
        new PNotify({
            title: title || "Success",
            text: message,
            icon: 'icon-checkmark3',
            type: 'success',
            delay: 2000
        });
    },

    displayInfoMessage: function (message, title) {
        new PNotify({
            title: message,
            text: title || "Info",
            addclass: 'alert alert-warning ',
            type: 'error',
            delay: 2000

        });
    },

    displayError: function (message, title) {
        new PNotify({
            title: title ? title : 'Error!!!',
            text: message,
            icon: 'icon-blocked',
            type: 'error',
            delay: 2000
        });
    },

    handleMessage: function (response, message) {
        if (response.HasError && response.Message) {
            common.displayError(response.Message);
            if (response.Key) {
                $('[data-valmsg-for="' + response.Key + '"]').html('<span for="' + response.Key + '">' + response.Message + '</span>');
                $('[data-valmsg-for="' + response.Key + '"]').removeClass('field-validation-valid');
                $('[data-valmsg-for="' + response.Key + '"]').addClass('field-validation-error');
                $('#' + response.Key).addClass('input-validation-error');
                $('#' + response.Key).focus();
            }
        }
        else if (!response.HasError && !message) {
            if (response.Message) {
                common.displayMessage(response.Message);
            } else {
                common.displayMessage('Successfully processed your request.');
            }
        } else if (!response.HasError && message) {
            common.displayMessage(message);
        }
        else if (response.HasError) {
            common.displayError('Unable to process your request, Please try again later.');
        }
    },

    displayDelete: function (response, message) {
        if (response.HasError) {
            if (response.Message) {
                this.displayError(response.Message);
            } else {
                this.handleError(response);
            }
        } else if (!response.HasError && message) {
            this.displayMessage(message);
        } else if (message) {
            this.displayMessage(message);
        } else {
            this.displayMessage(messaging.deletedMessage);
        }
    }
};

$(document).ready(function () {
    common.launch();
});

window.onpopstate = function (e) {
    if (e.state) {
        common.manageHistory();
    }
};

$(document).ready(function () {
    setTimeout(function () {
        common.manageHistory();
    }, 200);
});