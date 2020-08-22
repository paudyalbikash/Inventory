var attachment = {
    grid: null,

    display: function (ctx, module) {
        let placement = $(ctx).attr('data-placement');
        let containerId = common.getRandomText();
        $(ctx).webuiPopover({
            placement: placement ? placement : 'bottom-right',
            title: 'Related Files',
            content: function () {
                return '<div id="' + containerId + '" class="attachments"></div>';
            },
            onShow: function () {
                let container = $('#' + containerId);
                let dataId = $(ctx).attr('data-id');
                attachment.getFile(module, dataId, function (response) {
                    $(container).dxDataGrid({
                        columns: [{
                            dataField: 'file',
                            visible: false
                        },
                        {
                            dataField: 'FileName',
                            caption: 'File',
                            validationRules: [{ type: "required", message: false }],
                            cellTemplate: function (container, opt) {
                                let htm = opt.data.FileName;
                                if (opt.data.Date) {
                                    htm += `<span file-info>File uploaded <span title="` + dateMiti.getMitiTime(opt.data.Date) + `">` + moment(opt.data.Date).fromNow() + `</span> by ` + opt.data.UploadedBy + `</span>`;
                                }
                                $(container).append(htm);
                            }
                        },
                        {
                            dataField: 'Size',
                            width: 'auto',
                            allowEditing: false,
                            cellTemplate: function (c, opt) {
                                $(c).append(bytesToSize(opt.data.Size));
                            }
                        },
                        {
                            allowFiltering: false,
                            width: 40,
                            caption: 'Preview',
                            cssClass: 'center img-placeholder',
                            allowEditing: false,
                            cellTemplate: function (container, options) {
                                if (!options.data.file) {
                                    if (hasImageExtension(options.data.Extension)) {
                                        let htm = '<a href="' + rootPath + options.data.Url + '" class="file-image-thumb" caption="' + options.data.FileName + '">';
                                        htm += '<img class="image-icon" src="' + rootPath + options.data.Url + '"/>';
                                        htm += '</a>';
                                        $(container).append(htm);
                                    } else if (hasDocumentExtension(options.data.Extension)) {
                                        let htm = '<a data-type="iframe" href="' + rootPath + options.data.Url + '" class="file-preview-thumb file-preview" caption="' + options.data.FileName + '">';
                                        htm += options.data.Extension.replace('.', '');
                                        htm += '</a>';
                                        $(container).append(htm);
                                    } else {
                                        let htm = '<a target="_blank" href="' + rootPath + options.data.Url + '" class="file-preview-thumb">';
                                        htm += '<span class="fa fa-download"></span>';
                                        htm += '</a>';
                                        $(container).append(htm);
                                    }
                                }
                            }
                        }],
                        dataSource: response,
                        rowAlternationEnabled: true,
                        showColumnHeaders: false,
                        showBorders: true,
                        elementAttr: {
                            class: 'dxgrid-sm'
                        },
                        loadPanel: {
                            enabled: false
                        },
                        onContentReady: function () {
                            common.setFancyBox('.file-image-thumb');
                            common.setDocumentViewer('.file-preview');
                        }
                    }).dxDataGrid('instance');
                });
            }
        });
    },

    showPopup: function (ctx, module, dataId, getData, onHide) {
        let containerId = common.getRandomText();
        let readonly = !common.isFunction(onHide);
        $("#popup").remove();
        var $popupContainer = $("<div id='popup' class='attachment-content'/>")
            .appendTo(ctx);
        let popup = $popupContainer.dxPopup({
            height: 'auto',
            minHeight: 250,
            minWidth: 480,
            width: 'auto',
            maxWidth: 840,
            shading: false,
            showTitle: true,
            title: 'Related Files',
            dragEnabled: true,
            resizeEnabled: true,
            closeOnOutsideClick: true,
            contentTemplate: function () {
                return $("<div id=" + containerId + " />");
            },
            onContentReady: function () {
                let data = [];
                if (common.isFunction(getData)) {
                    data = getData();
                }
                let container = $('#' + containerId);
                let _dataId = $(ctx).attr('data-id');
                dataId = _dataId ? _dataId : dataId;
                attachment.getFile(module, dataId, function (response) {
                    $(data).each(function () {
                        response.push(this);
                    });
                    dataHelper.resetGridData(attachment.grid);
                    attachment.grid = $(container).dxDataGrid({
                        columns: [{
                            dataField: 'file',
                            visible: false
                        },
                        {
                            dataField: 'FileName',
                            caption: 'File',
                            validationRules: [{ type: "required", message: false }],
                            cellTemplate: function (container, opt) {
                                let htm = opt.data.FileName;
                                if (opt.data.Date) {
                                    htm += `<span file-info>File uploaded <span title="` + dateMiti.getMitiTime(opt.data.Date) + `">` + moment(opt.data.Date).fromNow() + `</span> by ` + opt.data.UploadedBy + `</span>`;
                                }
                                $(container).append(htm);
                            }
                        },
                        {
                            dataField: 'Size',
                            width: 'auto',
                            allowEditing: false,
                            cellTemplate: function (c, opt) {
                                $(c).append(bytesToSize(opt.data.Size));
                            }
                        },
                        {
                            allowFiltering: false,
                            width: 40,
                            caption: 'Preview',
                            cssClass: 'center img-placeholder',
                            allowEditing: false,
                            cellTemplate: function (container, options) {
                                if (!options.data.file) {
                                    if (hasImageExtension(options.data.Extension)) {
                                        let htm = '<a href="' + rootPath + options.data.Url + '" class="file-image-thumb" caption="' + options.data.FileName + '">';
                                        htm += '<img class="image-icon" src="' + rootPath + options.data.Url + '"/>';
                                        htm += '</a>';
                                        $(container).append(htm);
                                    } else if (hasDocumentExtension(options.data.Extension)) {
                                        let htm = '<a data-type="iframe" href="' + rootPath + options.data.Url + '" class="file-preview-thumb file-preview" caption="' + options.data.FileName + '">';
                                        htm += options.data.Extension.replace('.', '');
                                        htm += '</a>';
                                        $(container).append(htm);
                                    } else {
                                        let htm = '<a target="_blank" href="' + rootPath + options.data.Url + '" class="file-preview-thumb">';
                                        htm += '<span class="fa fa-download"></span>';
                                        htm += '</a>';
                                        $(container).append(htm);
                                    }
                                }
                            }
                        }],
                        dataSource: response,
                        rowAlternationEnabled: true,
                        onToolbarPreparing: function (e) {
                            let toolbarItems = e.toolbarOptions.items;
                            if (!readonly) {
                                toolbarItems.unshift({
                                    location: 'before',
                                    locateInMenu: 'auto',
                                    template: function () {
                                        return $("<div class='dx-btn-sm btn-primary'/>").dxButton({
                                            text: "Upload",
                                            locateInMenu: 'auto',
                                            onClick: function (e) {
                                                $('.k-uploader').remove();
                                                $("<input type='file' multiple='multiple' class='k-uploader d-none' />").appendTo("#" + containerId);
                                                setTimeout(() => {
                                                    $('.k-uploader').unbind('change').on('change', function () {
                                                        let fModel = attachment.upload(this);
                                                        $(fModel).each(function () {
                                                            attachment.grid.option('dataSource').push(this);
                                                        });
                                                        attachment.grid.refresh();
                                                    });
                                                    $('.k-uploader').trigger('click');
                                                }, 0);
                                            }
                                        });
                                    }
                                });

                                toolbarItems.unshift({
                                    location: 'after',
                                    locateInMenu: 'auto',
                                    widget: 'dxButton',
                                    template: function (e) {
                                        return $("<div class='btn-delete-file dx-btn-sm' />").dxButton({
                                            text: "Delete",
                                            locateInMenu: 'auto',
                                            disabled: true,
                                            onClick: function (e) {
                                                attachment.delete(attachment.grid.getSelectedRowsData(), attachment.grid, container);
                                            }
                                        });
                                    }
                                });
                            }
                        },
                        showColumnHeaders: false,
                        selection: {
                            mode: 'multiple'
                        },
                        editing: {
                            mode: !readonly ? "cell" : 'none',
                            allowUpdating: !readonly
                        },
                        onRowUpdated: function (e) {
                            if (!readonly) {
                                attachment.rename(e.data);
                            }
                        },
                        showBorders: true,
                        elementAttr: {
                            class: 'dxgrid-sm'
                        },
                        loadPanel: {
                            enabled: false
                        },
                        onSelectionChanged: function (selectedItems) {
                            if (!readonly) {
                                let _data = selectedItems.selectedRowsData;
                                let deleteBtn = $('.btn-delete-file', container).dxButton('instance');

                                if (_data.length === 1)
                                    deleteBtn.option('disabled', false);
                                else
                                    deleteBtn.option('disabled', true);
                            }
                        },
                        onContentReady: function () {
                            common.setFancyBox('.file-image-thumb');
                            common.setDocumentViewer('.file-preview');
                        }
                    }).dxDataGrid('instance');
                });
            },

            onHidden: function () {
                if (common.isFunction(onHide)) {
                    let _data = attachment.grid.option('dataSource');

                    onHide(Enumerable.from(_data).where(x => x.file).toArray());
                    $('[count]', $(ctx)).text(_data.length);
                }
            }

        }).dxPopup("instance");
        popup.show();
    },

    init: function (ctx, module, dataId, getData, onHide) {
        $(ctx).on('click', function () {
            attachment.showPopup(this, module, dataId, getData, onHide);
        });
    },

    rename: function (item) {
        if (item.Id > 0) {
            let url = rootPath + 'document/renamefile?id=' + item.Id + '&value=' + item.FileName;
            $.ajax({
                url: url,
                method: "post"
            });
        }
    },

    upload: function (ctx) {
        if (ctx.files.length === 0)
            return false;

        let data = [];

        for (var i = 0; i < ctx.files.length; ++i) {
            if (ctx.files[i].size > 52428805) {
                common.displayError('That file size exceeds the 50MB limit.');
                return false;
            }
            let file = ctx.files[i];
            let fModel = { Id: common.getRandomNumber(true), file: file, FileName: removeExtension(file.name), Size: file.size, Extension: getExtension(file.name) };
            data.push(fModel);
        }
        return data;
    },

    getFile: function (module, dataId, onSuccess) {
        $.ajax({
            url: rootPath + 'document/getfile',
            data: { module: module, dataId: dataId },
            success: function (response) {
                common.parseResponse(response, function (response) {
                    onSuccess(response);
                });
            }
        });
    },

    delete: function (selectedData, grid, container) {
        if (selectedData.length < 1)
            return;
        if (selectedData[0].Id < 1) {
            let data = dataHelper.getGridData(grid);
            let arr = Enumerable.from(data).select(x => x.Id).toArray();
            let idx = arr.indexOf(selectedData[0].Id);
            data.splice(idx, 1);
            grid.refresh();
        } else {

            let fileText = $.map(selectedData, function (value) {
                return value.FileName;
            }).join("<br/>");

            $.alert({
                title: function () {
                    return selectedData.length > 1 ? 'Delete files' : 'Delete file';
                },
                container: container,
                icon: 'fa fa-exclamation-triangle text-danger',
                escapeKey: true,
                backgroundDismiss: true,
                content: function () {
                    return '<div class="word-break-break-word">This will delete the <strong block>' + fileText + '</strong><strong class="text-danger">There is no undo</strong>.</div>';
                },
                buttons: {
                    btnDelete: {
                        text: messaging.deleteButtonText,
                        btnClass: 'btn-red',
                        action: function () {
                            $.ajax({
                                url: rootPath + 'document/deletefile',
                                data: { vals: Enumerable.from(selectedData).select(x => x.Id).toArray() },
                                method: "post",
                                success: function (response) {
                                    let data = dataHelper.getGridData(grid);
                                    let arr = Enumerable.from(data).select(x => x.Id).toArray();
                                    let idx = arr.indexOf(selectedData[0].Id);
                                    data.splice(idx, 1);
                                    grid.refresh();
                                },
                                error: function () {
                                    common.displayError('Unable to delete file');
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
        }
    }
};