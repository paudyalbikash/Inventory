let permission = {
	grid: null,
	title: "Permission Management",
	init: function() {
		common.activateNav("permissions");
		common.setTitle(permission.title);
		permission.layout();
	},
	accessWards: [],

	getAccessWards: (onSuccess) => {
		$.ajax({
			url: rootPath + "home/getaccesswards",
			success: (data) => {
				permission.accessWards = data;
				if (common.isFunction(onSuccess)) {
					onSuccess(data);
				}
			}
		});
	},

	isAccessible: function() {
		const currentWard = jsHelper.getCookie("_ward");
		return Enumerable.from(permission.accessWards).any(x => x.WardId === Number(currentWard));
	},

	layout: function() {
		let html = "";
		html += `<div class="card">
				<div class="card-body">
				<div data-list="permission">  
				</div>
				</div>
				</div>`;
		common.setWorkspace(html);

		const gridDataSource = new DevExpress.data.DataSource({
			load: function() {
				const d = $.Deferred();
				$.ajax({
					url: domain + "permission/get",
					success: function(data) {
						d.resolve(data);
					},
					error: function() {
						d.reject("Error on loading data");
					}
				});
				return d.promise();
			},

			update: function(key, values) {
				const data = { ...key, ...values };
				const d = $.Deferred();
				$.ajax({
					url: domain + "permission/set",
					method: "POST",
					data: data,
					success: function(response) {
						if (response.HasError)
							d.reject(response.Message);
						else
							d.resolve();
					}
				});
				return d.promise();
			}

		});

		$('[data-list="permission"]').dxDataGrid({
			dataSource: gridDataSource,
			allowColumnReordering: false,
			columnAutoWidth: true,
			showRowLines: true,
			showBorders: true,
			editing: {
				allowUpdating: true,
				mode: "cell"
			},
			paging: {
				enabled: false
			},
			columns: [
				{
					dataField: "Ward",
					allowEditing: false
				},
				{
					dataField: "Name",
					allowEditing: false,
					groupIndex: 0,
					groupCellTemplate: function(c, o) {
						const data = o.row.data.items ? o.row.data.items[0] : o.row.data.collapsedItems[0];
						let staHtm = "";
						if (data.Status === true) {
							staHtm =
								`<div class="text-muted font-size-sm"><span class="badge badge-mark border-blue mr-1"></span> Active</div>`;
						} else {
							staHtm =
								`<div class="text-muted font-size-sm"><span class="badge badge-mark border-red mr-1"></span> Inactive</div>`;
						}
						const htm = `<div class="d-flex align-items-center">
										<div class="mr-3">
											<a href="#" class="rounded-round">
												<img src="${data.Avatar ? rootPath + data.Avatar : dataHelper.avatarUrl
							}" width="38" height="38" class="rounded-circle user-img-alt" onError="imgError(this)" alt="">
											</a>
										</div>
										<div>
											<a href="javascript:void(0)" class="text-default font-weight-semibold letter-icon-title">${
							parseString(data.Name)}</a> <br/>
											<a href="javascript:void(0)" class="text-default text-muted letter-icon-title">${
							parseString(data.Email)}</a>${staHtm}
										</div>
									</div>`;
						c.append(htm);

					}
				},
				{
					dataField: "UserId",
					visible: false,
					allowEditing: false
				},
				{
					dataField: "WardId",
					visible: false
				},
				{
					dataField: "Read",
					datatype: "boolean"
				},
				{
					dataField: "Write",
					dataType: "boolean"
				},
				{
					dataField: "Delete",
					dataType: "boolean"
				}
			],
			onToolbarPreparing: function(e) {
				e.toolbarOptions.items.unshift({
					locateInMenu: "always",
					text: "Refresh",
					onClick: function() {
						e.component.refresh();
					}
				});
			}
		});
	}
};

export default permission;