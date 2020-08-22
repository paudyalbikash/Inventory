let customer = {
    init: function () {
        common.activateNav("customer");
        common.setTitle("Customer");
        customer.layout();
    },

    layout: function () {
        let html = "";
        html += `<div class="card">
                <div class="card-body">
                    <div data-list="customer">
                    </div>
                </div>
            </div>`;
        common.setWorkspace(html);
        var store = new DevExpress.data.CustomStore({
            load: function (loadOptions) {
                return $.ajax({
                    url: rootPath + 'setup/getcustomer'
                })
            },
            insert: function (values) {
                return $.ajax({
                    url: rootPath + 'setup/setcustomer',
                    data: values,
                    method: "POST"
                })

            },
            update: function (key, values) {
                return $.ajax({
                    url: rootPath + 'setup/setcustomer',
                    data: { ...key, ...values },
                    method: "POST"
                })

            },
            remove: function (key) {
                return $.ajax({
                    url: rootPath + 'setup/deletecustomer',
                    data: { Id: key.Id },
                    method: "POST"
                })

            }
        });
        $("[data-list='customer']").dxDataGrid({
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
                    allowEditing: false

                }
            ]
        });

    }
};
export default customer;
