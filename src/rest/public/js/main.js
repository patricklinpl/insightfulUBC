/**
 * Created by patricklinpl on 2017-03-28.
 */

function getDropDownVal(classID) {
    var a = document.getElementById(classID);
    return a.options[a.selectedIndex].text;
}

function cssDropDown(classID, cssClass) {
    $(classID)
        .selectmenu()
        .selectmenu("menuWidget")
        .addClass(cssClass);
}

function numberDropOptions(selectProperty, selectVal, property, id) {
    var query = {
        "WHERE": {
            "IS": {}
        },
        "OPTIONS": {
            "COLUMNS": [
                property
            ],
            "ORDER": property,
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": [
                property
            ],
            "APPLY": []
        }
    };

    query['WHERE']['IS'][selectProperty] = selectVal;

    var tempArray = [];

    $(id).append("<option value=" + ""
        + ">" + "</option>");
    return new Promise(function (fulfill, reject) {
        $.ajax({
            url: "/query",
            type: "POST",
            data: JSON.stringify(query),
            contentType: "application/json",
            datatType: "json",
            success: function (data) {
                tempArray = data['result'];
            }
        }).then(function () {
            for (var i = 0; i < tempArray.length; i++) {
                if (tempArray[i][property].length > 0) {
                    $(id).append("<option value=" + tempArray[i][property]
                        + ">" + tempArray[i][property] + "</option>");
                }
            }
            fulfill();
        }).fail(function () {
            reject();
        });
    });
}

function dropDownOptions(id, property) {
    var query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                property
            ],
            "ORDER": property,
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": [
                property
            ],
            "APPLY": []
        }
    };
    var tempArray = [];
    return new Promise(function (fulfill, reject) {
        $.ajax({
            url: "/query",
            type: "POST",
            data: JSON.stringify(query),
            contentType: "application/json",
            datatType: "json",
            success: function (data) {
                tempArray = data['result'];
            }
        }).then(function () {
            for (var i = 0; i < tempArray.length; i++) {
                if (tempArray[i][property].length > 0) {
                    $(id).append("<option value=" + tempArray[i][property]
                        + ">" + tempArray[i][property] + "</option>");
                }
            }
            fulfill();
        }).fail(function () {
            reject();
        });
    });
}

function sendQuery(query, dialog, classID, num) {
    var filterSection = [];
    $.ajax({
        url: "/query",
        type: "POST",
        data: JSON.stringify(query),
        contentType: "application/json",
        datatType: "json",
        success: function (data) {
            filterSection = data['result'];
        }
    }).then(function () {
        if (filterSection.length === 0) {
            dialog.modal('hide');
            bootbox.alert({
                title: "No Result",
                message: "The query resulted in no entry being found.",
                backdrop: true
            });
            return;
        }
        generateTable(filterSection, classID);
        if (num === 1) {
            createChart(filterSection);
        }
        dialog.modal('hide');
    }).catch(function () {
        dialog.modal('hide');
        bootbox.alert({
            title: "400",
            message: "Bad Request",
            backdrop: true
        });
    });
}

function generateTable(data, classID) {
    //REF: http://bl.ocks.org/jfreels/6734025

    //clear tables
    var tables = document.getElementsByTagName("TABLE");
    for (var j = tables.length - 1; j >= 0; j -= 1)
        if (tables[j]) tables[j].parentNode.removeChild(tables[j]);

    //get column headers
    var columns = [];
    var headers = Object.keys(data[0]);
    for (var i = 0; i < headers.length; i++) {
        columns.push(headers[i]);
    }
    var table = d3.select('.' + classID).append('table')
        .classed('table', true);
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) {
            return column;
        });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append('td')
        .text(function (d) {
            return d.value;
        });

    return table;
}

function getDistanceFromLatLonInMeter(lat1, lon1, lat2, lon2) {
    //REF:http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in m
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function show(classID) {
    document.getElementById(classID).className = 'visiblediv';
}

function hide(classID) {
    document.getElementById(classID).className = 'hiddendiv';
}