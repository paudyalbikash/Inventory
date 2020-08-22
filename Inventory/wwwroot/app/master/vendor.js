let vendor = {
    init: function () {
        common.activateNav("vendor");
        common.setTitle("Vendor");
        vendor.layout();
    },

    layout: function () {
        let html = "";
        html += `<div class="card">
                <div class="card-body">
                    <div data-list="vendor">
                    </div>
                </div>
            </div>`;
        common.setWorkspace(html);
        var store = new DevExpress.data.CustomStore({
            load: function (loadOptions) {
                return $.ajax({
                    url: rootPath + 'setup/getvendor'
                })
            },
            insert: function (values) {
                return $.ajax({
                    url: rootPath + 'setup/setvendor',
                    data: values,
                    method: "POST"
                })

            },
            update: function (key, values) {
                return $.ajax({
                    url: rootPath + 'setup/setvendor',
                    data: { ...key, ...values },
                    method: "POST"
                })

            },
            remove: function (key) {
                return $.ajax({
                    url: rootPath + 'setup/deletevendor',
                    data: { Id: key.Id },
                    method: "POST"
                })

            }
        });
        $("[data-list='vendor']").dxDataGrid({
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
                    dataField: "Address"
                },
                {
                    dataField: "OpeningBlance"
                },
                {
                    dataField: "Mobile"
                },
                {
                    dataField: "Phone"
                },
                {
                    dataField: "PanVatNumber",
                    caption: "Pan Vat Number"
                },
                {
                    dataField: "CreatedDate",
                    dataType: "date",
                    allowEditing: false,
                }
            ]
        });

    }
};
export default vendor;
