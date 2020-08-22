let product = {
    init: function () {
        common.setTitle("Product");
        common.activateNav("prodduct");
        product.layout();
    },
    layout: function () {
        let html = "";
        html += `<div class="card">
                <div class="card-body">
                    <div data-list="product">
                    </div>
                </div>
            </div>`;
        common.setWorkspace(html);
        product.get(product.print);
    },

    get: function (onSuccess) {
            $.ajax({
                url: rootPath + 'product/getproduct',
                success: function (response) {
                    onSuccess = response;
                }
            });
    },

    print: function () {
        $('[data-list="product"]').dxDataGrid({
            dataSource: product.get(),
            showBorders: true,
            searchPanel: {
                visible: true,
            },
            columns: [
                {
                    dataField:"Name"
                }
            ]
        });
    }
}
export default product;
