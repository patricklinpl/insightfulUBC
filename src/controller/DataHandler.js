"use strict";
var Util_1 = require("../Util");
var JSZip = require("jszip");
var fs = require("fs");
var parse5 = require("parse5");
var http = require("http");
var DataHandler = (function () {
    function DataHandler() {
        Util_1.default.info('DataHandler::init()');
    }
    DataHandler.prototype.process = function (id, content) {
        return new Promise(function (fulfill, reject) {
            var zip = new JSZip();
            var files = [];
            var parsedFiles = [];
            var JSONData;
            zip.loadAsync(content, { base64: true }).then(function () {
                for (var filename in zip.files) {
                    files.push(zip.files[filename].async('string'));
                }
                var dir = './data';
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                Promise.all(files).then(function (contentData) {
                    if (id == 'courses') {
                        parsedFiles = JSONParser(id, contentData);
                        JSONData = JSON.parse('[' + parsedFiles + ']');
                        fulfill(JSONData);
                    }
                    if (id == 'rooms') {
                        HTMLParser(id, contentData).then(function (result) {
                            var roomsData = JSON.parse('[' + result.pop() + ']');
                            var validShortNames = result.pop();
                            var validRooms = JSON.parse('[' + result.pop() + ']');
                            Promise.all(validRooms.map(getLocation)).then(function () {
                                JSONData = [];
                                for (var i = 0; i < roomsData.length; i++) {
                                    if (validShortNames.indexOf(roomsData[i].rooms_shortname) !== -1) {
                                        JSONData.push(roomsData[i]);
                                    }
                                }
                                for (var _i = 0, validRooms_1 = validRooms; _i < validRooms_1.length; _i++) {
                                    var room = validRooms_1[_i];
                                    for (var _a = 0, JSONData_1 = JSONData; _a < JSONData_1.length; _a++) {
                                        var entry = JSONData_1[_a];
                                        if (room.rooms_shortname == entry.rooms_shortname) {
                                            entry.rooms_lat = room.rooms_lat;
                                            entry.rooms_lon = room.rooms_lon;
                                        }
                                    }
                                }
                                var index = JSONData.length - 1;
                                while (index >= 0) {
                                    if (JSON.stringify(JSONData[index].rooms_lat) == JSON.stringify({})
                                        || JSON.stringify(JSONData[index].rooms_lon) == JSON.stringify({})) {
                                        JSONData.splice(index, 1);
                                    }
                                    index -= 1;
                                }
                                fulfill(JSONData);
                            }).catch(function (err) {
                                reject({ code: 400, body: { "error": err } });
                            });
                        }).catch(function (err) {
                            reject({ code: 400, body: { "error": err } });
                        });
                    }
                }).catch(function (err) {
                    reject({ code: 400, body: { "error": err } });
                });
            }).catch(function (err) {
                reject({ code: 400, body: { "error": err } });
            });
        });
    };
    return DataHandler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DataHandler;
function JSONParser(id, contentData) {
    var parsedFiles = [];
    for (var i = 0; i < contentData.length; i++) {
        try {
            var JSONfile = JSON.parse(contentData[i]
                .split('"Subject"').join('"' + id + '_dept"')
                .split('"Course"').join('"' + id + '_id"')
                .split('"Avg"').join('"' + id + '_avg"')
                .split('"Professor"').join('"' + id + '_instructor"')
                .split('"Title"').join('"' + id + '_title"')
                .split('"Pass"').join('"' + id + '_pass"')
                .split('"Fail"').join('"' + id + '_fail"')
                .split('"Audit"').join('"' + id + '_audit"')
                .split('"id"').join('"' + id + '_uuid"')
                .split('"Year"').join('"' + id + '_year"')
                .split('"Enrolled"').join('"' + id + '_size"'));
            for (var department in JSONfile) {
                if (department == 'result' && JSONfile[department] != "") {
                    for (var course in JSONfile[department]) {
                        for (var key in JSONfile[department][course]) {
                            if (key == 'courses_uuid') {
                                JSONfile[department][course].courses_uuid = String(JSONfile[department][course].courses_uuid);
                            }
                            if (key == 'courses_year') {
                                JSONfile[department][course].courses_year = parseInt(JSONfile[department][course].courses_year);
                            }
                            if (key == 'courses_size') {
                                JSONfile[department][course].courses_size = JSONfile[department][course].courses_pass + JSONfile[department][course].courses_fail;
                            }
                            if (key == 'Section') {
                                if (JSONfile[department][course].Section == 'overall') {
                                    JSONfile[department][course].courses_year = 1900;
                                }
                            }
                        }
                    }
                    parsedFiles.push(JSON.stringify(JSONfile[department]).slice(1, -1));
                }
            }
        }
        catch (e) {
        }
    }
    return parsedFiles;
}
function HTMLParser(id, contentData) {
    return new Promise(function (resolve, reject) {
        var rooms = [];
        var index = [];
        var validShortNames = [];
        var Readable = require('stream').Readable;
        var _loop_1 = function (i) {
            try {
                var parser = new parse5.SAXParser();
                var s = new Readable;
                s.push(contentData[i]);
                s.push(null);
                var fullNameCounter_1 = -1;
                var numberCounter_1 = -1;
                var addressCounter_1 = -1;
                var seatsCounter_1 = -1;
                var typeCounter_1 = -1;
                var furnitureCounter_1 = -1;
                var indexNameCounter_1 = -1;
                var indexAddCounter_1 = -1;
                var validIndex_1 = 0;
                var validRoom_1 = 0;
                var rooms_fullname_1;
                var rooms_shortname_1;
                var rooms_number_1;
                var rooms_address_1;
                var rooms_seats_1;
                var rooms_type_1;
                var rooms_furniture_1;
                var rooms_href_1;
                var indexName_1;
                var indexAddress_1;
                parser.on('startTag', function (tagName, attrs) {
                    if (tagName == 'h2') {
                        if (attrs.length == 0) {
                            fullNameCounter_1++;
                        }
                    }
                    if (tagName == 'link') {
                        if (attrs.length == 2) {
                            if (attrs[0].value == 'canonical' && attrs[1].name == 'href') {
                                rooms_shortname_1 = attrs[1].value;
                                validRoom_1++;
                            }
                        }
                    }
                    if (tagName == 'a') {
                        if (attrs.length == 2) {
                            if (attrs[1].name == 'title') {
                                if (attrs[1].value == 'Room Details') {
                                    numberCounter_1++;
                                    rooms_href_1 = attrs[0].value;
                                    validRoom_1++;
                                }
                            }
                        }
                    }
                    if (tagName == 'div') {
                        if (attrs.length == 1) {
                            if (attrs[0].value == "field-content") {
                                addressCounter_1++;
                            }
                        }
                    }
                    if (tagName == 'td') {
                        if (attrs.length == 1) {
                            if (attrs[0].value == 'views-field views-field-field-room-capacity') {
                                seatsCounter_1++;
                            }
                            if (attrs[0].value == 'views-field views-field-field-room-type') {
                                typeCounter_1++;
                            }
                            if (attrs[0].value == 'views-field views-field-field-room-furniture') {
                                furnitureCounter_1++;
                            }
                            if (attrs[0].value == 'views-field views-field-field-building-code') {
                                indexNameCounter_1++;
                            }
                            if (attrs[0].value == 'views-field views-field-field-building-address') {
                                indexAddCounter_1++;
                            }
                        }
                    }
                });
                parser.on('text', function (text) {
                    if (indexNameCounter_1 == 0) {
                        indexName_1 = text.trim();
                        indexNameCounter_1++;
                        validIndex_1++;
                    }
                    if (indexAddCounter_1 == 0) {
                        indexAddress_1 = text.trim();
                        indexAddCounter_1++;
                        validIndex_1++;
                    }
                    if (fullNameCounter_1 == 0) {
                        rooms_fullname_1 = text.toString();
                        fullNameCounter_1++;
                        validRoom_1++;
                    }
                    if (numberCounter_1 == 0) {
                        rooms_number_1 = text.toString();
                        numberCounter_1++;
                        validRoom_1++;
                    }
                    if (addressCounter_1 == 0) {
                        rooms_address_1 = text.toString();
                        addressCounter_1++;
                        validRoom_1++;
                    }
                    if (seatsCounter_1 == 0) {
                        rooms_seats_1 = parseInt(text.trim());
                        seatsCounter_1++;
                        validRoom_1++;
                    }
                    if (typeCounter_1 == 0) {
                        rooms_type_1 = text.trim().toString();
                        typeCounter_1++;
                        validRoom_1++;
                    }
                    if (furnitureCounter_1 == 0) {
                        rooms_furniture_1 = text.trim().toString();
                        furnitureCounter_1++;
                        validRoom_1++;
                    }
                });
                parser.on('endTag', function (text) {
                    if (text == 'tr') {
                        if (validIndex_1 == 2) {
                            validIndex_1 = 0;
                            indexNameCounter_1 = -1;
                            indexAddCounter_1 = -1;
                            var room = {
                                'rooms_shortname': indexName_1,
                                'rooms_address': indexAddress_1,
                                'rooms_lat': {},
                                'rooms_lon': {}
                            };
                            validShortNames.push(indexName_1);
                            index.push(JSON.stringify(room));
                        }
                        if (validRoom_1 == 8) {
                            validRoom_1 = 3;
                            numberCounter_1 = -1;
                            seatsCounter_1 = -1;
                            typeCounter_1 = -1;
                            furnitureCounter_1 = -1;
                            var room = (_a = {},
                                _a[id.concat('_fullname')] = rooms_fullname_1,
                                _a[id.concat('_shortname')] = rooms_shortname_1,
                                _a[id.concat('_number')] = rooms_number_1,
                                _a[id.concat('_name')] = rooms_shortname_1 + '_' + rooms_number_1,
                                _a[id.concat('_address')] = rooms_address_1,
                                _a[id.concat('_lat')] = {},
                                _a[id.concat('_lon')] = {},
                                _a[id.concat('_seats')] = rooms_seats_1,
                                _a[id.concat('_type')] = rooms_type_1,
                                _a[id.concat('_furniture')] = rooms_furniture_1,
                                _a[id.concat('_href')] = rooms_href_1,
                                _a);
                            rooms.push(JSON.stringify(room));
                        }
                    }
                    var _a;
                });
                s.on('end', function () {
                    var result = [];
                    result.push(index);
                    result.push(validShortNames);
                    result.push(rooms);
                    resolve(result);
                });
                s.pipe(parser);
            }
            catch (e) {
                reject(e);
            }
        };
        for (var i = 0; i < contentData.length; i++) {
            _loop_1(i);
        }
    });
}
function getLocation(room) {
    return new Promise(function (resolve, reject) {
        var URL = 'http://skaha.cs.ubc.ca:11316/api/v1/team17/' + encodeURIComponent(room.rooms_address);
        getLatLon(URL).then(function (latLon) {
            if (latLon.hasOwnProperty('lat') && latLon.hasOwnProperty('lon')) {
                room.rooms_lat = latLon.lat;
                room.rooms_lon = latLon.lon;
                resolve();
            }
        }).catch(function (e) {
            reject(e);
        });
    });
}
function getLatLon(URL) {
    return new Promise(function (resolve, reject) {
        http.get(URL, function (res) {
            var statusCode = res.statusCode;
            var contentType = res.headers['content-type'];
            var error;
            if (statusCode !== 200) {
                error = new Error("Request Failed.\n" +
                    ("Status Code: " + statusCode));
            }
            else if (!/^application\/json/.test(contentType)) {
                error = new Error("Invalid content-type.\n" +
                    ("Expected application/json but received " + contentType));
            }
            if (error) {
                console.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            var rawData = '';
            res.on('data', function (chunk) { return rawData += chunk; });
            res.on('end', function () {
                try {
                    resolve(JSON.parse(rawData));
                }
                catch (e) {
                    console.log(e.message);
                }
            });
        }).on('error', function (e) {
            reject(e);
        });
    });
}
//# sourceMappingURL=DataHandler.js.map