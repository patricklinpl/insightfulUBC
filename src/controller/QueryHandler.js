"use strict";
var Util_1 = require("../Util");
var QueryHandler = (function () {
    function QueryHandler(id, data) {
        this.cacheData = data;
        this.cacheID = id;
        Util_1.default.info('QueryHandler::init()');
    }
    QueryHandler.prototype.query = function (id, query) {
        var data = this.cacheData;
        var queryKey = Object.keys(query.WHERE).pop();
        var queryOutput;
        if (Object.keys(query.WHERE).length != 0) {
            var queryObj = query.WHERE;
            queryOutput = filter(id, data, queryKey, queryObj);
        }
        else {
            queryOutput = data;
        }
        var validKeys = collectValidKeys(query);
        for (var _i = 0, queryOutput_1 = queryOutput; _i < queryOutput_1.length; _i++) {
            var entry = queryOutput_1[_i];
            var keys = Object.keys(entry);
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                if (!filterKey(key, validKeys)) {
                    delete entry[key];
                }
            }
        }
        if (typeof query.TRANSFORMATIONS != 'undefined' &&
            query.TRANSFORMATIONS.APPLY.length > 0) {
            queryOutput = createApplyKeys(query, queryOutput);
        }
        if (typeof query.TRANSFORMATIONS != 'undefined' && query.TRANSFORMATIONS.GROUP.length > 0) {
            var result = groupBy(queryOutput, function (item) {
                var resultArray = [];
                for (var _i = 0, _a = query.TRANSFORMATIONS.GROUP; _i < _a.length; _i++) {
                    var groupConstraint = _a[_i];
                    if (typeof item[groupConstraint] != 'undefined') {
                        resultArray.push(item[groupConstraint]);
                    }
                }
                return resultArray;
            });
            queryOutput = [];
            for (var _a = 0, result_1 = result; _a < result_1.length; _a++) {
                var entry = result_1[_a];
                var copy = JSON.parse(JSON.stringify(entry[0]));
                var _loop_1 = function (app) {
                    var datatowork = [];
                    var resultKey = Object.keys(app).pop();
                    var applyCalc = Object.keys(app[resultKey]).pop();
                    if (entry.length > 0) {
                        for (var z = 0; z < entry.length; z++) {
                            datatowork.push(entry[z][resultKey]);
                        }
                        if (applyCalc == 'MAX') {
                            copy[resultKey] = Math.max.apply(Math, datatowork);
                        }
                        else if (applyCalc == 'MIN') {
                            copy[resultKey] = Math.min.apply(Math, datatowork);
                        }
                        else if (applyCalc == 'AVG') {
                            var numRows = datatowork.length;
                            var trimData = datatowork.map(function (x) {
                                x = x * 10;
                                x = Number(x.toFixed(0));
                                return x;
                            });
                            var total = trimData.reduce(function (a, b) {
                                return a + b;
                            }, 0);
                            var avg = total / numRows;
                            avg = avg / 10;
                            copy[resultKey] = Number(avg.toFixed(2));
                        }
                        else if (applyCalc == 'COUNT') {
                            var ham_1 = [];
                            datatowork.filter(function (a) {
                                var co = JSON.stringify(a);
                                if (ham_1.indexOf(co) < 0) {
                                    ham_1.push(co);
                                    return a;
                                }
                            });
                            copy[resultKey] = ham_1.length;
                        }
                        else if (applyCalc == 'SUM') {
                            copy[resultKey] = datatowork.reduce(function (a, b) {
                                return a + b;
                            }, 0);
                        }
                    }
                };
                for (var _b = 0, _c = query.TRANSFORMATIONS.APPLY; _b < _c.length; _b++) {
                    var app = _c[_b];
                    _loop_1(app);
                }
                queryOutput.push(copy);
            }
        }
        if (typeof query.OPTIONS.ORDER != 'undefined') {
            if (typeof query.OPTIONS.ORDER == 'string') {
                queryOutput.sort(function (a, b) {
                    var validNumKeys = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year", "courses_size",
                        "rooms_lat", "rooms_lon", "rooms_seats"];
                    if (typeof query.TRANSFORMATIONS != 'undefined') {
                        for (var i = 0; i < query.TRANSFORMATIONS.APPLY.length; i++) {
                            var applyObj = query.TRANSFORMATIONS.APPLY[i];
                            var appObjKey = Object.keys(applyObj).pop();
                            var innerObj = applyObj[appObjKey];
                            var appToken = Object.keys(innerObj).pop();
                            var validKey = innerObj[appToken];
                            if (validNumKeys.indexOf(validKey) >= 0) {
                                validNumKeys.push(appObjKey);
                            }
                        }
                    }
                    if (validNumKeys.indexOf(query.OPTIONS.ORDER) >= 0) {
                        return a[query.OPTIONS.ORDER] - b[query.OPTIONS.ORDER];
                    }
                    else {
                        var A = a[query.OPTIONS.ORDER].toUpperCase();
                        var B = b[query.OPTIONS.ORDER].toUpperCase();
                        return (A < B) ? -1 : (A > B) ? 1 : 0;
                    }
                });
            }
            else {
                queryOutput.sort(function (a, b) {
                    if (typeof query.OPTIONS.ORDER != 'string') {
                        for (var i = 0; i < query.OPTIONS.ORDER['keys'].length; i++) {
                            if (typeof queryOutput[0][query.OPTIONS.ORDER['keys'][i]] == 'number') {
                                var myNumKey = sortByNumber(a, b, query.OPTIONS.ORDER['keys'][i], query.OPTIONS.ORDER['dir']);
                                if (myNumKey != 0) {
                                    return myNumKey;
                                }
                                else if (i > query.OPTIONS.ORDER['keys'].length) {
                                    return myNumKey;
                                }
                            }
                            else {
                                var myStringKey = sortbyString(a, b, query.OPTIONS.ORDER['keys'][i], query.OPTIONS.ORDER['dir']);
                                if (myStringKey == -1 || myStringKey == 1) {
                                    return myStringKey;
                                }
                                else if (i > query.OPTIONS.ORDER['keys'].length) {
                                    return myStringKey;
                                }
                            }
                        }
                    }
                });
            }
        }
        var placeholder = [];
        for (var i = 0; i < queryOutput.length; i++) {
            var foo = queryOutput[i];
            var objString = JSON.stringify(foo, query.OPTIONS.COLUMNS);
            var ham = eval('(' + objString + ')');
            placeholder.push(ham);
        }
        queryOutput = placeholder;
        return {
            render: query.OPTIONS.FORM,
            result: queryOutput
        };
    };
    return QueryHandler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryHandler;
function filter(id, courseData, queryKey, queryObj) {
    var constraint;
    var constraintValue;
    var filteredArray = [];
    var queryKeys = Object.keys(queryObj[queryKey]);
    constraintValue = queryObj[queryKey][queryKeys[0]];
    constraint = queryKeys.pop().toString();
    var arrayBranch = [];
    var branch;
    var nestedQueryObjects = queryObj[queryKey];
    if (["GT", "LT", "EQ", "IS"].indexOf(queryKey) >= 0) {
        for (var i = 0; i < courseData.length; i++) {
            if (queryKey == 'GT') {
                if (courseData[i][constraint] > constraintValue) {
                    filteredArray.push(courseData[i]);
                }
            }
            else if (queryKey == 'LT') {
                if (courseData[i][constraint] < constraintValue) {
                    filteredArray.push(courseData[i]);
                }
            }
            else if (queryKey == 'EQ') {
                if (courseData[i][constraint] == constraintValue) {
                    filteredArray.push(courseData[i]);
                }
            }
            else if (queryKey == 'IS') {
                var regVal = new RegExp("^" + constraintValue.split("*").join(".*") + "$");
                if (courseData[i][constraint] == constraintValue) {
                    filteredArray.push(courseData[i]);
                }
                else if (regVal.test(courseData[i][constraint])) {
                    filteredArray.push(courseData[i]);
                }
            }
        }
        return filteredArray;
    }
    else if (["AND", "OR"].indexOf(queryKey) >= 0) {
        for (var i = 0; i < nestedQueryObjects.length; i++) {
            var nestedKey = Object.getOwnPropertyNames(nestedQueryObjects[i]).pop();
            var nestedVal = nestedQueryObjects[i];
            branch = filter(id, courseData, nestedKey, nestedVal);
            arrayBranch.push(branch);
        }
        if (queryKey == 'AND') {
            return intersect(id, arrayBranch);
        }
        else {
            return union(id, arrayBranch);
        }
    }
    else if (["NOT"].indexOf(queryKey) >= 0) {
        var nestedKey = Object.getOwnPropertyNames(nestedQueryObjects).pop();
        var resultData = filter(id, courseData, nestedKey, nestedQueryObjects);
        return negate(id, courseData, resultData);
    }
}
function intersect(id, arrays) {
    var uniqueID = 'rooms_name';
    if (id == 'courses') {
        uniqueID = 'courses_uuid';
    }
    var oTracker = [];
    var intersect = [];
    var aTemp;
    for (var i = 0; i < arrays.length; i++) {
        aTemp = arrays[i];
        for (var j = 0; j < aTemp.length; j++) {
            if (!oTracker[aTemp[j][uniqueID]]) {
                oTracker[aTemp[j][uniqueID]] = 0;
            }
            oTracker[aTemp[j][uniqueID]]++;
            if (oTracker[aTemp[j][uniqueID]] == arrays.length) {
                intersect.push(aTemp[j]);
            }
        }
    }
    return intersect;
}
function union(id, arrays) {
    var uniqueID = 'rooms_name';
    if (id == 'courses') {
        uniqueID = 'courses_uuid';
    }
    var oTracker = [];
    var union = [];
    var aTemp;
    for (var i = 0; i < arrays.length; i++) {
        aTemp = arrays[i];
        for (var j = 0; j < aTemp.length; j++) {
            if (!oTracker[aTemp[j][uniqueID]]) {
                oTracker[aTemp[j][uniqueID]] = 1;
                union.push(aTemp[j]);
            }
        }
    }
    return union;
}
function negate(id, fullSet, negateSet) {
    var uniqueID = 'rooms_name';
    if (id == 'courses') {
        uniqueID = 'courses_uuid';
    }
    var oTemp = [];
    var negation = [];
    for (var i = 0; i < negateSet.length; i++) {
        oTemp[negateSet[i][uniqueID]] = 1;
    }
    for (var j = 0; j < fullSet.length; j++) {
        if (!oTemp[fullSet[j][uniqueID]]) {
            negation.push(fullSet[j]);
        }
    }
    return negation;
}
function filterKey(dataKey, validKeys) {
    for (var i = 0; i < validKeys.length; i++) {
        if (validKeys[i] == dataKey) {
            return true;
        }
    }
    return false;
}
function collectValidKeys(query) {
    var filterKeysArray = [];
    if (typeof query.OPTIONS != 'undefined') {
        if (typeof query.OPTIONS.COLUMNS != 'undefined' && query.OPTIONS.COLUMNS.length > 0) {
            for (var i = 0; i < query.OPTIONS.COLUMNS.length; i++) {
                filterKeysArray.push(query.OPTIONS.COLUMNS[i]);
            }
        }
    }
    if (typeof query.TRANSFORMATIONS != 'undefined') {
        if (typeof query.TRANSFORMATIONS.APPLY != 'undefined' &&
            query.TRANSFORMATIONS.APPLY.length > 0) {
            for (var _i = 0, _a = query.TRANSFORMATIONS.APPLY; _i < _a.length; _i++) {
                var entry = _a[_i];
                var applyKey = Object.keys(entry).pop();
                var applyToken = Object.keys(entry[applyKey]).pop();
                if (applyToken == 'MAX') {
                    filterKeysArray.push(entry[applyKey].MAX);
                }
                else if (applyToken == 'MIN') {
                    filterKeysArray.push(entry[applyKey].MIN);
                }
                else if (applyToken == 'AVG') {
                    filterKeysArray.push(entry[applyKey].AVG);
                }
                else if (applyToken == 'COUNT') {
                    filterKeysArray.push(entry[applyKey].COUNT);
                }
                else if (applyToken == 'SUM') {
                    filterKeysArray.push(entry[applyKey].SUM);
                }
            }
        }
        if (typeof query.TRANSFORMATIONS.GROUP != 'undefined' && query.TRANSFORMATIONS.GROUP.length > 0) {
            for (var _b = 0, _c = query.TRANSFORMATIONS.GROUP; _b < _c.length; _b++) {
                var groupKey = _c[_b];
                filterKeysArray.push(groupKey);
            }
        }
    }
    return filterKeysArray;
}
function createApplyKeys(query, queryOutput) {
    for (var _i = 0, _a = query.TRANSFORMATIONS.APPLY; _i < _a.length; _i++) {
        var entry = _a[_i];
        var applyKey = Object.keys(entry).pop();
        var applyToken = Object.keys(entry[applyKey]).pop();
        var replaceKey = "";
        if (applyToken == 'MAX') {
            replaceKey = entry[applyKey].MAX;
        }
        else if (applyToken == 'MIN') {
            replaceKey = entry[applyKey].MIN;
        }
        else if (applyToken == 'AVG') {
            replaceKey = entry[applyKey].AVG;
        }
        else if (applyToken == 'COUNT') {
            replaceKey = entry[applyKey].COUNT;
        }
        else if (applyToken == 'SUM') {
            replaceKey = entry[applyKey].SUM;
        }
        if (replaceKey != "") {
            for (var i = 0; i < queryOutput.length; i++) {
                queryOutput[i][applyKey] = queryOutput[i][replaceKey];
            }
        }
    }
    return queryOutput;
}
function groupBy(array, f) {
    var groups = {};
    array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}
function sortByNumber(a, b, keyToSort, dir) {
    if (dir == 'UP') {
        return a[keyToSort] - b[keyToSort];
    }
    else {
        return b[keyToSort] - a[keyToSort];
    }
}
function sortbyString(a, b, keyToSort, dir) {
    var A = a[keyToSort].toUpperCase();
    var B = b[keyToSort].toUpperCase();
    if (dir == 'UP') {
        return (A < B) ? -1 : (A > B) ? 1 : 0;
    }
    else {
        return (A > B) ? -1 : (A < B) ? 1 : 0;
    }
}
//# sourceMappingURL=QueryHandler.js.map