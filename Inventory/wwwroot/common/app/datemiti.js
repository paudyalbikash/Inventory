var dateMiti = {
    data: [],
    getMonthName: function (val) {
        if (!val)
            return val;
        let _month = val.length > 2 ? val.split('-')[1] : val;
        _month = parseNumber(_month);
        switch (_month) {
            case 1:
                return 'Baishakh';
            case 2:
                return 'Jestha';
            case 3:
                return 'Ashadh';
            case 4:
                return 'Srawan';
            case 5:
                return 'Bhadra';
            case 6:
                return 'Aswin';
            case 7:
                return 'Kartik';
            case 8:
                return 'Mansir';
            case 9:
                return 'Paush';
            case 10:
                return 'Marg';
            case 11:
                return 'Falgun';
            case 12:
                return 'Chaitra';

        }
    },
    getFormattedPeriod(fromDate, toDate, format) {
        format = format || "dd MMM yyyy";
        if (!fromDate) {
            return;
        }
        else {
            toDate = toDate || this.mitiFor();
            return this.getFormattedDate(fromDate, format) + " to " + this.getFormattedDate(toDate, format);
        }
    },

    getFormattedDate: function (val, format) {
        if (!val)
            return val;

        let year = val.split('-')[0];
        let month = val.split('-')[1];
        let day = val.split('-')[2];

        switch (format) {
            case 'MMM yyyy':
                return dateMiti.getMonthName(month) + ' ' + year;
            case 'dd MMM yyyy':
                return day + ' '+ dateMiti.getMonthName(month) + ' ' + year;
        }

        return '';
    },

    getMitiTime: function (val) {
        let dt = val;
        if (!val)
            return '';

        let date = moment(val).toDate();
        if (dt === 'Invalid Date' || date === 'Invalid Date' && !dt) {
            var dteStr = dt.replace('/Date(', '');
            dteStr = dteStr.replace(')/', '');
            date = new Date(parseInt(dteStr));
        }
        if (dt === 'Invalid Date' || date === 'Invalid Date') {
            return '';
        }
        let _date = date.toString('yyyy/MM/dd');
        let _time = date.toString('hh:mm tt');

        let _miti = Enumerable.from(dateMiti.data).where(x => x.key === _date).firstOrDefault();

        if (_miti) {
            var _fdate = moment(_miti.value).toDate();
            return _fdate.toString('yyyy-MM-dd') + ' ' + _time;
        }
        return null;
    },

    mitiFor: function () {
        return dateMiti.getMiti(moment().format("YYYY-MM-DD"));
    },

    getYear: function (key) {
        if (!key)
            key = 'today';
        let _date = Date.parse(key).toString('yyyy/MM/dd');
        let _miti = $.grep(dateMiti.data, function (idx) {
            return idx.key === _date;
        });

        if (_miti.length > 0) {
            let val = _miti[0].value;
            if (val) {
                return parseNumber(val.substring(0, 4));
            }
        }
        return '';
    },

    getMonth: function (key) {
        if (!key)
            key = 'today';
        let _date = Date.parse(key).toString('yyyy/MM/dd');
        let _miti = $.grep(dateMiti.data, function (idx) {
            return idx.key === _date;
        });

        if (_miti.length > 0) {
            let val = _miti[0].value;
            if (val) {
                return parseNumber(val.substring(5, 7));
            }
        }
        return '';
    },

    getMiti: function (val, time) {
        if (!val)
            return '';
        let _miti = NepaliFunctions.AD2BS(NepaliFunctions.ConvertToDateObject(val, "YYYY-MM-DD"));
        if (_miti) {
            let returnVal = NepaliFunctions.ConvertDateFormat(_miti, "YYYY-MM-DD") + ' ' + (time ? time : '');
            return returnVal;
        }
        return '';
    },

    getMoment: function (val) {
        if (!val)
            return val;
        return moment(val).fromNow();
    },

    getDate: function (val, format) {
        if (!val)
            return '';

        let date = new Date(val);
        if (date === 'Invalid Date') {
            var dteStr = val.replace('/Date(', '');
            dteStr = dteStr.replace(')/', '');
            date = new Date(parseInt(dteStr));
        }
        if (date === 'Invalid Date' || !date) {
            return '';
        }

        return format ? date.toString(format) : date.toString('yyyy-MM-dd');
    },

    validateMonthYear: function (ctx) {
        if (!$(ctx).val())
            return true;
        let val = $(ctx).val();
        let date = Date.parse(val);
        if (!date)
            return false;
        let formatted = date.toString('MM-yyyy');
        if (formatted !== val)
            return false;
        return true;
    },

    validateYearMonthDay: function (ctx) {
        if (!$(ctx).val())
            return true;
        let val = $(ctx).val();

        let date = Date.parse(val);
        if (!date)
            return false;
        let formatted = date.toString('yyyy-MM-dd');
        if (formatted !== val)
            return false;
        return true;
    },

    getTimeString: function (timespan) {
        if (!timespan)
            return '';
        return common.pad(timespan.Hours, 2) + ':' + common.pad(timespan.Minutes, 2) + ':00';
    },

    getTime: function (val) {
        if (!val)
            return '';
        let date = Date.parse(val);
        if (date === 'Invalid Date') {
            var dteStr = val.replace('/Date(', '');
            dteStr = dteStr.replace(')/', '');
            date = new Date(parseInt(dteStr));
        }
        if (date === 'Invalid Date' || !date) {
            return '';
        }

        return date.toString('hh:mm tt');
    },

    getDateMonth: function (val, time) {
        if (!val)
            return '';

        let date = new Date(val);
        if (date === 'Invalid Date' && !date) {
            var dteStr = val.replace('/Date(', '');
            dteStr = dteStr.replace(')/', '');
            date = new Date(parseInt(dteStr));
        }
        if (date === 'Invalid Date' || !date) {
            return '';
        }
        let retVal = date.toString('dd MMM') + (time ? ' ' + date.toString('hh:mm tt') : '');
        return retVal;
    },

    ifPastDate: function (val) {
        if (!val)
            return false;

        let date = new Date(val);
        if (date === 'Invalid Date' && !date) {
            var dteStr = val.replace('/Date(', '');
            dteStr = dteStr.replace(')/', '');
            date = new Date(parseInt(dteStr));
        }
        if (date === 'Invalid Date' || !date) {
            return false;
        }

        var now = new Date();
        return date < now;
    },

    getMitiMonthTime: function (val) {
        let dt = val;
        if (val === null || val === '')
            return '';

        let date = new Date(dt);
        if (dt === 'Invalid Date' || date === 'Invalid Date' && dt) {
            var dteStr = dt.replace('/Date(', '');
            dteStr = dteStr.replace(')/', '');
            date = new Date(parseInt(dteStr));
        }
        if (dt === 'Invalid Date' || date === 'Invalid Date') {
            return '';
        }

        if (localStorage.getItem(dateMiti.dataKey) === null) {
            return null;
        }

        let _date = date.toString('yyyy/MM/dd');

        let _time = date.toString('hh:mm tt');

        let _miti = $.grep(JSON.parse(localStorage.getItem(dateMiti.dataKey)), function (idx, value) {
            return idx.key === _date;
        });

        if (_miti.length > 0) {
            var _fdate = new Date(_miti[0].value);
            return _fdate.toString('MM-dd') + ' ' + _time;
        }
        return null;
    }
};
