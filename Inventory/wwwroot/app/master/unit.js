let unit = {
    title: "Unit Setup",
    init: function () {
        common.activateNav("unit");
        common.setTitle(unit.title);
        unit.layout();

    },
    layout: function () {
        let html = "";
        html +=
            `<div class="card">
                <div class="card-body">
                    <div data-list="unit">
                    </div>
                </div>
            </div>`;
        common.setWorkspace(html);
        var store = new DevExpress.data.CustomStore({
            load: function (loadOptions) {
                return $.ajax({
                    url: rootPath + 'setup/getunit'
                })
            },
            insert: function (values) {
                return $.ajax({
                    url: rootPath + 'setup/setunit',
                    data: values,
                    method:"POST"
                })
            },
            update: function (key, values) {
                return $.ajax({
                    url: rootPath + 'setup/setunit',
                    data: { ...key, ...values },
                    method: "POST"
                })
            },
            remove: function (key) {
                return $.ajax({
                    url: rootPath + 'setup/deleteunit',
                    data: { Id: key.Id },
                    method: "POST"
                })
            }
        });
        $("[data-list='unit']").dxDataGrid({
            dataSource: store,
            showBorders: true,
            editing: {
                allowAdding: true,
                allowDeleting: true,
                allowUpdating: true,
                confirmDelete: true,
                mode: "row",
                refreshMode: "full",
                
            },
            searchPanel: {
                visible: true,
            },
            columns: [
               {
                    dataField:"Name"
                },
                {
                    dataField: "DisplayOrder",
                    caption: "Position",
                    dataType:"number"
                }
                
            ]

        });
    },
    
};
export default unit;