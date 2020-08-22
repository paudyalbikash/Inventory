function parseString(val) {
    if (val === null)
        return '';
    return $('<div/>').text(val).html();
}

function parsePhone(val) {
    if (val === null || !val)
        return '';
    let vals = val.split(',');
    let retVal = '';
    $(vals).each(function () {
        retVal += " <a class='call' href='tel:" + htmlEncode(this.trim()) + "'><span class='fa fa-phone-square'></span> " + htmlEncode(this.trim()) + "</a>";
    });
    return retVal;
}

function parseEmail(val) {
    if (val === null || !val)
        return '';
    let vals = val.split(',');
    let retVal = '';
    $(vals).each(function () {
        retVal += " <a class='email' target='_blank' href='mailto:" + htmlEncode(this.trim()) + "'><span class='fa fa-envelope-open'></span> " + htmlEncode(this.trim()) + "</a>";
    });
    return retVal;
}

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function parseNumberOnly(val) {
    if (!val)
        return '';
    if (isNaN(val))
        return '';

    let num = parseFloat(val);
    if (num !== 0)
        return num;
    return '';
}

function parseNumber(val, fix, empty) {
    if (!val)
        return 0;
    if (isNaN(val))
        return 0;
    if (fix)
        return parseFloat(val.toFixed(2));
    return parseFloat(val);
}

function parseNumberCsv(n, fix) {
    if (!fix)
        fix = 2;
    else
        fix = parseNumber(fix);

    if (n === null)
        return "0.00";
    if (isNaN(n))
        return "0.00";

    if (n.toString().split('.').length !== fix) {
        n = n + '.00';
    }

    n = parseFloat(n).toFixed(fix);
    let deci = n.split('.');
    let retVal = Number(deci[0]).toLocaleString('np');
    retVal += '.' + deci[1];
    return retVal;
}

function parseNumberOnlyCsv(n, fix) {
    if (!fix)
        fix = 2;
    else
        fix = parseNumber(fix);

    if (n === null)
        return "";
    if (isNaN(n))
        return "";
    if (n === 0)
        return '';

    if (n.toString().split('.').length !== fix) {
        n = n + '.00';
    }

    n = parseFloat(n).toFixed(fix);
    let deci = n.split('.');
    let retVal = Number(deci[0]).toLocaleString('np');
    retVal += '.' + deci[1];
    return retVal;
}

function showUploadProgress(context, value) {
    let old = $('.progress-container').length;
    let htm = '';
    if ($('#' + context).length === 0 && value < 100) {
        htm += `
<div id="` + context + `" class="progress-container" style="top:` + old * 30 + `px;">
    <div class="progress">
        <div class="progress-bar progress-bar-striped bg-primary" role="progressbar" style="width: `+ value + `%">` + value + `%</div>
    </div>
</div>`;
        $('body').append(htm);
    }
    if (value <= 100) {
        let ctx = $('#' + context).find('.progress-bar');
        ctx.css('width', value + '%');
        ctx.text(value + '%');
    }

    if (value > 100) {
        setTimeout(function () {
            $('#' + context).remove();
        }, 2000);
    }
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function hasImageExtension(url) {
    if (!url)
        return false;
    let extension = Enumerable.from(url.trim().split('.')).lastOrDefault().toLowerCase();
    let matchableExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "gif&nbsp;", "tiff"];
    return extension && extension !== '' && matchableExtensions.indexOf(extension.toLowerCase()) > -1;
}

function hasDocumentExtension(url) {
    if (!url)
        return false;
    let extension = Enumerable.from(url.trim().split('.')).lastOrDefault().toLowerCase();
    let matchableExtensions = ["pdf", "ttf", "rtf", "txt", "xps", "html", "htm"];
    return extension && extension !== '' && matchableExtensions.indexOf(extension.toLowerCase()) > -1;
}

function removeExtension(file) {
    return file.split('.').slice(0, -1).join('.');
}

function getExtension(file) {
    return Enumerable.from(file.split('.')).lastOrDefault();
}

function convertToTitleCase(val) {
    if (!val)
        return val;
    return val.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function parseAccountingNumberCsv(val,includeZero) {
    let parsed = '';
    if (isNaN(val))
        return val;
    else {
        if (Number(val) < 0) {
            parsed = "(-) ";
        }
        if (includeZero) {
            parsed += parseNumberCsv(Math.abs(val));
        }
        else {
            parsed += parseNumberOnlyCsv(Math.abs(val));
        }
   }

    return parsed;
}
