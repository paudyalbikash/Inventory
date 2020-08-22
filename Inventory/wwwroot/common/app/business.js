var business = {
    init: function () {
        $.ajax({
            url: rootPath + 'home/getcompanyinfo',
            success: function (response) {
                common.parseResponse(response, function (data) {
                    business.info = data;
                });
            }
        });
    }
};

$(() => {
    business.init();
});