/// <reference path="datemiti.js" />
var documentManager = {
    moduleId: common.getRandomText(),
    module: 'open',
    dataId: -1,

    init: function () {
        $(document).on('click', '[data-nav="documents"]', function (e) {
            e.preventDefault();
            let container = '<div data-container="documents" class="col-md-12"></div>';
            common.setTabContent(this.moduleId, 'Document Management', 'documents', container);
            documentManager.dataId = -1;
            documentManager.container = $('[data-container="documents"]');
            documentManager.folder.display(true);
            documentManager.file.display();
        });
    },

    folder: {
        grid: null,
        data: [],
        current: '',

        create: function () {
            if (!documentManager.dataId)
                return false;
            $.ajax({
                url: rootPath + 'document/createfolder',
                type: 'post',
                data: { dataId: documentManager.dataId, module: documentManager.module },
                success: function (response) {
                    common.parseResponse(response, function (response) {
                        documentManager.folder.rename(response[0], null, function () {
                            documentManager.file.display(response[0].Id);
                        }, function () {
                            $.ajax({
                                url: rootPath + 'document/deletefolder?folderid=' + response[0].Id,
                                method: "post",
                                success: function (response) {
                                    if (!response.HasError) {
                                        documentManager.folder.data = [];
                                        documentManager.folder.display();
                                        documentManager.folder.update();
                                        documentManager.file.display();
                                    }
                                }
                            });
                        });

                        let push = documentManager.folder.data.length === 0;
                        documentManager.folder.data = [];
                        documentManager.folder.display(push);
                    });
                }
            });
        },

        get: function (onSuccess) {
            if (!documentManager.dataId)
                return false;
            $.ajax({
                url: rootPath + 'document/getfolder',
                data: { module: documentManager.module, dataId: documentManager.dataId },
                success: function (response) {
                    common.parseResponse(response, function (response) {
                        documentManager.folder.data = response;
                    });
                    if (common.isFunction(onSuccess)) {
                        onSuccess(documentManager.folder.data);
                    }
                }
            });
        },

        display: function (push) {
            if (push) {
                let html = `
<div class="row" data-manager="file">
    <div class="col left-panel col-sm-12 col-md-2">
        <p data-folder="" onclick="documentManager.file.display()" class="pb-1 mb-0 pointer folder-name"><span data-title="">Inbox</span><em count>(0)</em></p>
        <div data-container="folders"></div>
        <p anchor class="p-0 bold mt-2" onclick="documentManager.folder.create(this)">+ New Folder</p>
    </div>
    <div class="col pl-2 col-sm-12 col-md-10">
        <div class="card mb-4">
            <div class="card-body p-0 file-container" id="`+ documentManager.dataId + `"></div>
        </div>
    </div>
</div>`;
                $(documentManager.container).html(html);
                this.update();
            }

            this.get(function (data) {
                if (data.length > 0) {
                    documentManager.folder.grid = $('[data-container="folders"]').dxDataGrid({
                        columns: [
                            {
                                dataField: 'Name',
                                width: '100%',
                                cellTemplate: function (container, options) {
                                    let htm = '';
                                    htm += '<p class="folder-name" data-folder="' + options.data.Id + '" anchor onClick="documentManager.file.display(' + options.data.Id + ')"><span data-title>' + options.data.Name + '</span><em count>(' + options.data.Count + ')</em></p>';
                                    $(container).append(htm);
                                }
                            }
                        ],
                        dataSource: data,
                        showBorders: false,
                        showColumnHeaders: false
                    }).dxDataGrid('instance');
                }
                else {
                    $('[data-container="folders"]').html(null);
                }
            });
        },

        update: function (onSuccess) {
            $.ajax({
                url: rootPath + 'document/getsummary',
                data: { module: documentManager.module, dataId: documentManager.dataId },
                success: function (response) {
                    common.parseResponse(response, function (data) {
                        $('[data-folder] [count]').text("(0)");
                        $(data).each(function () {
                            let fVal = this.FolderId ? this.FolderId : '';
                            let f = $('[data-folder="' + fVal + '"]');
                            f.find('[data-title]').text(this.Name);
                            f.find('[count]').text('(' + this.Total + ')');
                            let fol = dataHelper.find(documentManager.folder.data, this.FolderId);
                            if (fol) {
                                fol.Count = this.Total;
                                fol.Name = this.Name;
                            }
                            if (common.isFunction(onSuccess)) {
                                onSuccess();
                            }
                        });
                    });
                }
            });
        },

        rename: function (folderData, id, onSuccess, onCancel) {
            let fol;
            if (folderData)
                fol = folderData;
            else
                fol = !id ? dataHelper.find(documentManager.folder.data, documentManager.folder.current) : dataHelper.find(documentManager.folder.data, id);
            $.alert({
                title: 'Rename Folder',
                escapeKey: true,
                backgroundDismiss: true,
                content: function () {
                    return '<input type="text" required="required" id="Value" name="Value" class="form-control form-control-sm" placeholder="New name for folder" value="' + fol.Name + '"/>';
                },
                buttons: {
                    btnDelete: {
                        text: 'Save',
                        btnClass: 'btn-primary',
                        action: function () {
                            let input = this.$content.find('#Value');
                            if ($(input).val().trim() === '') {
                                $(input).focus();
                                return;
                            }

                            let url = rootPath + 'document/renamefolder?folderid=' + fol.Id + '&value=' + $(input).val();
                            $.ajax({
                                url: url,
                                method: "post",
                                success: function (response) {
                                    common.validateResponse(response);
                                    if (!response.HasError) {
                                        documentManager.folder.update();
                                    }
                                    if (common.isFunction(onSuccess)) {
                                        onSuccess();
                                    }
                                },
                                error: function () {
                                    common.displayError('Unable to rename folder');
                                }
                            });
                        }
                    },
                    Cancel: function () {
                        text: messaging.cancelButtonText;
                        if (common.isFunction(onCancel)) {
                            onCancel();
                        }
                    }
                },
                animation: 'zoom',
                closeAnimation: 'scale',
                onContentReady: function () {
                    $('#Value').select();
                    $('#Value').focus();
                }
            });
        },

        delete: function () {
            let fol = dataHelper.find(documentManager.folder.data, documentManager.folder.current);
            $.alert({
                title: 'Delete Folder',
                icon: 'fa fa-exclamation-triangle text-danger',
                escapeKey: true,
                backgroundDismiss: true,
                content: function () {
                    if (fol.Count === 0) {
                        return 'This will delete the  <strong>' + fol.Name + '</strong> folder.';
                    } else {
                        let htm = 'This will delete the  <strong>' + fol.Name + '</strong> folder.';
                        htm += '<label class="mb-1"><input type="radio" class="_action" name="action" value="move" checked="checked" /><span>Move <strong>' + fol.Count + (fol.Count > 1 ? ' files' : ' file') + '</strong> to inbox.</span></label>';
                        htm += '&nbsp;&nbsp;<label><input type="radio" class="_action" name="action" value="delete" /><span>Delete <strong>' + fol.Count + (fol.Count > 1 ? ' files' : ' file') + '</strong>.</span></label>';
                        htm += '<hr class="m-0"/>';
                        return htm;
                    }
                },
                buttons: {
                    btnDelete: {
                        text: messaging.deleteButtonText,
                        btnClass: 'btn-red',
                        action: function () {
                            let _action = this.$content.find('._action:checked').attr('value');
                            let url = rootPath + 'document/deletefolder?folderid=' + fol.Id + '&_action=' + _action;
                            $.ajax({
                                url: url,
                                method: "post",
                                success: function (response) {
                                    common.validateResponse(response);
                                    if (!response.HasError) {
                                        documentManager.folder.data = [];
                                        documentManager.folder.display();
                                        documentManager.folder.update();
                                        documentManager.file.display();
                                    }
                                },
                                error: function () {
                                    common.displayError('Unable to delete folder');
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
    },

    file: {
        upload: function (ctx) {
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
            formData.append('module', documentManager.module);
            formData.append('dataId', documentManager.dataId);
            formData.append('folderId', $(ctx).attr('data-folderid'));

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
                    documentManager.file.get($(ctx).attr('data-folderid'));
                    documentManager.folder.update();
                }
            });
        },

        get: function (folderId) {
            let ctx = $('[data-container="files"]');
            let grid;
            if (!documentManager.dataId)
                return false;
            documentManager.folder.current = folderId > 0 ? folderId : '';

            $.ajax({
                url: rootPath + 'document/getfile',
                data: { module: documentManager.module, dataId: documentManager.dataId, folderId: folderId },
                success: function (response) {
                    $('[data-folder]').removeClass('active');
                    $('[data-folder="' + documentManager.folder.current + '"]').addClass('active');
                    common.parseResponse(response, function (response) {
                        grid = $(ctx).dxDataGrid({
                            columns: [
                                {
                                    dataField: 'FileName',
                                    caption: 'File',
                                    allowEditing: true,
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
                                            let htm = '<a href="' + rootPath + options.data.Url + '" class="document-image-thumb" caption="' + options.data.FileName + '">';
                                            htm += '<img class="image-icon" src="' + rootPath + options.data.Url + '"/>';
                                            htm += '</a>';
                                            $(container).append(htm);
                                        } else if (hasDocumentExtension(options.data.Extension)) {
                                            let htm = '<a data-type="iframe" href="' + rootPath + options.data.Url + '" class="document-preview-thumb doc-preview" caption="' + options.data.FileName + '">';
                                            htm += options.data.Extension.replace('.', '');
                                            htm += '</a>';
                                            $(container).append(htm);
                                        } else {
                                            let htm = '<a target="_blank" href="' + rootPath + options.data.Url + '" class="document-preview-thumb">';
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
                            onRowUpdated: function (e) {
                                documentManager.file.rename(e.data);
                            },
                            selection: {
                                mode: "multiple"
                            },
                            elementAttr: {
                                class: 'dxgrid-sm'
                            },
                            showRowLines: true,
                            allowColumnResizing: true,
                            showBorders: true,
                            allowColumnReordering: true,
                            columnHidingEnabled: true,
                            columnResizingMode: device.isMobile() ? 'nextColumn' : 'widget',
                            stateStoring: {
                                enabled: documentManager.module === 'open',
                                storageKey: 'opendocuments',
                                type: "localStorage"
                            },
                            loadPanel: {
                                enabled: false
                            },
                            onToolbarPreparing: function (e) {
                                let toolbarItems = e.toolbarOptions.items;
                                userFavorite.addFevButton(toolbarItems, 'documents', 'dx-btn-sm mr-1');
                                toolbarItems.unshift({
                                    location: 'before',
                                    locateInMenu: 'auto',
                                    template: function () {
                                        return $("<div class='dx-btn-sm ml-2 btn-primary'/>").dxButton({
                                            text: "Upload",
                                            locateInMenu: 'auto',
                                            onClick: function (e) {
                                                $('.k-uploader').remove();
                                                $("<input type='file' data-folderid=" + documentManager.folder.current + " multiple='multiple' class='k-uploader d-none' />").appendTo("body");
                                                setTimeout(() => {
                                                    $('.k-uploader').unbind('change').on('change', function () {
                                                        documentManager.file.upload(this);
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
                                    widget: 'dxSelectBox',
                                    template: function () {
                                        return $("<div class='move-file dx-select-sm'/>").dxSelectBox({
                                            dataSource: [],
                                            placeholder: 'Move to',
                                            visible: documentManager.folder.data.length > 0,
                                            displayExpr: "Name",
                                            valueExpr: "Id",
                                            onValueChanged: function (data) {
                                                if (!data.value)
                                                    return;
                                                let _data = grid.getSelectedRowsData();
                                                $.ajax({
                                                    url: rootPath + 'document/movefile',
                                                    data: { dest: data.value, vals: Enumerable.from(_data).select(x => x.Id).toArray() },
                                                    type: 'post',
                                                    success: function (response) {
                                                        if (!response.HasError) {
                                                            documentManager.folder.update(documentManager.file.display(documentManager.folder.current));
                                                        }
                                                    }
                                                });
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
                                                documentManager.file.delete(grid.getSelectedRowsData(), grid);
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

                                let fols = $.grep(documentManager.folder.data, function (idx) {
                                    return idx.Id !== documentManager.folder.current;
                                });

                                if (documentManager.folder.current > 0) {
                                    fols.unshift({ Name: 'Inbox', Id: '-1' });
                                }

                                let ddlMoveTo = $('.move-file', ctx).dxSelectBox('instance');
                                ddlMoveTo.option('dataSource', fols);
                            },
                            onContentReady: function () {
                                common.setFancyBox('.document-image-thumb');
                                common.setDocumentViewer('.doc-preview');
                            }
                        }).dxDataGrid('instance');
                    });
                }
            });
        },

        display: function (folderId, folderData) {
            let _folder;
            if (folderData)
                _folder = folderData;
            else if (folderId)
                _folder = dataHelper.find(documentManager.folder.data, folderId);
            else if (!folderData)
                _folder = { Name: 'Inbox' };
            let html = '';
            {
                html +=
                    `
<div class="card-title border-bottom d-flex align-items-center">
    <h3 data-selected-folder="true" data-folder=`+ (_folder.Id ? _folder.Id : '') + `><span data-title>` + _folder.Name + `</span></h3>`;
                if (_folder.Id) {
                    html += `
    <span class="flex-grow-1"></span>
    <div class="btn-group">
        <button class="btn btn-default dropdown-toggle btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Options</button>
        <div class="dropdown-menu">
            <p anchor class="dropdown-item m-0 font-14" onclick="documentManager.folder.rename()">Rename</p>
            <p anchor class="dropdown-item m-0 font-14" onclick="documentManager.folder.delete()">Delete</p>
        </div>
    </div>`;
                }
                html += `</div>
<div class="card-body p-0" data-container="files"></div>
`;
            }
            $('.file-container').html(html);
            this.get(_folder.Id);
        },

        delete: function (selectedData) {
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
                            $.ajax({
                                url: rootPath + 'document/deletefile',
                                data: { vals: Enumerable.from(selectedData).select(x => x.Id).toArray() },
                                method: "post",
                                success: function (response) {
                                    common.validateResponse(response);
                                    if (!response.HasError) {
                                        documentManager.folder.update(documentManager.file.display(documentManager.folder.current));
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
        }
    }
};

$(document).ready(function () {
    documentManager.init();
});