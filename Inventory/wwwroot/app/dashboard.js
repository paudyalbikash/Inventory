import permission from "./common/permission.js";

let dashboard = {
    grid: null,
    init: function () {
        common.activateNav("");
        common.setTitle("");
        dashboard.layout();
    },
    layout: function () {
        let html = "";
        let multiple = false;
        let wardName = '';
        permission.getAccessWards(function () {
            multiple = Enumerable.from(permission.accessWards).where(x => x.Read === true || x.Write === true).toArray().length > 1 ? true : false;
            if(!multiple)
                wardName = Enumerable.from(permission.accessWards).where(x => x.Read === true || x.Write === true).select(x => x.Name).firstOrDefault();
            html += `<div class="card">
                    <div class="card-body">
                        <div class="row">
                                 <div class="col-lg-3">
                                    <div class="card bg-teal-400">
                                        <div class="card-body">
                                            <div class="d-flex">
                                                <h1 data-farmer="true" class="font-weight-semibold mb-0">1</h1>
                                            </div>
                                                Total Farmers
                                        </div>
                                    </div>
                                </div>

                               <div class="col-lg-3">
                                    <div class="card bg-pink-400">
                                        <div class="card-body">
                                            <div class="d-flex">
                                                <h1 data-entrepreneur="true" class="font-weight-semibold mb-0">1003</h1>
                                            </div>
                                                Total Entrepreneur
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-3">
                                    <div class="card bg-blue-400">
                                        <div class="card-body">
                                            <div class="d-flex">
                                                <h1 data-cooperative="true" class="font-weight-semibold mb-0">N/A</h1>
                                            </div>
                                               Total Co-operatives
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-3">
                                        <div class="card bg-indigo-300">
                                            <div class="card-body">
                                                <div class="d-flex">
                                                    <h1 data-collectioncenter="true" class="font-weight-semibold mb-0">2</h1>
                                                </div>
                                                   Collection Center
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        ${ multiple ? '<div class="row" data-list="collection-last-week">' : ''}
                    </div>
                </div>`;
            if (multiple) {
                html += `<div class="card">
                        <div class="card-body">
                                <div class="row" data-list="ent-farmer">
                            </div>
                        </div>`;
            }
            else {
                html += `<div class="row">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="row" data-list="ef"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="row" data-list="col"></div>

                                    </div>
                                </div>
                            </div>
                        </div>`;

            }

            html + `</div>`;
            common.setWorkspace(html);
            if (multiple) {

                $.ajax({
                    url: rootPath + "home/getweeklycollection",
                    method: "Get",
                    success: function (data) {
                        data = data[0];
                        let startDate = data.StartDate;
                        let endDate = data.EndDate;
                        let series = JSON.parse(data.Series || '[]');
                        let collCenter = JSON.parse(data.CollectionCenter || '[]');
                        var serData = [];
                        do {
                            collCenter.forEach(a => {
                                let data = Enumerable.from(series)
                                    .where(x => moment(x.Date).format("YYYY-MM-DD") === moment(startDate).format("YYYY-MM-DD") && x.CollectionCenterId === a.Id)
                                    .select(x => { return { Day: moment(x.Date).format("dddd"), Quantity: x.Quantity }; }).toArray();

                                data.forEach(x => {
                                    x[a.Name] = x.Quantity;
                                });
                                serData.push(data);
                            });
                            startDate = moment(startDate).add(1, 'days');
                        } while (moment(startDate).format("YYYY-MM-DD") !== moment(endDate).add(1, 'days').format("YYYY-MM-DD"));
                        $("[data-list='collection-last-week']").dxChart({
                            commonSeriesSettings: {
                                argumentField: "Day",
                                type: "stackedBar"
                            },
                            palette: "Material",
                            margin: {
                                bottom: 20
                            },
                            argumentAxis: {
                                valueMarginsEnabled: false,
                                discreteAxisDivisionMode: "crossLabels",
                                grid: {
                                    visible: true
                                }
                            },
                            series: collCenter.map(function (x) {
                                return { valueField: x.Name, name: x.Name };
                            }),
                            legend: {
                                verticalAlignment: "bottom",
                                horizontalAlignment: "center",
                                itemTextPosition: "bottom",
                                border: { visible: true }
                            },
                            title: {
                                text: "Total collection this week",
                                subtitle: {
                                    text: "(Per unit)"
                                }
                            },
                            dataSource: serData.flat(),
                            "export": {
                                enabled: true
                            },
                            tooltip: {
                                enabled: true
                            }
                        });
                    }
                });

                $.ajax({
                    url: rootPath + "home/getefwardwise",
                    success: function (data) {
                        data = data[0];
                        let farmers = JSON.parse(data.Farmer || '[]');
                        let entrepreneur = JSON.parse(data.Entrepreneur || '[]');

                        permission.getAccessWards(function (accWards) {
                            let aWards = Enumerable.from(accWards).where(x => x.Read === true).toArray();
                            let serData = [];
                            aWards.forEach(a => {
                                let temp = {};
                                temp["Farmer"] = Enumerable.from(farmers).where(x => x.WardId === a.WardId).select(x => x.Total).firstOrDefault();
                                temp["Entrepreneur"] = Enumerable.from(entrepreneur).where(x => x.WardId === a.WardId).select(x => x.Total).firstOrDefault();
                                temp["Ward"] = a.Name;
                                serData.push(temp);
                            });
                            $("[data-list='ent-farmer']").dxChart({
                                commonSeriesSettings: {
                                    argumentField: "Ward",
                                    type: "stackedBar"
                                },
                                palette: "Material",
                                margin: {
                                    bottom: 20
                                },
                                argumentAxis: {
                                    valueMarginsEnabled: false,
                                    discreteAxisDivisionMode: "crossLabels",
                                    grid: {
                                        visible: true
                                    }
                                },
                                series: [
                                    { valueField: 'Entrepreneur', name: "Entrepreneur" },
                                    { valueField: 'Farmer', name: "Farmer" }
                                ],
                                legend: {
                                    verticalAlignment: "bottom",
                                    horizontalAlignment: "center",
                                    itemTextPosition: "bottom",
                                    border: { visible: true }
                                },
                                title: {
                                    text: "Entrepreneur and Farmer distribution wardwise"
                                    //subtitle: {
                                    //    text: "(Per unit)"
                                    //}
                                },
                                dataSource: serData,
                                "export": {
                                    enabled: true
                                },
                                tooltip: {
                                    enabled: true
                                }
                            });
                        });
                    }
                });
            }
            else {
                $.ajax({
                    url: rootPath + "home/getefsingle",
                    success: function (data) {
                        $("[data-list='ef']").dxPieChart({
                            size: {
                                width: 500
                            },
                            tooltip: {
                                enabled: true
                            },
                            palette: "bright",
                            dataSource: [{
                                Type: "Farmer",
                                count: data[0].Farmer ? data[0].Farmer : 0
                            },
                            {
                                Type: "Entrepreneur",
                                count: data[0].Entrepreneur ? data[0].Entrepreneur : 0
                            }],
                            series: [
                                {
                                    argumentField: "Type",
                                    valueField: "count"
                                }
                            ],
                            legend: {
                                columnCount: 2,
                                horizontalAlignment: "center",
                                hoverMode: "allArgumentPoints",
                                verticalAlignment: "top",
                                visible: true
                            },
                            title: "Members distribution on " + wardName,
                            "export": {
                                enabled: true
                            }
                        });
                    }
                });

                $.ajax({
                    url: rootPath + "home/getcollectionsingle",
                    success: function (data) {
                        $("[data-list='col']").dxPieChart({
                            size: {
                                width: 500
                            },
                            palette: "bright",
                            dataSource: data,
                            series: [
                                {
                                    argumentField: "Name",
                                    valueField: "Quantity",
                                    label: {
                                        visible: true,
                                        connector: {
                                            visible: true,
                                            width: 1
                                        }
                                    }
                                }
                            ],
                            onDrawn: function (e) {
                                let ds = e.component.getDataSource();
                            },
                            legend: {
                                horizontalAlignment: "center",
                                hoverMode: "allArgumentPoints",
                                verticalAlignment: "top",
                                visible: true
                            },
                            title: "Collection Today on " + wardName,
                            "export": {
                                enabled: true
                            }
                        });
                    }
                });
            }

            $.ajax({
                url: rootPath + "home/getdashstats",
                success: function (data) {
                    if (data.length > 0) {
                        let d = data[0];
                        $('[data-farmer]').text(d.Farmers);
                        $('[data-collectioncenter]').text(d.CollectionCenter);
                        $('[data-cooperative]').text(d.Cooperative);
                        $('[data-entrepreneur]').text(d.Entrepreneur);
                    }
                }
            });


        });
    }
};

export default dashboard;
