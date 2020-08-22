/// <reference path="device.js" />
/// <reference path="common.js" />
/// <reference path="messeging.js" />
var dataHelper = {
    destGrid: null,
    avatarUrl: domain + '/global_assets/images/placeholders/user.png',
    find: function (data, id) {
        if (id) {
            let _item = data.find(x => x.Id === parseNumber(id));
            return _item ? _item : null;
        }
        else
            return null;
    },

    getActiveData: function (data) {
        if (!data)
            return data;
        let _data = Enumerable.from(data).where(x => !x.Status || x.Status === 1).toArray();
        return _data ? _data : [];
    },

    getGridData: function (grid) {
        if (!grid)
            return [];
        return grid.option('dataSource');
    },

    removeGridData: function (grid, id) {
        if (!grid)
            return false;
        dataHelper.spliceData(grid.option('dataSource'), id);
        grid.refresh();
    },

    resetGridData: function (grid) {
        if (grid) {
            grid.option('dataSource', []);
            grid.refresh();
        }
    },

    getItemIndex: function (data, id) {
        let arr = Enumerable.from(data).select(x => x.Id).toArray();
        return arr.indexOf(parseNumber(id));
    },

    spliceData: function (data, id) {
        let arr = Enumerable.from(data).select(x => x.Id).toArray();
        let idx = arr.indexOf(parseNumber(id));
        if (idx !== -1) {
            data.splice(idx, 1);
        }
        return data;
    },

    hideColumn: function (grid, column) {
        if (typeof column === "object") {
            column.forEach(x => {
                grid.columnOption(x, "visible", false);
            });
        } else
            grid.columnOption(column, "visible", false);
    },

    showColumn: function (grid, column) {
        if (typeof column === "object") {
            column.forEach(x => {
                grid.columnOption(x, "visible", true);
            });
        } else
            grid.columnOption(column, "visible", true);
    },

    prepareGridBeforePrint: function (grid) {
        let _cols = Enumerable.from(grid.option('columns')).toArray();
        _cols.forEach(x => {
            if (x.noPrint)
                grid.columnOption(x.dataField || x.name, "visible", false);
            if (x.printWidth)
                grid.columnOption(x.dataField || x.name, "width", x.printWidth);
        });
    },

    reverseGridAfterPrint: function (grid) {
        let _cols = Enumerable.from(grid.option('columns')).toArray();
        _cols.forEach(x => {
            if (x.noPrint)
                grid.columnOption(x.dataField || x.name, "visible", true);
            if (x.printWidth)
                grid.columnOption(x.dataField || x.name, "width", x.width || 'auto');
        });
    },

    populateData: function (frm, data) {
        common.resetForm($(frm));
        if (data) {
            $.each(data, function (key, value) {
                let ctrl = $('[name=' + key + ']', $(frm));
                switch (ctrl.prop("type")) {
                    case "radio":
                    case "checkbox":
                        ctrl.attr('checked', value);
                        break;
                    case 'file':
                        break;
                    default:
                        ctrl.val(value);
                }
            });
        }
    },

    defaultImagePath: "/common/images/no-image.png",

    populateImage(ctx, value) {
        if ($(ctx)) {
            $(ctx).attr('src', dataHelper.defaultImagePath);
            if (value) {
                $(ctx).attr('src', '/' + value);
            }
        }
    },

    populateMultiSelect: function (ctx, data, key) {
        if (data && $(ctx)) {
            data = common.parseToJson(data);
            $(data).each(function () {
                if (key) {
                    let val = eval("this." + key);
                    let opt = $('option[value=' + val + ']', $(ctx));
                    opt.attr('selected', 'selected');
                } else {
                    let opt1 = $('option[value=' + this + ']', $(ctx));
                    opt1.attr('selected', 'selected');
                }
            });
        }
        if ($(ctx) && $(ctx).hasClass('chosen-select')) {
            common.setChosen(ctx);
        }
    },

    updateModel: function (data, id, model) {
        $(data).each(function (idx) {
            if (this.Id === parseInt(id)) {
                data[idx] = model;
                return false;
            }
        });
    },

    deleteData: function (url, dataTitle, onSuccess, onError) {
        $.alert({
            title: messaging.deleteTitle,
            icon: 'fa fa-warning',
            escapeKey: true,
            backgroundDismiss: true,
            content: 'You are about to delete <strong>' + dataTitle + '</strong>. <strong class="text-danger">There is no undo.</strong> Are you confirm?',
            buttons: {
                btnDelete: {
                    text: messaging.deleteButtonText,
                    btnClass: 'btn-red',
                    action: function () {
                        $.ajax({
                            url: url,
                            method: "post",
                            success: function (response) {
                                common.validateResponse(response);
                                common.displayDelete(response);
                                if (!response.HasError) {
                                    if (typeof onSuccess === 'function') {
                                        onSuccess(response);
                                    }
                                } else if (typeof onError === 'function') {
                                    onError(response);
                                }
                            },
                            error: function (response) {
                                if (typeof onError === 'function') {
                                    onError(response);
                                }
                                else {
                                    common.handleError(response);
                                }
                            }
                        });
                    }
                },
                Cancel: function () {
                    text: messaging.cancelButtonText;
                }
            },
            animation: 'zoom',
            closeAnimation: 'scale'
        });
    },

    archiveData: function (url, dataTitle, onSuccess, onError) {
        $.alert({
            title: messaging.archiveTitle,
            icon: 'fa fa-warning',
            escapeKey: true,
            backgroundDismiss: true,
            content: 'You are about to archive <strong>' + dataTitle + '</strong>. Are you confirm?',
            buttons: {
                btnDelete: {
                    text: messaging.archiveButtonText,
                    btnClass: 'btn-primary',
                    action: function () {
                        $.ajax({
                            url: url,
                            method: "post",
                            success: function (response) {
                                common.validateResponse(response);
                                common.displayMessage('Data archived successfully.');
                                if (!response.HasError) {
                                    if (typeof onSuccess === 'function') {
                                        onSuccess(response);
                                    }
                                } else if (typeof onError === 'function') {
                                    onError(response);
                                }
                            },
                            error: function (response) {
                                if (typeof onError === 'function') {
                                    onError(response);
                                }
                                else {
                                    common.handleError(response);
                                }
                            }
                        });
                    }
                },
                Cancel: function () {
                    text: messaging.cancelButtonText;
                }
            },
            animation: 'zoom',
            closeAnimation: 'scale'
        });
    },

    getSelectList: function (type, push) {
        let html = '';
        type = type.toLowerCase();
        switch (type) {
            case 'subledgertype':
                html += '<option value="Vendor">Vendor</option>';
                html += '<option value="Customer">Customer</option>';
                html += '<option value="Staff">Staff</option>';
                html += '<option value="Others">Others</option>';
                break;
            case 'sex':
                html += '<option value="Male">Male</option>';
                html += '<option value="Female">Female</option>';
                html += '<option value="Others">Others</option>';
                break;
            case 'billingtermtype':
                html += '<option value="Sales">Sales</option>';
                html += '<option value="Purchase">Purchase</option>';
                break;
            case 'title':
                html += '<option value="Mr">Mr</option>';
                html += '<option value="Ms">Ms</option>';
                html += '<option value="Mrs">Mrs</option>';
                html += '<option value="Dr">Dr</option>';
                break;
            case 'bloodgroup':
                html += '<option value="A+">A+</option>';
                html += '<option value="A-">A-</option>';
                html += '<option value="B+">B+</option>';
                html += '<option value="B-">B-</option>';
                html += '<option value="AB+">AB+</option>';
                html += '<option value="AB-">AB-</option>';
                html += '<option value="O+">O+</option>';
                html += '<option value="O-">O-</option>';
                break;
            case 'termeffect':
                html += '<option value="Added">Added</option>';
                html += '<option value="Deducted">Deducted</option>';
                break;
            case 'termapplyto':
                html += '<option value="Billwise">Billwise</option>';
                html += '<option value="Productwise">Productwise</option>';
                break;
        }
        if (push) {
            let htm = `<option value="">--${(push === true ? 'Select' : push)}--</option>`;
            return htm + html;
        }
        return html;
    }
};

//prepareGrid
(function ($) {
    $.fn.prepareGrid = function (option) {
        if ($(this).length === 0)
            return;

        var param = {
            columnAutoWidth: true,
            columnMinWidth: 30,
            repaintChangesOnly: true,
            allowColumnReordering: true,
            allowColumnResizing: true,
            showBorders: true,
            groupPanel: true,
            grouping: true,
            searchPanel: true,
            columnHidingEnabled: true,
            showRowLines: true,
            columnFixing: true,
            showColumnHeaders: true,
            wordWrapEnabled: false,

            storageKey: $(this).attr('data-storage-key'),
            columnResizingMode: device.isMobile() ? 'nextColumn' : 'widget',

            elementAttr: null,

            rowAlternationEnabled: true,
            filterRow: false,
            highlightChanges: false,
            export: false,
            allowExportSelectedData: false,
            loadPanel: false,
            columnChooser: false,
            headerFilter: false,
            pager: true,
            pageSize: 50,
            allowedPageSizes: [10, 25, 50, 100, 300]
        };

        $.extend(param, option);

        if (option.columns && option.additionalColumn) {
            if (Array.isArray(option.additionalColumn)) {
                $(option.additionalColumn).each(function () {
                    option.columns.push(this);
                });
            } else {
                option.columns.push(option.additionalColumn);
            }
        }

        let _grid = $(this).dxDataGrid({
            dataSource: option.data,
            columns: option.columns,
            rowAlternationEnabled: param.rowAlternationEnabled,
            showRowLines: param.showRowLines,
            elementAttr: param.elementAttr,

            repaintChangesOnly: param.repaintChangesOnly,
            highlightChanges: param.highlightChanges,
            columnMinWidth: param.columnMinWidth,
            columnResizingMode: param.columnResizingMode,
            showColumnHeaders: param.showColumnHeaders,
            paging: {
                pageSize: param.pageSize
            },
            pager: {
                showPageSizeSelector: param.pager,
                allowedPageSizes: param.allowedPageSizes
            },
            export: {
                enabled: param.export ? true : false,
                allowExportSelectedData: param.allowExportSelectedData,
                fileName: param.export
            },
            loadPanel: {
                enabled: param.loadPanel
            },
            filterRow: { visible: param.filterRow },
            headerFilter: { visible: param.headerFilter },
            columnFixing: { enabled: param.columnFixing },

            columnHidingEnabled: param.columnHidingEnabled,
            columnChooser: {
                enabled: param.columnChooser,
                mode: "select"
            },
            wordWrapEnabled: param.wordWrapEnabled,
            allowColumnReordering: param.allowColumnReordering,
            allowColumnResizing: param.allowColumnResizing,
            showBorders: param.showBorders,
            grouping: {
                autoExpandAll: param.grouping,
                contextMenuEnabled: param.grouping
            },
            groupPanel: {
                visible: param.groupPanel
            },
            searchPanel: {
                visible: param.searchPanel ? 'auto' : false,
                options: {
                    locateInMenu: 'before'
                }
            },
            stateStoring: {
                enabled: param.storageKey ? true : false,
                storageKey: param.storageKey,
                type: "localStorage"
            },

            onToolbarPreparing: function (e) {
                if (typeof option.onToolbarPreparing === 'function') {
                    option.onToolbarPreparing(e);
                    let getRefresh = '';
                    if (typeof param.onRefresh === 'function') {
                        getRefresh = {
                            locateInMenu: 'always',
                            text: 'Refresh',
                            onClick: function () {
                                param.onRefresh();
                            }
                        };
                    }
                    let toolbarItems = e.toolbarOptions.items;
                    if (typeof param.onClearFormat === 'function' && param.storageKey) {
                        toolbarItems.push({
                            locateInMenu: 'always',
                            text: 'Reset Layout',
                            onClick: function () {
                                common.clearLocalStorage(param.storageKey);
                                param.onClearFormat();
                            }
                        },
                            getRefresh
                        );
                    }
                }
            },
            onContentReady: function (e) {
                if (typeof param.onContentReady === 'function') {
                    param.onContentReady(e);
                }

                if (option.hiddenColumns) {
                    if (Array.isArray(option.hiddenColumns)) {
                        $.each(option.hiddenColumns, function (idx, val) {
                            dataHelper.hideColumn(e.component, val);
                        });
                    } else {
                        dataHelper.hideColumn(e.component, option.hiddenColumns);
                    }
                }

                if (param.columnChooser) {
                    e.element.click(function (args) {
                        if ($(args.target).hasClass("dx-icon-column-chooser") ||
                            $(args.target).find(".dx-icon-column-chooser").length)
                            return;
                        e.component.hideColumnChooser();
                    });
                }
            },

            onRowPrepared: function (info) {
                if (typeof param.onRowPrepared === 'function') {
                    option.onRowPrepared(info);
                }
            }
        });
        return _grid.dxDataGrid('instance');
    };
}(jQuery));

//loadList
(function ($) {
    $.fn.loadList = function (option) {
        if ($(this).length === 0)
            return;
        var param =
        {
            optionalLabel: '--Select-- ',
            valueField: 'Id',
            textField: 'Name',
            selectedValue: $(this).attr('data-value'),
            chosen: $(this).hasClass('chosen-select'),
            afterLoad: null,
            sourceHtml: null
        };
        $.extend(param, option);
        let list = option.source;
        var html = '';
        if (param.optionalLabel) {
            html = '<option value="">' + param.optionalLabel + '</option>';
        }
        if (option.sourceHtml) {
            html = option.sourceHtml;
        } else {
            $(list).each(function () {
                let sleted = eval("this." + param.valueField) === param.selectedValue;
                let selected = sleted ? 'selected' : '';
                html += '<option value="' + eval("this." + param.valueField) + '" ' + selected + ' >' + eval("this." + param.textField) + '</option>';
            });
        }

        $(this).html(html);
        if (param.chosen) {
            common.setChosen(this);
        }
        if (common.isFunction(param.afterLoad)) {
            param.afterLoad();
        }
    };
}(jQuery));

//addItemCreator
(function ($) {
    $.fn.addItemCreator = function (option) {
        if ($(this).length === 0)
            return;
        let param = {
            handler: $(this).attr('data-handler')
        };
        let contentId = "ctx-" + common.getRandomText(20);
        $.extend(param, option);
        if (!param.handler || $(param.handler).length === 0) {
            let htm = `
<div class="input-group-prepend">
    <button class="btn btn-outline-primary btn-sm" type="button" id="`+ contentId + `">+ New</button>
</div>`;
            $(this).closest('.input-group').append(htm);
            param.handler = $('#' + contentId);
        }

        $(param.handler).unbind('click').on('click', function (e) {
            if (common.isFunction(param.onClick)) {
                param.onClick();
            }
        });
    };
}(jQuery));

//submitForm
(function ($) {
    $.fn.submitForm = function (option) {
        $(this).unbind('submit').on("submit", function (e) {
            e.preventDefault();
            var options = {
                url: $(this).attr("action"),
                method: "post",
                formData: new FormData(this),
                isFormData: true
            };

            $.extend(options, option);
            $.validator.setDefaults({ ignore: ":hidden:not(select)" });
            let $form = $(this);
            $.validator.unobtrusive.parse($form);

            if (common.isFunction(options.onValidate)) {
                let retVal = option.onValidate(e);
                if (!retVal)
                    return retVal;
            }

            if (common.isFunction(option.beforeSend)) {
                option.beforeSend(options);
            }

            var ajaxOptions = {
                url: options.url,
                method: options.method,
                data: options.formData,
                beforeSend: function () {
                    common.lockForm($form);
                },
                complete: function () {
                    common.unlockForm($form);
                },
                success: function (response) {
                    common.unlockForm($form);
                    if (response.HasError) {
                        common.handleError(response);
                        return false;
                    }
                    if (options.method === 'post') {
                        common.handleMessage(response, option.message);
                    }

                    if (common.isFunction(options.onSuccess)) {
                        options.onSuccess(response);
                    }
                    if (options.resetForm) {
                        common.resetForm($form);
                    }
                },
                error: function (error) {
                    common.unlockForm($form);
                    common.handleError(error);
                }
            };

            if (options.isFormData) {
                $.extend(ajaxOptions, { contentType: false, processData: false });
            }

            var isValid = $(this).valid();

            if (!isValid) {
                return false;
            }

            $.ajax(ajaxOptions);
        });
    };
}(jQuery));

//getReportData
(function ($) {
    $.fn.getReportData = function (option) {
        $(this).unbind('submit').on("submit", function (e) {
            e.preventDefault();
            var options = {
                url: $(this).attr("action"),
                method: "get",
                formData: $(this).serializeArray()
            };

            $.extend(options, option);
            $.validator.setDefaults({ ignore: ":hidden:not(select)" });
            let $form = $(this);
            $.validator.unobtrusive.parse($form);

            if (common.isFunction(options.onValidate)) {
                let retVal = option.onValidate(e);
                if (!retVal)
                    return retVal;
            }

            if (common.isFunction(option.beforeSend)) {
                option.beforeSend(options);
            }

            var isValid = $(this).valid();

            if (!isValid) {
                return false;
            }
            $.ajax({
                url: options.url,
                method: options.method,
                data: options.formData,
                beforeSend: function () {
                    common.lockForm($form);
                },
                complete: function () {
                    common.unlockForm($form);
                },
                success: function (response) {
                    common.unlockForm($form);
                    if (response.HasError) {
                        common.handleError(response);
                        return false;
                    }

                    if (common.isFunction(options.onSuccess)) {
                        common.parseResponse(response, function (data) {
                            options.onSuccess(data);
                        });
                    }

                },
                error: function (error) {
                    common.unlockForm($form);
                    common.handleError(error);
                }
            });
        });
    };
}(jQuery));

var exportToExcel = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8" /><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };
    return function (table, worksheet, fileName) {
        var ctx = { worksheet: worksheet || 'Worksheet', table: table.html() };
        var link = document.createElement("a");
        link.download = fileName + ".xls";
        link.href = uri + base64(format(template, ctx));
        link.click();
    };
})();

//exportDataToExcel
var exportDataToExcel = function (table, fileName, workSheet) {
    if (!workSheet)
        workSheet = 'Sheet1';


    if (!table)
        return false;
   
    var $listTable = $(table).clone();
    $listTable.find('[no-print]').remove();
    $listTable.find('[no-print]').remove();
    $listTable.find('.fa').remove();
    $listTable.find('[data-chk-header]').css('width', 60);
    $listTable.find('[data-sno]').css('width', 60);

    $("a", $listTable).removeAttr("href");

    var th = $.grep($listTable.find("th"), function (val) {
        return $(val).attr("no-print");
    });

    var td = $.grep($listTable.find("td"), function (val) {
        return $(val).attr("no-print");
    });

    var span = $.grep($listTable.find("span"), function (val) {
        return $(val).attr("no-print");
    });

    $.each(th, function (idx, val) {
        $(val).remove();
    });

    $.each(td, function (idx, val) {
        $(val).remove();
    });

    $.each(span, function (idx, val) {
        $(val).remove();
    });

    var colspan = $("tr", $listTable).eq(1).children().length;

    var $trReportTitle = '';
    if (!$(this).attr('data-no-title')) {
        $trReportTitle = $("<tr><td style='text-align:center; font-weight:bold; font-size:18px;' colspan='" + colspan + "'>" + fileName + "</td></tr>");
    }


    if ($listTable.find("thead").length > 0) {
        $listTable.find("thead").prepend($trReportTitle);
    }
    else {
        $listTable.prepend($trReportTitle);
    }

    exportToExcel($listTable, workSheet, fileName);
};
