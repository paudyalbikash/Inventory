/// <reference path="messeging.js" />
/// <reference path="common.js" />
var fileManager = {
    module: '',
    dataId: null,

    init: function () {
        $(document).on('shown.bs.tab', '[data-toggle="tab"][data-file-module]', function (e) {
            fileManager.module = $(this).attr('data-file-module');
            fileManager.dataId = 0;
            if (parseNumber($(this).attr('data-id')) > 0) {
                fileManager.dataId = parseNumber($(this).attr('data-id'));
            }
            else return;
            let ctx = $(this).attr('href');
            let html = '';
            {
                html += `<div class="card-body p-0" data-container="file-list"></div>`;
            }
            $(ctx).html(html);
            let fileContainer = $('[data-container="file-list"]', $(ctx));
            if (fileManager.dataId > 0)
                fileManager.get(fileContainer);
        });
    },

    upload: function (ctx, gridContainer) {
        if (ctx.files.length === 0)
            return false;

        let formData = new FormData();
        for (var i = 0; i < ctx.files.length; ++i) {
            if (ctx.files[i].size > 52428805) {
                common.displayError('That file size exceeds the 50MB limit.');
                return false;
            } else
                formData.append("files", ctx.files[i]);
        }
        formData.append('module', fileManager.module);
        formData.append('dataId', fileManager.dataId);

        let progressPushed = false;
        let uploaded = false;
        var contentId = "content-id-" + $.now();
        $.ajax({
            url: rootPath + 'document/upload',
            data: formData,
            contentType: false,
            processData: false,
            type: 'post',
            xhr: function () {
                let jqXHR = null;
                if (window.ActiveXObject) {
                    jqXHR = new window.ActiveXObject("Microsoft.XMLHTTP");
                }
                else {
                    jqXHR = new window.XMLHttpRequest();
                }
                jqXHR.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        setTimeout(function () {
                            if (!uploaded) {
                                var _val = evt.loaded * 100;
                                var percentComplete = Math.round(_val / evt.total);
                                showUploadProgress(contentId, percentComplete);
                                progressPushed = true;
                            }
                        }, 1000);
                    }
                }, false);
                return jqXHR;
            },
            complete: function () {
                uploaded = true;
                showUploadProgress(contentId, 101);
            },
            success: function (response) {
                uploaded = true;
                if (progressPushed) {
                    showUploadProgress(contentId, 101);
                }
                fileManager.get(gridContainer);
            }
        });
    },

    get: function (ctx) {
        let grid;
        $.ajax({
            url: rootPath + 'document/getfile',
            data: { module: fileManager.module, dataId: fileManager.dataId },
            success: function (response) {
                common.parseResponse(response, function (response) {
                    grid = $(ctx).dxDataGrid({
                        columns: [
                            {
                                dataField: 'FileName',
                                caption: 'File',
                                validationRules: [{ type: "required", message: false }],
                                cellTemplate: function (container, opt) {
                                    let htm = opt.data.FileName;
                                    htm += `<span file-info>File uploaded <span title="` + dateMiti.getMitiTime(opt.data.Date) + `">` + moment(opt.data.Date).fromNow() + `</span> by ` + opt.data.UploadedBy + `</span>`;
                                    $(container).append(htm);
                                }
                            },
                            {
                                dataField: 'Size',
                                width: 80,
                                allowEditing: false,
                                cellTemplate: function (c, opt) {
                                    $(c).append(bytesToSize(opt.data.Size));
                                }
                            },
                            {
                                allowFiltering: false,
                                width: 40,
                                caption: '',
                                cssClass: 'center img-placeholder',
                                allowEditing: false,
                                cellTemplate: function (container, options) {
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
                        ],
                        dataSource: response,
                        editing: {
                            mode: "cell",
                            allowUpdating: true
                        },
                        selection: {
                            mode: "multiple"
                        },
                        onRowUpdated: function (e) {
                            fileManager.rename(e.data);
                        },
                        showRowLines: true,
                        allowColumnResizing: true,
                        showBorders: true,
                        allowColumnReordering: true,
                        elementAttr: {
                            class: 'dxgrid-sm'
                        },
                        stateStoring: {
                            enabled: fileManager.module === 'open',
                            storageKey: 'opendocuments',
                            type: "localStorage"
                        },
                        loadPanel: {
                            enabled: false
                        },
                        columnHidingEnabled: true,
                        onToolbarPreparing: function (e) {
                            let toolbarItems = e.toolbarOptions.items;

                            toolbarItems.unshift({
                                location: 'before',
                                locateInMenu: 'auto',
                                template: function () {
                                    return $("<div class='dx-btn-sm btn-primary'/>").dxButton({
                                        text: "Upload",
                                        locateInMenu: 'auto',
                                        onClick: function (e) {
                                            $('.k-uploader').remove();
                                            $("<input type='file' multiple='multiple' class='k-uploader d-none' />").appendTo("body");
                                            setTimeout(() => {
                                                $('.k-uploader').unbind('change').on('change', function () {
                                                    fileManager.upload(this, ctx, grid);
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
                                            fileManager.delete(grid.getSelectedRowsData(), grid);
                                        }
                                    });
                                }
                            });
                        },
                        onSelectionChanged: function (selectedItems) {
                            let _data = selectedItems.selectedRowsData;
                            let deleteBtn = $('.btn-delete-file', ctx).dxButton('instance');

                            if (_data.length > 0)
                                deleteBtn.option('disabled', false);
                            else
                                deleteBtn.option('disabled', true);
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

    delete: function (selectedData, grid) {
        if (selectedData.length < 1)
            return;

        let fileText = $.map(selectedData, function (value) {
            return value.FileName;
        }).join("<br/>");

        $.alert({
            title: function () {
                return selectedData.length > 1 ? 'Delete files' : 'Delete file';
            },
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
                        let ids = Enumerable.from(selectedData).select(x => x.Id).toArray();
                        $.ajax({
                            url: rootPath + 'document/deletefile',
                            data: { vals: ids },
                            method: "post",
                            success: function (response) {
                                if (!response.HasError) {
                                    $(ids).each(function () {
                                        dataHelper.removeGridData(grid, this);
                                    });
                                } else {
                                    common.displayError('Unable to delete file');
                                }
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
    },

    rename: function (item) {
        let url = rootPath + 'document/renamefile?id=' + item.Id + '&value=' + item.FileName;
        $.ajax({
            url: url,
            method: "post"
        });
    },

    showImagePreview: function (ctx, target) {
        let file = ctx.files[0];
        let imgType = /image.*/;
        if (target)
            target = $(target);
        else
            target = $(ctx).attr('data-target') ? $(ctx).attr('data-target') : $(ctx).closest('div').find('img');
        if (!file || !file.type.match(imgType)) {
            $(ctx).attr('value', '');
            $(target).attr('src', "/common/images/image-placeholder.png");
        }
        else {
            let reader = new FileReader();
            reader.onload = function (e) {
                $(target).attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
};

$(document).ready(function () {
    fileManager.init();
});
