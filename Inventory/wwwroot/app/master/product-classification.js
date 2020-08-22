let productClassification = {
    init: function () {
        common.activateNav("product-classification");
        common.setTitle("Product Classification");
        productClassification.layout();
    },
    layout: function () {
        let html = "";
        html +=
            `<div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h4 style="background-color: #26a69a; color:#ffff; text-align:center"> Category </h4>
                            <div data-list="category"></div>
                        </div>
                        <div class="col-md-6">
                            <h4 style="background-color: #26a69a; color:#ffff; text-align:center"> Group </h4>
                            <div data-list="group"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        common.setWorkspace(html);

        var store1 = new DevExpress.data.CustomStore({
            load: function (loadOptions) {
                return $.ajax({
                    url: rootPath + 'setup/getcategory'
                })
            },
            insert: function (values) {
                return $.ajax({
                    url: rootPath + 'setup/setcategory',
                    data: values,
                    method: "POST"
                })

            },
            update: function (key, values) {
                return $.ajax({
                    url: rootPath + 'setup/setcategory',
                    data: { ...key, ...values },
                    method: "POST"
                })

            },
            remove: function (key) {
                return $.ajax({
                    url: rootPath + 'setup/deletecategory',
                    data: { Id: key.Id },
                    method: "POST"
                })

            }
        });
        $("[data-list='category']").dxDataGrid({
            dataSource: store1,
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
                    dataField: "DisplayOrder",
                    caption:"Position"
                }
            ]
        });


        var store = new DevExpress.data.CustomStore({
            load: function (loadOptions) {
                return $.ajax({
                    url: rootPath + 'setup/getgroup'
                })
            },
            insert: function (values) {
                return $.ajax({
                    url: rootPath + 'setup/setgroup',
                    data: values,
                    method: "POST"
                })

            },
            update: function (key, values) {
                return $.ajax({
                    url: rootPath + 'setup/setgroup',
                    data: { ...key, ...values },
                    method: "POST"
                })

            },
            remove: function (key) {
                return $.ajax({
                    url: rootPath + 'setup/deletegroup',
                    data: { Id: key.Id },
                    method: "POST"
                })

            }
        });
        $("[data-list='group']").dxDataGrid({
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
                    dataField: "DisplayOrder",
                    caption: "Position"
                }
            ]
        });

    },

    get: function () {

    }

}
export default productClassification