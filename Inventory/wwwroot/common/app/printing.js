var printing = {
    printData: function (ctx, heading, beforePrint, onSuccess) {
        let g = document.createElement('div');
        if (common.isFunction(beforePrint)) {
            beforePrint();
        }
        let header = '', footer = '', html = '';
        if (heading && heading.fileName && heading.fileName !== 'DataGrid') {
            header += '<table class="report-heading">';
            header += '<tr><td style="width:250px" title><h3>Report Title</h3></td><td title><h3>' + heading.fileName + '</h3></td></tr>';
            if (heading.subTitle) {
                header += '<tr><td></td><td><h4>' + heading.subTitle + '<h4></td></tr>';
            }

            header += '<tr><td subtitle>Company Name</td><td subtitle>' + business.info.Name + '</td></tr>';
            header += '<tr><td subtitle>Address</td><td subtitle>' + parseString(business.info.Address) + '</td></tr>';
            header += '<tr><td subtitle>Phone</td><td subtitle>' + parseString(business.info.Phone) + '</td></tr>';
            header += '</table>';
            html += '<hr style="margin:0;margin-bottom:5px;color:black;" />';
            if (heading.footer) {
                footer += '<p style="margin:0;">' + heading.footer + '</p>';
            }
        }
        
        html += $(ctx).html();

        $(g).html(html);
        setTimeout(function () {
            $(g).find('.dx-column-indicators').remove();
            $(g).find('.fa').remove();
            $(g).find('.dx-datagrid-group-opened').remove();
            $(g).find('.req-flag').remove();
            $(g).find('[no-print]').remove();
            $(g).find('.no-print').remove();

            $(g).find('.dx-datagrid-header-panel').remove();
            $("a", $(g)).removeAttr("href");
            $("button", $(g)).remove();

            $("th", $(g)).attr("nowrap", true);
            $(g).printThis({
                debug: false,
                header: header === '' ? null : header,
                footer: footer === '' ? null : footer,
                importCSS: true,
                importStyle: true,
                loadCSS: '/css/print.common.css?v=2',
                afterPrint: function () {
                    if (common.isFunction(onSuccess)) {
                        onSuccess();
                    }
                }
            });
        }, 200);
    }
};