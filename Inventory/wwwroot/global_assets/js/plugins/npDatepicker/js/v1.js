(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}(function ($, undefined) {
	function UTCDate() {
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function isValidDate(d) {
		return NepaliFunctions.ValidateBsDate(NepaliFunctions.ConvertToDateObject(d, "YYYY-MM-DD"));
	}
	function getUtcDateNp(npDate) {
		let engDate = new Date(getEngDate(npDate.split('-')[0], npDate.split('-')[1], npDate.split('-')[2]));
		return UTCDate(engDate.getUTCFullYear(), engDate.getUTCMonth(), engDate.getUTCDate());
	}
	function getNpFullYear(date) {
		return date.split("-")[0];
	}
	function getNpFullMonth(date) {
		return date.split("-")[1];
	}
	function getNpFullDate(date) {
		return date.split("-")[2];
	}

	function getNpDate(date) {
		let d = date;
		let year = d.getUTCFullYear();
		let month = d.getUTCMonth() + 1;
		let day = d.getUTCDate();
		return AD2BS(year + "-" + pad(month) + "-" + pad(day));
	}
	function getEngDate(year, month, date) {
		return BS2AD(year + "-" + pad(month) + "-" + pad(date));
	}
	function getLastDay(t, e) {
		var n = new NepaliDateConverter;
		return n.bs[t][e];
	}
	function isLastDayOfMonth(date) {
		date = date.split("-");
		var n = new NepaliDateConverter;
		var lastDay = n.bs[Number(date[0])][Number(date[1]) - 1];
		return Number(date[2]) === Number(lastDay);
	}
	function pad(d) {
		if (!d)
			return d;
		d = parseInt(d);
		return (d < 10) ? '0' + d.toString() : d.toString();
	}
	function alias(method, deprecationMsg) {
		return function () {
			if (deprecationMsg !== undefined) {
				$.fn.datepicker.deprecated(deprecationMsg);
			}

			return this[method].apply(this, arguments);
		};
	}

	function AD2BS(t) {
		return NepaliFunctions.ConvertDateFormat(NepaliFunctions.AD2BS(NepaliFunctions.ConvertToDateObject(t, 'YYYY-MM-DD')))
	}

	function BS2AD(t) {
		return NepaliFunctions.ConvertDateFormat(NepaliFunctions.BS2AD(NepaliFunctions.ConvertToDateObject(t, 'YYYY-MM-DD')))
	}

	function getNepaliDate() {
		return NepaliFunctions.ConvertDateFormat(NepaliFunctions.GetCurrentBsDate(), 'YYYY-MM-DD');
	}
	var DateArray = (function () {
		var extras = {
			get: function (i) {
				return this.slice(i)[0];
			},
			contains: function (d) {
				return -1;
			},
			remove: function (i) {
				this.splice(i, 1);
			},
			replace: function (new_array) {
				if (!new_array)
					return;
				if (!$.isArray(new_array))
					new_array = [new_array];
				this.clear();
				this.push.apply(this, new_array);
			},
			clear: function () {
				this.length = 0;
			},
			copy: function () {
				var a = new DateArray();
				a.replace(this);
				return a;
			}
		};

		return function () {
			var a = [];
			a.push.apply(a, arguments);
			$.extend(a, extras);
			return a;
		};
	})();

	var Datepicker = function (element, options) {
		$.data(element, 'datepicker', this);

		this._events = [];
		this._secondaryEvents = [];

		this._process_options(options);

		this.dates = new DateArray();
		this.viewDate = this.o.defaultViewDate;
		this.focusDate = null;

		this.element = $(element);
		this.isInput = this.element.is('input');
		this.inputField = this.isInput ? this.element : this.element.find('input');
		this.component = this.element.hasClass('date') ? this.element.find('.add-on, .input-group-addon, .input-group-append, .input-group-prepend, .btn') : false;
		if (this.component && this.component.length === 0)
			this.component = false;
		this.isInline = !this.component && this.element.is('div');

		this.picker = $(DPGlobal.template);

		if (this._check_template(this.o.templates.leftArrow)) {
			this.picker.find('.prev').html(this.o.templates.leftArrow);
		}

		if (this._check_template(this.o.templates.rightArrow)) {
			this.picker.find('.next').html(this.o.templates.rightArrow);
		}

		this._buildEvents();
		this._attachEvents();

		if (this.isInline) {
			this.picker.addClass('datepicker-inline').appendTo(this.element);
		}
		else {
			this.picker.addClass('datepicker-dropdown dropdown-menu');
		}

		if (this.o.rtl) {
			this.picker.addClass('datepicker-rtl');
		}

		if (this.o.calendarWeeks) {
			this.picker.find('.datepicker-days .datepicker-switch, thead .datepicker-title, tfoot .today, tfoot .clear')
				.attr('colspan', function (i, val) {
					return Number(val) + 1;
				});
		}

		this._process_options({
			startDate: this._o.startDate,
			endDate: this._o.endDate,
			daysOfWeekDisabled: this.o.daysOfWeekDisabled,
			daysOfWeekHighlighted: this.o.daysOfWeekHighlighted,
			datesDisabled: this.o.datesDisabled
		});

		this._allow_update = false;
		this.setViewMode(this.o.startView);
		this._allow_update = true;

		this.fillDow();
		this.fillMonths();

		this.update();

		if (this.isInline) {
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_resolveViewName: function (view) {
			$.each(DPGlobal.viewModes, function (i, viewMode) {
				if (view === i || $.inArray(view, viewMode.names) !== -1) {
					view = i;
					return false;
				}
			});

			return view;
		},

		_resolveDaysOfWeek: function (daysOfWeek) {
			if (!$.isArray(daysOfWeek))
				daysOfWeek = daysOfWeek.split(/[,\s]*/);
			return $.map(daysOfWeek, Number);
		},

		_check_template: function (tmp) {
			try {
				// If empty
				if (tmp === undefined || tmp === "") {
					return false;
				}
				// If no html, everything ok
				if ((tmp.match(/[<>]/g) || []).length <= 0) {
					return true;
				}
				// Checking if html is fine
				var jDom = $(tmp);
				return jDom.length > 0;
			}
			catch (ex) {
				return false;
			}
		},

		_process_options: function (opts) {
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]) {
				lang = lang.split('-')[0];
				if (!dates[lang])
					lang = defaults.language;
			}
			o.language = lang;

			// Retrieve view index from any aliases
			o.startView = this._resolveViewName(o.startView);
			o.minViewMode = this._resolveViewName(o.minViewMode);
			o.maxViewMode = this._resolveViewName(o.maxViewMode);

			// Check view is between min and max
			o.startView = Math.max(this.o.minViewMode, Math.min(this.o.maxViewMode, o.startView));

			// true, false, or Number > 0
			if (o.multidate !== true) {
				o.multidate = Number(o.multidate) || false;
				if (o.multidate !== false)
					o.multidate = Math.max(0, o.multidate);
			}
			o.multidateSeparator = String(o.multidateSeparator);

			o.weekStart %= 7;
			o.weekEnd = (o.weekStart + 6) % 7;

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity) {
				if (!o.startDate) {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity) {
				if (!o.endDate) {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = this._resolveDaysOfWeek(o.daysOfWeekDisabled || []);
			o.daysOfWeekHighlighted = this._resolveDaysOfWeek(o.daysOfWeekHighlighted || []);

			o.datesDisabled = o.datesDisabled || [];
			if (!$.isArray(o.datesDisabled)) {
				o.datesDisabled = o.datesDisabled.split(',');
			}
			o.datesDisabled = $.map(o.datesDisabled, function (d) {
				return DPGlobal.parseDate(d, format, o.language, o.assumeNearbyYear);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function (word) {
				return /^auto|left|right|top|bottom$/.test(word);
			});
			o.orientation = { x: 'auto', y: 'auto' };
			if (!_plc || _plc === 'auto')
				; // no action
			else if (plc.length === 1) {
				switch (plc[0]) {
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			}
			else {
				_plc = $.grep(plc, function (word) {
					return /^left|right$/.test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function (word) {
					return /^top|bottom$/.test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
			if (o.defaultViewDate || typeof o.defaultViewDate === 'string') {
				o.defaultViewDate = DPGlobal.parseDate(o.defaultViewDate, format, o.language, o.assumeNearbyYear);
			} else if (!o.defaultViewDate) {
				o.defaultViewDate = this.todayNpDate();
			}
		},
		todayNpDate: function () {
			return getNepaliDate();
		},
		getNMonth(date) {
			if (!date)
				return date;
			else {
				var d = date.split('-');
				return d[1];
			}
		},
		getNYear(date) {
			if (!date)
				return date;
			else {
				var d = date.split('-');
				return d[0];
			}
		},
		getNDate(date) {
			if (!date)
				return date;
			else {
				var d = date.split('-');
				return d[2];
			}
		},
		_applyEvents: function (evs) {
			for (var i = 0, el, ch, ev; i < evs.length; i++) {
				el = evs[i][0];
				if (evs[i].length === 2) {
					ch = undefined;
					ev = evs[i][1];
				} else if (evs[i].length === 3) {
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
		},
		_unapplyEvents: function (evs) {
			for (var i = 0, el, ev, ch; i < evs.length; i++) {
				el = evs[i][0];
				if (evs[i].length === 2) {
					ch = undefined;
					ev = evs[i][1];
				} else if (evs[i].length === 3) {
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_buildEvents: function () {
			var events = {
				keyup: $.proxy(function (e) {
					if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
						this.update();
				}, this),
				keydown: $.proxy(this.keydown, this),
				paste: $.proxy(this.paste, this)
			};

			if (this.o.showOnFocus === true) {
				events.focus = $.proxy(this.show, this);
			}

			if (this.isInput) { // single input
				this._events = [
					[this.element, events]
				];
			}
			// component: input + button
			else if (this.component && this.inputField.length) {
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.inputField, events],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			}
			this._events.push(
				// Component: listen for blur on element descendants
				[this.element, '*', {
					blur: $.proxy(function (e) {
						this._focused_from = e.target;
					}, this)
				}],
				// Input: listen for blur on element
				[this.element, {
					blur: $.proxy(function (e) {
						this._focused_from = e.target;
					}, this)
				}]
			);

			if (this.o.immediateUpdates) {
				this._events.push([this.element, {
					'changeYear changeMonth': $.proxy(function (e) {
						this.update(e.date);
					}, this)
				}]);
			}

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[this.picker, '.prev, .next', {
					click: $.proxy(this.navArrowsClick, this)
				}],
				[this.picker, '.day:not(.disabled)', {
					click: $.proxy(this.dayCellClick, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function (e) {
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length ||
							this.isInline
						)) {
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function () {
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function () {
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function () {
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
		},
		_detachSecondaryEvents: function () {
			this._unapplyEvents(this._secondaryEvents);
		},
		_trigger: function (event, altdate) {
			var date = altdate || this.dates.get(-1);

			this.element.trigger({
				type: event,
				date: date,
				viewMode: this.viewMode,
				dates: this.dates,
				format: $.proxy(function (ix, format) {
					if (arguments.length === 0) {
						ix = this.dates.length - 1;
						format = this.o.format;
					} else if (typeof ix === 'string') {
						format = ix;
						ix = this.dates.length - 1;
					}
					format = format || this.o.format;
					var date = this.dates.get(ix);
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},

		show: function () {
			if (this.inputField.is(':disabled') || (this.inputField.prop('readonly') && this.o.enableOnReadonly === false))
				return;
			if (!this.isInline)
				this.picker.appendTo(this.o.container);
			this.place();
			this.picker.show();
			this._attachSecondaryEvents();
			this._trigger('show');
			if ((window.navigator.msMaxTouchPoints || 'ontouchstart' in document) && this.o.disableTouchKeyboard) {
				$(this.element).blur();
			}
			return this;
		},

		hide: function () {
			if (this.isInline || !this.picker.is(':visible'))
				return this;
			this.focusDate = null;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.setViewMode(this.o.startView);

			if (this.o.forceParse && this.inputField.val())
				this.setValue();
			this._trigger('hide');
			return this;
		},

		destroy: function () {
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput) {
				delete this.element.data().date;
			}
			return this;
		},

		paste: function (e) {
			var dateString;
			if (e.originalEvent.clipboardData && e.originalEvent.clipboardData.types
				&& $.inArray('text/plain', e.originalEvent.clipboardData.types) !== -1) {
				dateString = e.originalEvent.clipboardData.getData('text/plain');
			} else if (window.clipboardData) {
				dateString = window.clipboardData.getData('Text');
			} else {
				return;
			}
			this.setDate(dateString);
			this.update();
			e.preventDefault();
		},

		_utc_to_local: function (utc) {
			if (!utc) {
				return utc;
			}

			var local = new Date(utc.getTime() + (utc.getTimezoneOffset() * 60000));

			if (local.getTimezoneOffset() !== utc.getTimezoneOffset()) {
				local = new Date(utc.getTime() + (local.getTimezoneOffset() * 60000));
			}

			return local;
		},
		_local_to_utc: function (local) {
			return local && new Date(local.getTime() - (local.getTimezoneOffset() * 60000));
		},
		_zero_time: function (local) {
			return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function (utc) {
			return utc && UTCDate(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
		},

		getDates: function () {
			return $.map(this.dates, this._utc_to_local);
		},

		getUTCDates: function () {
			return $.map(this.dates, function (d) {
				return new Date(d);
			});
		},

		getDate: function () {
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function () {
			var selected_date = this.dates.get(-1);
			if (selected_date !== undefined) {
				return new Date(selected_date);
			} else {
				return null;
			}
		},

		clearDates: function () {
			this.inputField.val('');
			this.update();
			this._trigger('changeDate');

			if (this.o.autoclose) {
				this.hide();
			}
		},

		setDates: function () {
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, args);
			this._trigger('changeDate');
			this.setValue();
			return this;
		},

		setUTCDates: function () {
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.setDates.apply(this, $.map(args, this._utc_to_local));
			return this;
		},

		setDate: alias('setDates'),
		setUTCDate: alias('setUTCDates'),
		remove: alias('destroy', 'Method `remove` is deprecated and will be removed in version 2.0. Use `destroy` instead'),

		setValue: function () {
			var formatted = this.getFormattedDate();
			this.inputField.val(formatted);
			return this;
		},
		getFormattedDate: function (year, month, date) {
			var format = undefined;
			if (year && month && date)
				return year + "-" + pad(month) + "-" + pad(date);
			if (format === undefined)
				format = this.o.format;

			var lang = this.o.language;
			if (this.dates.length === 0) {
				return this.viewDate;
			}
			return $.map(this.dates, function (d) {
				var _date = d.split("-");
				return _date[0] + "-" + _date[1] + "-" + _date[2];
			}).join(this.o.multidateSeparator);
		},

		getStartDate: function () {
			return this.o.startDate;
		},

		setStartDate: function (startDate) {
			this._process_options({ startDate: startDate });
			this.update();
			this.updateNavArrows();
			return this;
		},

		getEndDate: function () {
			return this.o.endDate;
		},

		setEndDate: function (endDate) {
			this._process_options({ endDate: endDate });
			this.update();
			this.updateNavArrows();
			return this;
		},

		setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
			this._process_options({ daysOfWeekDisabled: daysOfWeekDisabled });
			this.update();
			return this;
		},

		setDaysOfWeekHighlighted: function (daysOfWeekHighlighted) {
			this._process_options({ daysOfWeekHighlighted: daysOfWeekHighlighted });
			this.update();
			return this;
		},

		setDatesDisabled: function (datesDisabled) {
			this._process_options({ datesDisabled: datesDisabled });
			this.update();
			return this;
		},

		place: function () {
			if (this.isInline)
				return this;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				container = $(this.o.container),
				windowWidth = container.width(),
				scrollTop = this.o.container === 'body' ? $(document).scrollTop() : container.scrollTop(),
				appendOffset = container.offset();

			var parentsZindex = [0];
			this.element.parents().each(function () {
				var itemZIndex = $(this).css('z-index');
				if (itemZIndex !== 'auto' && Number(itemZIndex) !== 0) parentsZindex.push(Number(itemZIndex));
			});
			var zIndex = Math.max.apply(Math, parentsZindex) + this.o.zIndexOffset;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left - appendOffset.left;
			var top = offset.top - appendOffset.top + 2;

			if (this.o.container !== 'body') {
				top += scrollTop;
			}

			this.picker.removeClass(
				'datepicker-orient-top datepicker-orient-bottom ' +
				'datepicker-orient-right datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto') {
				this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			else {
				if (offset.left < 0) {
					this.picker.addClass('datepicker-orient-left');
					left -= offset.left - visualPadding;
				} else if (left + calendarWidth > windowWidth) {
					this.picker.addClass('datepicker-orient-right');
					left += width - calendarWidth;
				} else {
					if (this.o.rtl) {
						this.picker.addClass('datepicker-orient-right');
					} else {
						this.picker.addClass('datepicker-orient-left');
					}
				}
			}

			var yorient = this.o.orientation.y,
				top_overflow;
			if (yorient === 'auto') {
				top_overflow = -scrollTop + top - calendarHeight;
				yorient = top_overflow < 0 ? 'bottom' : 'top';
			}

			this.picker.addClass('datepicker-orient-' + yorient);
			if (yorient === 'top')
				top -= calendarHeight + parseInt(this.picker.css('padding-top'));
			else
				top += height;

			if (this.o.rtl) {
				var right = windowWidth - (left + width);
				this.picker.css({
					top: top,
					right: right,
					zIndex: zIndex
				});
			} else {
				this.picker.css({
					top: top,
					left: left,
					zIndex: zIndex
				});
			}
			return this;
		},
		setFullMonth: function (month) {
			let date = this.viewDate.split("-");
			date[1] = pad(month);
			this.viewDate = date.join('-');
		},
		setFullYear: function (y) {
			let date = this.viewDate.split("-");
			date[0] = pad(y);
			this.viewDate = date.join('-');
		},
		setFullDate: function (d) {
			let date = this.viewDate.split("-");
			date[2] = d;
			this.viewDate = date.join('-');
		},
		_allow_update: true,
		update: function () {
			if (!this._allow_update)
				return this;

			var oldDates = this.dates.copy(),
				dates = [],
				fromArgs = false;
			if (arguments.length) {
				$.each(arguments, $.proxy(function (i, date) {
					dates.push(date);
				}, this));
				fromArgs = true;
			} else {
				dates = this.isInput
					? this.element.val()
					: this.element.data('date') || this.inputField.val();
				if (dates && this.o.multidate)
					dates = dates.split(this.o.multidateSeparator);
				else
					dates = [dates];
				delete this.element.data().date;
			}

			dates = $.map(dates, $.proxy(function (date) {
				return DPGlobal.parseDate(date, this.o.format, this.o.language, this.o.assumeNearbyYear);
			}, this));
			dates = $.grep(dates, $.proxy(function (date) {
				return (
					!this.dateWithinRange(date) ||
					!date
				);
			}, this), true);
			this.dates.replace(dates);
			if (this.o.updateViewDate) {
				if (this.dates.length)
					this.viewDate = this.dates.get(-1);
				else if (this.isLessThen(this.viewDate, this.o.startDate))
					this.viewDate = this.o.startDate;
				else if (this.isGreaterThen(this.viewDate, this.o.endDate))
					this.viewDate = this.o.endDate;
				else
					this.viewDate = this.o.defaultViewDate;
			}
			if (fromArgs) {
				this.setValue();
				this.element.change();
			}
			else if (this.dates.length) {
				if (String(oldDates) !== String(this.dates) && fromArgs) {
					this._trigger('changeDate');
					this.element.change();
				}
			}
			if (!this.dates.length && oldDates.length) {
				this._trigger('clearDate');
				this.element.change();
			}

			this.fill();
			return this;
		},

		fillDow: function () {
			if (this.o.showWeekDays) {
				var dowCnt = this.o.weekStart,
					html = '<tr>';
				if (this.o.calendarWeeks) {
					html += '<th class="cw">&#160;</th>';
				}
				while (dowCnt < this.o.weekStart + 7) {
					html += '<th class="dow';
					if ($.inArray(dowCnt, this.o.daysOfWeekDisabled) !== -1)
						html += ' disabled';
					html += '">' + dates[this.o.language].daysMin[(dowCnt++) % 7] + '</th>';
				}
				html += '</tr>';
				this.picker.find('.datepicker-days thead').append(html);
			}
		},

		fillMonths: function () {
			var html = '';
			var focused;
			for (var i = 0; i < 12; i++) {
				focused = this.viewDate && Number(this.getNMonth(this.viewDate)) - 1 === i ? ' focused' : '';
				html += '<span class="month' + focused + '">' + dates[this.o.language].monthsShort[i] + '</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		setRange: function (range) {
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function (d) {
					return d.valueOf();
				});
			this.fill();
		},

		getClassNames: function (date) {
			_ndate = date.split("-");
			var cls = [],
				d = (this.viewDate).split('-'),
				year = parseInt(d[0]),
				month = parseInt(d[1]);
			today = this.todayNpDate();
			var _date = getUtcDateNp(date);
			if (Number(_ndate[0]) < year || (Number(_ndate[0]) === year && Number(_ndate[1]) < month)) {
				cls.push('old');
			} else if (parseInt(_ndate[0]) > year || (parseInt(_ndate[0]) === year && parseInt(_ndate[1]) > month)) {
				cls.push('new');
			}
			if (this.focusDate === date)
				cls.push('focused');
			if (this.o.todayHighlight && today === date) {
				cls.push('today');
			}
			if (this.viewDate === date)
				cls.push('active');
			if (!this.dateWithinRange(date)) {
				cls.push('disabled');
			}
			if (this.dateIsDisabled(date)) {
				cls.push('disabled', 'disabled-date');
			}
			if ($.inArray(_date.getUTCDay(), this.o.daysOfWeekHighlighted) !== -1) {
				cls.push('highlighted');
			}
			return cls;
		},

		_fill_yearsView: function (selector, cssClass, factor, year, startYear, endYear, beforeFn) {
			var html = '';
			var step = factor / 10;
			var view = this.picker.find(selector);
			var startVal = Math.floor(year / factor) * factor;
			var endVal = startVal + step * 9;
			var focusedVal = Math.floor(getNpFullYear(this.viewDate) / step) * step;
			var selected = $.map(this.dates, function (d) {
				return Math.floor(getNpFullYear(d) / step) * step;
			});

			var classes, tooltip, before;
			for (var currVal = startVal - step; currVal <= endVal + step; currVal += step) {
				classes = [cssClass];
				tooltip = null;

				if (currVal === startVal - step) {
					classes.push('old');
				} else if (currVal === endVal + step) {
					classes.push('new');
				}
				if ($.inArray(currVal, selected) !== -1) {
					classes.push('active');
				}
				if (currVal < startYear || currVal > endYear) {
					classes.push('disabled');
				}
				if (currVal === focusedVal) {
					classes.push('focused');
				}

				if (beforeFn !== $.noop) {
					before = beforeFn(new Date(currVal, 0, 1));
					if (before === undefined) {
						before = {};
					} else if (typeof before === 'boolean') {
						before = { enabled: before };
					} else if (typeof before === 'string') {
						before = { classes: before };
					}
					if (before.enabled === false) {
						classes.push('disabled');
					}
					if (before.classes) {
						classes = classes.concat(before.classes.split(/\s+/));
					}
					if (before.tooltip) {
						tooltip = before.tooltip;
					}
				}

				html += '<span class="' + classes.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + '>' + currVal + '</span>';
			}

			view.find('.datepicker-switch').text(startVal + '-' + endVal);
			view.find('td').html(html);
		},

		getPreviousWeekDay(dat) {
			let d_arr = dat.split('-');
			var date = getEngDate(d_arr[0], d_arr[1], d_arr[2]).split('-');
			var d = UTCDate(date[0], parseInt(date[1]) - 1, date[2]);
			weekDay = d.getUTCDay();
			while (weekDay !== this.o.weekStart) {
				d.setUTCDate(d.getDate() - 1);
				weekDay = d.getUTCDay();
			}
			return d;
		},
		isLessThen(date, targetDate) {
			var _date = getEngDate(date);
			var _targetDate = getEngDate(targetDate);
			var d1 = _date.split("-");
			var d2 = _targetDate.split("-");
			var d = new Date(d1[0], parseInt(d1[1]) - 1, d1[2]);
			var t = new Date(d2[0], parseInt(d2[1]) - 1, d2[2]);
			return d < t;
		},
		isGreaterThen(date, targetDate) {
			var _date = getEngDate(date);
			var _targetDate = getEngDate(targetDate);
			var d1 = _date.split("-");
			var d2 = _targetDate.split("-");
			var d = new Date(d1[0], parseInt(d1[1]) - 1, d1[2]);
			var t = new Date(d2[0], parseInt(d2[1]) - 1, d2[2]);
			return d > t;
		},

		isBetween(date, fromDate, toDate) {
			var dateFrom = getEngDate(fromDate);
			var dateTo = getEngDate(toDate);
			var dateCheck = getEngDate(date);

			var d1 = dateFrom.split("-");
			var d2 = dateTo.split("-");
			var c = dateCheck.split("-");

			var from = new Date(d1[0], parseInt(d1[1]) - 1, d1[2]);
			var to = new Date(d2[0], parseInt(d2[1]) - 1, d2[2]);
			var check = new Date(c[0], parseInt(c[1]) - 1, c[2]);
			return check >= from && check <= to;
		},
		getFullDate(year, month, day) {
			year = year || 2076;
			month = month || 1;
			day = day || 1;
			return this.getFormattedDate(year, month, day);
		},

		fill: function () {
			var d = this.viewDate.split('-'),
				year = d[0],
				month = d[1],
				startYear = this.o.startDate !== -Infinity ? this.getNYear(this.o.startDate) : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.getNMonth(this.o.startDate) : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.getNYear(this.o.endDate) : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.getNMonth(this.o.endDate) : Infinity,
				todaytxt = dates[this.o.language].today || dates['en'].today || '',
				cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
				todayDate = this.todayNpDate(),
				titleFormat = dates[this.o.language].titleFormat || dates['en'].titleFormat,
				titleBtnVisible = (this.o.todayBtn === true || this.o.todayBtn === 'linked') && this.isBetween(todayDate, this.o.startDate, this.o.endDate) && !this.weekOfDateIsDisabled(todayDate),
				tooltip,
				before;

			if (isNaN(year) || isNaN(month))
				return;
			this.picker.find('.datepicker-days .datepicker-switch')
				.text(DPGlobal.formatDate(d.join("-"), titleFormat, this.o.language));
			this.picker.find('tfoot .today')
				.text(todaytxt)
				.css('display', titleBtnVisible ? 'table-cell' : 'none');
			this.picker.find('tfoot .clear')
				.text(cleartxt)
				.css('display', this.o.clearBtn === true ? 'table-cell' : 'none');
			this.picker.find('thead .datepicker-title')
				.text(this.o.title)
				.css('display', typeof this.o.title === 'string' && this.o.title !== '' ? 'table-cell' : 'none');
			this.updateNavArrows();
			this.fillMonths();
			prevMonth = this.getPreviousWeekDay(this.getFullDate(year, month, 1));
			var nnextMonth = new Date(prevMonth);
			nnextMonth.setUTCDate(nnextMonth.getUTCDate() + 42);
			var html = [];
			var weekDay, clsName;

			while (prevMonth.valueOf() < nnextMonth) {
				weekDay = prevMonth.getUTCDay();
				if (weekDay === this.o.weekStart) {
					html.push('<tr>');
				}
				clsName = this.getClassNames(getNpDate(prevMonth));
				clsName.push('day');
				var nContentFull = getNpDate(prevMonth);
				var nContent = parseInt(nContentFull.split("-")[2]);
				if (this.o.beforeShowDay !== $.noop) {
					before = this.o.beforeShowDay(getNpDate(prevMonth), prevMonth);
					if (before === undefined)
						before = {};
					else if (typeof before === 'boolean')
						before = { enabled: before };
					else if (typeof before === 'string')
						before = { classes: before };
					if (before.enabled === false)
						clsName.push('disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
					if (before.content)
						content = before.content;
				}
				if ($.isFunction($.uniqueSort)) {
					clsName = $.uniqueSort(clsName);
				} else {
					clsName = $.unique(clsName);
				}
				html.push('<td class="' + clsName.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + ' data-date="' + getNpDate(prevMonth) + '" data-ndate="' + nContentFull + '">' + nContent + '</td>');
				tooltip = null;
				if (weekDay === this.o.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
			}
			this.picker.find('.datepicker-days tbody').html(html.join(''));
			var monthsTitle = dates[this.o.language].monthsTitle || dates['en'].monthsTitle || 'Months';
			var months = this.picker.find('.datepicker-months')
				.find('.datepicker-switch')
				.text(this.o.maxViewMode < 2 ? monthsTitle : (this.viewDate).split('-')[0])
				.end()
				.find('tbody span').removeClass('active');
			$.each(this.dates, function (i, d) {
				if (getNpFullYear(d) === year)
					months.eq(Number(getNpFullMonth(d)) - 1).addClass('active');
			});
			if (year < startYear || year > endYear) {
				months.addClass('disabled');
			}
			if (year === startYear) {
				months.slice(0, Number(startMonth)).addClass('disabled');
			}
			if (year === endYear) {
				months.slice(Number(endMonth)).addClass('disabled');
			}

			if (this.o.beforeShowMonth !== $.noop) {
				var that = this;
				$.each(months, function (i, month) {
					var moDate = new Date(year, i, 1);
					var before = that.o.beforeShowMonth(moDate);
					if (before === undefined)
						before = {};
					else if (typeof before === 'boolean')
						before = { enabled: before };
					else if (typeof before === 'string')
						before = { classes: before };
					if (before.enabled === false && !$(month).hasClass('disabled'))
						$(month).addClass('disabled');
					if (before.classes)
						$(month).addClass(before.classes);
					if (before.tooltip)
						$(month).prop('title', before.tooltip);
				});
			}

			this._fill_yearsView(
				'.datepicker-years',
				'year',
				10,
				year,
				startYear,
				endYear,
				this.o.beforeShowYear
			);

			this._fill_yearsView(
				'.datepicker-decades',
				'decade',
				100,
				year,
				startYear,
				endYear,
				this.o.beforeShowDecade
			);

			this._fill_yearsView(
				'.datepicker-centuries',
				'century',
				1000,
				year,
				startYear,
				endYear,
				this.o.beforeShowCentury
			);
		},

		updateNavArrows: function () {
			if (!this._allow_update)
				return;
			var d = this.viewDate.split('-'),
				year = d[0],
				month = d[1],
				date = d[2],
				startYear = this.o.startDate !== -Infinity ? this.getNYear(this.o.startDate) : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.getNMonth(this.o.startDate) : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.getNYear(this.o.endDate) : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.getNMonth(this.o.endDate) : Infinity,
				prevIsDisabled,
				nextIsDisabled,
				factor = 1;
			switch (this.viewMode) {
				case 4:
					factor *= 10;
				/* falls through */
				case 3:
					factor *= 10;
				/* falls through */
				case 2:
					factor *= 10;
				/* falls through */
				case 1:
					prevIsDisabled = Math.floor(year / factor) * factor <= startYear;
					nextIsDisabled = Math.floor(year / factor) * factor + factor > endYear;
					break;
				case 0:
					prevIsDisabled = year <= startYear && month <= startMonth;
					nextIsDisabled = year >= endYear && month >= endMonth;
					break;
			}

			this.picker.find('.prev').toggleClass('disabled', prevIsDisabled);
			this.picker.find('.next').toggleClass('disabled', nextIsDisabled);
		},
		setNepDate: function (date) {
			let oldView = this.viewDate.split("-");
			this.viewDate = this.getFullDate(oldView[0], oldView[1], date);
		},
		setNepMonth: function () { },
		setNepYear: function () { },
		click: function (e) {
			e.preventDefault();
			e.stopPropagation();

			var target, dir, day, year, month;
			target = $(e.target);

			if (target.hasClass('datepicker-switch') && this.viewMode !== this.o.maxViewMode) {
				this.setViewMode(this.viewMode + 1);
			}

			if (target.hasClass('today') && !target.hasClass('day')) {
				this.setViewMode(0);
				this._setDate(this.todayNpDate(), this.o.todayBtn === 'linked' ? null : 'view');
			}

			if (target.hasClass('clear')) {
				this.clearDates();
			}

			if (!target.hasClass('disabled')) {
				if (target.hasClass('month')
					|| target.hasClass('year')
					|| target.hasClass('decade')
					|| target.hasClass('century')) {
					this.setNepDate(1);

					day = 1;
					if (this.viewMode === 1) {
						month = target.parent().find('span').index(target);
						year = getNpFullYear(this.viewDate);
						this.setFullMonth(month + 1);
					} else {
						month = 0;
						year = Number(target.text());
						this.setFullYear(year);
					}

					this._trigger(DPGlobal.viewModes[this.viewMode - 1].e, this.viewDate);

					if (this.viewMode === this.o.minViewMode) {
						this._setDate(this.getFullDate(year, month, day));
					} else {
						this.setViewMode(this.viewMode - 1);
						this.fill();
					}
				}
			}

			if (this.picker.is(':visible') && this._focused_from) {
				this._focused_from.focus();
			}
			delete this._focused_from;
		},

		dayCellClick: function (e) {
			var $target = $(e.currentTarget);
			var timestamp = $target.data('date');
			var date = timestamp;

			if (this.o.updateViewDate) {
				if (getNpFullYear(date) !== getNpFullYear(this.viewDate)) {
					this._trigger('changeYear', this.viewDate);
				}

				if (getNpFullMonth(date) !== getNpFullMonth(this.viewDate)) {
					this._trigger('changeMonth', this.viewDate);
				}
			}
			this._setDate(date);
		},

		navArrowsClick: function (e) {
			var $target = $(e.currentTarget);
			var dir = $target.hasClass('prev') ? -1 : 1;
			if (this.viewMode === 1) {
				this.viewDate = this.moveYear(this.viewDate, dir);
			}
			else if (this.viewMode === 0) {
				this.viewDate = this.moveMonth(this.viewDate, dir);
			}
			else if (this.viewMode === 2) {
				this.viewDate = this.moveDecade(this.viewDate, dir);
			}
			this._trigger(DPGlobal.viewModes[this.viewMode].e, this.viewDate);
			this.fill();
		},

		_toggle_multidate: function (date) {
			var ix = this.dates.contains(date);
			if (!date) {
				this.dates.clear();
			}

			if (ix !== -1) {
				if (this.o.multidate === true || this.o.multidate > 1 || this.o.toggleActive) {
					this.dates.remove(ix);
				}
			} else if (this.o.multidate === false) {
				this.dates.clear();
				this.dates.push(date);
			}
			else {
				this.dates.push(date);
			}

			if (typeof this.o.multidate === 'number')
				while (this.dates.length > this.o.multidate)
					this.dates.remove(0);
		},

		_setDate: function (date, which) {
			if (!which || which === 'date')
				this._toggle_multidate(date);
			if ((!which && this.o.updateViewDate) || which === 'view')
				this.viewDate = date;

			this.fill();
			this.setValue();
			if (!which || which !== 'view') {
				this._trigger('changeDate');
			}
			this.inputField.trigger('change');
			if (this.o.autoclose && (!which || which === 'date')) {
				this.hide();
			}
		},

		moveDay: function (date, dir) {
			dir = dir > 0 ? 1 : -1;
			var npDate = date.split("-");
			var y = Number(npDate[0]);
			var m = Number(npDate[1]);
			var d = Number(npDate[2]);
			if (dir === 1) {
				if (isLastDayOfMonth(date)) {
					if (m === 12) {
						y++;
						m = 1;
						d = 1;
					}
					else {
						m++;
						d = 1;
					}
				}
				else
					d++;
			}
			else {
				if (d === 1) {
					if (m === 1) {
						y--;
						m = 12;
						d = getLastDay(y, m);
					}
					else {
						m--;
						d = getLastDay(y, m);
					}
				}
				else
					d--;
			}
			return this.getFullDate(y, m, d);
		},

		moveMonth: function (date, dir) {
			if (!dir)
				return date;
			dir = dir > 0 ? 1 : -1;
			var npDate = date.split("-");
			var y = Number(npDate[0]);
			var m = Number(npDate[1]);
			if (dir === 1) {
				if (Number(npDate[1]) === 12) {
					y++;
					m = 1;
				}
				else {
					m++;
				}
			}
			else {
				if (Number(npDate[1]) === 1) {
					y--;
					m = 12;
				}
				else {
					m--;
				}
			}
			return this.getFullDate(y, m, 1);
		},

		moveYear: function (date, dir) {
			if (!dir)
				return date;
			dir = dir > 0 ? 1 : -1;

			var npDate = date.split("-");
			var y = Number(npDate[0]);
			var m = Number(npDate[1]);
			if (dir === 1)
				y++;
			else
				y--;
			return this.getFullDate(y, m, 1);
		},

		moveDecade: function (date, dir) {
			if (!dir)
				return date;
			dir = dir > 0 ? 1 : -1;
			var npDate = date.split("-");
			var y = Number(npDate[0]);
			var m = Number(npDate[1]);
			if (dir === 1)
				return this.getFullDate(y + 10, m, 1);
			else
				return this.getFullDate(y - 10, m, 1);
		},

		moveAvailableDate: function (date, dir, fn) {
			do {
				date = this[fn](date, dir);

				if (!this.dateWithinRange(date))
					return false;

				fn = 'moveDay';
			}
			while (this.dateIsDisabled(date));

			return date;
		},

		weekOfDateIsDisabled: function (date) {
			let engDate = new Date(getEngDate(date.split('-')[0], date.split('-')[1], date.split('-')[2]));
			date = UTCDate(engDate.getUTCFullYear(), engDate.getUTCMonth(), engDate.getUTCDate());
			return $.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1;
		},

		dateIsDisabled: function (date) {
			return (
				this.weekOfDateIsDisabled(date) ||
				$.grep(this.o.datesDisabled, function (d) {
					return date === d;
				}).length > 0
			);
		},

		dateWithinRange: function (date) {
			return this.isBetween(date, this.o.startDate, this.o.endDate);
		},

		keydown: function (e) {
			if (!this.picker.is(':visible')) {
				if (e.keyCode === 40 || e.keyCode === 27) {
					this.show();
					e.stopPropagation();
				}
				return;
			}
			var dateChanged = false,
				dir, newViewDate,
				focusDate = this.focusDate || this.viewDate;
			switch (e.keyCode) {
				case 27: // escape
					if (this.focusDate) {
						this.focusDate = null;
						this.viewDate = this.dates.get(-1) || this.viewDate;
						this.fill();
					}
					else
						this.hide();
					e.preventDefault();
					e.stopPropagation();
					break;
				case 37:
				case 38:
				case 39:
				case 40:
					if (!this.o.keyboardNavigation || this.o.daysOfWeekDisabled.length === 7)
						break;
					dir = e.keyCode === 37 || e.keyCode === 38 ? -1 : 1;
					if (this.viewMode === 0) {
						if (e.ctrlKey) {
							newViewDate = this.moveAvailableDate(focusDate, dir, 'moveYear');

							if (newViewDate)
								this._trigger('changeYear', this.viewDate);
						} else if (e.shiftKey) {
							newViewDate = this.moveAvailableDate(focusDate, dir, 'moveMonth');

							if (newViewDate)
								this._trigger('changeMonth', this.viewDate);
						} else if (e.keyCode === 37 || e.keyCode === 39) {
							newViewDate = this.moveAvailableDate(focusDate, dir, 'moveDay');
						}
					} else if (this.viewMode === 1) {
						if (e.keyCode === 38 || e.keyCode === 40) {
							dir = dir * 4;
						}
						newViewDate = this.moveAvailableDate(focusDate, dir, 'moveMonth');
					} else if (this.viewMode === 2) {
						if (e.keyCode === 38 || e.keyCode === 40) {
							dir = dir * 4;
						}
						newViewDate = this.moveAvailableDate(focusDate, dir, 'moveYear');
					}
					if (newViewDate) {
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 13:
					if (!this.o.forceParse)
						break;
					focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
					if (this.o.keyboardNavigation) {
						this._toggle_multidate(focusDate);
						dateChanged = true;
					}
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.setValue();
					this.fill();
					if (this.picker.is(':visible')) {
						e.preventDefault();
						e.stopPropagation();
						if (this.o.autoclose)
							this.hide();
					}
					break;
				case 9: // tab
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.fill();
					this.hide();
					break;
			}
			if (dateChanged) {
				if (this.dates.length)
					this._trigger('changeDate');
				else
					this._trigger('clearDate');
				this.inputField.trigger('change');
			}
		},
		setViewMode: function (viewMode) {
			this.viewMode = viewMode;
			this.picker
				.children('div')
				.hide()
				.filter('.datepicker-' + DPGlobal.viewModes[this.viewMode].clsName)
				.show();
			this.updateNavArrows();
			this._trigger('changeViewMode', this.viewDate);
		}
	};

	function opts_from_el(el, prefix) {
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
		prefix = new RegExp('^' + prefix.toLowerCase());
		function re_lower(_, a) {
			return a.toLowerCase();
		}
		for (var key in data)
			if (prefix.test(key)) {
				inkey = key.replace(replace, re_lower);
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang) {
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]) {
			lang = lang.split('-')[0];
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function (i, k) {
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var datepickerPlugin = function (option) {
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data) {
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.hasClass('input-daterange') || opts.inputs) {
					$.extend(opts, {
						inputs: opts.inputs || $this.find('input').toArray()
					});
					data = new DateRangePicker(this, opts);
				}
				else {
					data = new Datepicker(this, opts);
				}
				$this.data('datepicker', data);
			}
			if (typeof option === 'string' && typeof data[option] === 'function') {
				internal_return = data[option].apply(data, args);
			}
		});

		if (
			internal_return === undefined ||
			internal_return instanceof Datepicker ||
			internal_return instanceof DateRangePicker
		)
			return this;

		if (this.length > 1)
			throw new Error('Using only allowed for the collection of a single element (' + option + ' function)');
		else
			return internal_return;
	};
	$.fn.npdatepicker = datepickerPlugin;

	var defaults = $.fn.npdatepicker.defaults = {
		assumeNearbyYear: false,
		autoclose: true,
		beforeShowDay: $.noop,
		beforeShowMonth: $.noop,
		beforeShowYear: $.noop,
		beforeShowDecade: $.noop,
		beforeShowCentury: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		toggleActive: false,
		daysOfWeekDisabled: [],
		daysOfWeekHighlighted: [],
		datesDisabled: [],
		endDate: "2088-12-30",
		forceParse: true,
		format: 'mm/dd/yyyy',
		keepEmptyValues: false,
		keyboardNavigation: true,
		language: 'np',
		minViewMode: 0,
		maxViewMode: 4,
		multidate: false,
		multidateSeparator: ',',
		orientation: "auto",
		rtl: false,
		startDate: "2001-01-01",
		startView: 0,
		todayBtn: false,
		todayHighlight: true,
		updateViewDate: true,
		weekStart: 0,
		disableTouchKeyboard: false,
		enableOnReadonly: true,
		showOnFocus: true,
		zIndexOffset: 10,
		container: 'body',
		immediateUpdates: false,
		title: '',
		templates: {
			leftArrow: '&#x00AB;',
			rightArrow: '&#x00BB;'
		},
		showWeekDays: true
	};
	var locale_opts = $.fn.npdatepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.npdatepicker.Constructor = Datepicker;
	var dates = $.fn.npdatepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
			months: ["Baisakh", "Jestha", "Ashar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"],
			monthsShort: ["Baisakh", "Jestha", "Ashar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"],
			today: "Today",
			clear: "Clear",
			titleFormat: "MM yyyy"
		},
		np: {
			days: ["आ", "सो", "मं", "बु", "बि", "शु", "श"],
			daysShort: ["आ", "सो", "मं", "बु", "बि", "शु", "श"],
			daysMin: ["आ", "सो", "मं", "बु", "बि", "शु", "श"],
			months: ["बैशाख", "जेठ", "अषाढ", "श्रावण", "भाद्र", "आश्विन", "कार्तिक", "मङ्सिर", "पौष", "माघ", "फाल्गुन", "चैत्र"],
			monthsShort: ["बैशाख", "जेठ", "अषाढ", "श्रावण", "भाद्र", "आश्विन", "कार्तिक", "मङ्सिर", "पौष", "माघ", "फाल्गुन", "चैत्र"],
			today: "आज",
			clear: "Clear",
			titleFormat: "MM yyyy"
		}
	};

	var DPGlobal = {
		viewModes: [
			{
				names: ['days', 'month'],
				clsName: 'days',
				e: 'changeMonth'
			},
			{
				names: ['months', 'year'],
				clsName: 'months',
				e: 'changeYear',
				navStep: 1
			},
			{
				names: ['years', 'decade'],
				clsName: 'years',
				e: 'changeDecade',
				navStep: 10
			},
			{
				names: ['decades', 'century'],
				clsName: 'decades',
				e: 'changeCentury',
				navStep: 100
			},
			{
				names: ['centuries', 'millennium'],
				clsName: 'centuries',
				e: 'changeMillennium',
				navStep: 1000
			}
		],
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\u5e74\u6708\u65e5\[-`{-~\t\n\r]+/g,
		parseFormat: function (format) {
			if (typeof format.toValue === 'function' && typeof format.toDisplay === 'function')
				return format;

			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0) {
				throw new Error("Invalid date format.");
			}
			return { separators: separators, parts: parts };
		},
		parseDate: function (date, format, language, assumeNearby) {
			return date;
		},
		formatDate: function (date, format, language) {
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			if (format.toDisplay)
				return format.toDisplay(date, format, language);
			var npDate = date.split("-");
			date = getUtcDateNp(date);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
				m: parseInt(npDate[1]),
				M: dates[language].monthsShort[parseInt(npDate[1]) - 1],
				MM: dates[language].months[parseInt(npDate[1]) - 1],
				yy: npDate[0].toString().substring(2),
				yyyy: npDate[0]
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			date = [];
			var seps = $.extend([], format.separators);
			for (var i = 0, cnt = format.parts.length; i <= cnt; i++) {
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>' +
			'<tr>' +
			'<th colspan="7" class="datepicker-title"></th>' +
			'</tr>' +
			'<tr>' +
			'<th class="prev">' + defaults.templates.leftArrow + '</th>' +
			'<th colspan="5" class="datepicker-switch"></th>' +
			'<th class="next">' + defaults.templates.rightArrow + '</th>' +
			'</tr>' +
			'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot>' +
			'<tr>' +
			'<th colspan="7" class="today"></th>' +
			'</tr>' +
			'<tr>' +
			'<th colspan="7" class="clear"></th>' +
			'</tr>' +
			'</tfoot>'
	};
	DPGlobal.template = '<div class="datepicker">' +
		'<div class="datepicker-days">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		'<tbody></tbody>' +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datepicker-months">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datepicker-years">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datepicker-decades">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datepicker-centuries">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'</div>';

	$.fn.npdatepicker.DPGlobal = DPGlobal;

	$.fn.npdatepicker.version = '1.9.0';

	$.fn.npdatepicker.deprecated = function (msg) {
		var console = window.console;
		if (console && console.warn) {
			console.warn('DEPRECATED: ' + msg);
		}
	};


	/* DATEPICKER DATA-API
	* ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function (e) {
			var $this = $(this);
			if ($this.data('datepicker'))
				return;
			e.preventDefault();
			datepickerPlugin.call($this, 'show');
		}
	);
	$(function () {
		datepickerPlugin.call($('[data-provide="datepicker-inline"]'));
	});

}));