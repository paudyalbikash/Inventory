let fiscalyear = {
    title: "Fiscal Year Setup",
    init: function () {
        common.activateNav("fiscalyear");
        common.setTitle(fiscalyear.title);
        fiscalyear.layout();   
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
                    url: rootPath + 'setup/getfiscalyear'
                })
            },
            insert: function (values) {
                return $.ajax({
                    url: rootPath + 'setup/setfiscalyear',
                    data: values,
                    method: "POST"
                })
            },
            update: function (key, values) {
                return $.ajax({
                    url: rootPath + 'setup/setfiscalyear',
                    data: { ...key, ...values },
                    method: "POST"
                })
            },
            remove: function (key) {
                return $.ajax({
                    url: rootPath + 'setup/deletefiscalyear',
                    data: { Id: key.Id },
                    method: "POST"
                })
            }
        });
        $("[data-list]").dxDataGrid({
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
                    dataField: "Name"
                },
                {
                    dataField: "Code"
                },
                {
                    dataField: "DateFrom",
                    dataType:"date"
                },
                {
                    dataField: "DateTo",
                    dataType: "date"
                }

            ]

        });
    },


}
export default fiscalyear;