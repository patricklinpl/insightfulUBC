/**
 * Created by patricklin on 2017-02-22.
 */
import Log from "../Util";
import JSZip = require('jszip');
import fs = require("fs");
import parse5 = require("parse5");
import http = require('http');

export default class DataHandler {

    constructor() {
        Log.info('DataHandler::init()')
    }

    /**
     * Process the given dataset.
     *
     * @param id represents the name of the Dataset
     * @param content represents the base64 content of a zip file
     * @returns Promise - Array of valid dataset objects
     */
    public process(id: string, content: any): Promise<Array<any>> {
        return new Promise(function (fulfill, reject) {
            let zip = new JSZip();
            let files: Array<any> = [];
            let parsedFiles: Array<any> = [];
            let JSONData : any;

            zip.loadAsync(content, {base64: true}).then(function () {
                for (let filename in zip.files) {
                    files.push(zip.files[filename].async('string'));
                }

                let dir = './data';
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                Promise.all(files).then(function (contentData: Array<any>) {
                    if (id == 'courses') {
                        parsedFiles = JSONParser(id, contentData);
                        JSONData = JSON.parse('[' + parsedFiles + ']');
                        fulfill(JSONData);
                    }

                    if (id == 'rooms') {
                        HTMLParser(id,contentData).then(function (result) {
                            let roomsData = JSON.parse('[' + result.pop() + ']');
                            let validShortNames = result.pop();
                            let validRooms = JSON.parse('[' + result.pop() + ']');

                            Promise.all(validRooms.map(getLocation)).then(function () {
                                JSONData = [];

                                for (let i = 0; i < roomsData.length; i++) {
                                    if (validShortNames.indexOf(roomsData[i].rooms_shortname) !== -1) {
                                        JSONData.push(roomsData[i]);
                                    }
                                }

                                for (let room of validRooms) {
                                    for (let entry of JSONData) {
                                        if (room.rooms_shortname == entry.rooms_shortname) {
                                            entry.rooms_lat = room.rooms_lat;
                                            entry.rooms_lon = room.rooms_lon;
                                        }
                                    }
                                }

                                let index = JSONData.length - 1;

                                while (index >= 0) {
                                    if (JSON.stringify(JSONData[index].rooms_lat) == JSON.stringify({})
                                        || JSON.stringify(JSONData[index].rooms_lon) == JSON.stringify({})) {
                                        JSONData.splice(index, 1);
                                    }
                                    index -= 1;
                                }

                                fulfill(JSONData);

                            }).catch(function (err) {
                                reject({code: 400, body: {"error": err}});
                            });
                        }).catch(function(err) {
                            reject({code: 400, body: {"error": err}});
                        });
                    }
                }).catch (function (err) {
                    reject({code: 400, body: {"error": err}});
                });
            }).catch (function (err) { // zip fails
                reject({code: 400, body: {"error": err}});
            });
        });
    }
}

/**
 * Process the given dataset into JSON format for valid EBNF queries on courses.
 *
 * @param id represents the name of the Dataset
 * @param contentData represents the given Dataset
 * @returns Array of JSON objects with valid keys
 */
function JSONParser(id: string, contentData: Array<any>): Array<any> {
    let parsedFiles = [];

    for (let i = 0; i < contentData.length; i++) {

        try {

            let JSONfile = JSON.parse(contentData[i]
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

            for (let department in JSONfile) {

                if (department == 'result' && JSONfile[department] != "") {

                    for (let course in JSONfile[department]) {

                        for (let key in JSONfile[department][course]) {

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
        } catch (e) {
            //ignore invalid JSON
        }
    }
    return parsedFiles;
}

/**
 * Process the given dataset into JSON format for valid EBNF queries on rooms.
 *
 * @param id represents the name of the Dataset
 * @param contentData represents the given Dataset
 * @returns Promise <Array<Array of valid buildings / Array of valid building names / Array of rooms>>
 */
function HTMLParser(id: string, contentData: Array<any>): Promise<Array<any>> {

    return new Promise(function(resolve, reject) {
        let rooms : Array<any> = [];
        let index : Array<any> = [];
        let validShortNames:Array<string> = [];

        let Readable = require('stream').Readable;

        for (let i = 0; i < contentData.length; i++) {

            try {
                const parser = new parse5.SAXParser();
                let s = new Readable;
                s.push(contentData[i]);
                s.push(null);

                let fullNameCounter = -1;
                let numberCounter = -1;
                let addressCounter = -1;
                let seatsCounter = -1;
                let typeCounter = -1;
                let furnitureCounter = -1;
                let indexNameCounter = -1;
                let indexAddCounter = -1;
                let validIndex = 0;
                let validRoom = 0;
                let rooms_fullname: string;
                let rooms_shortname: string;
                let rooms_number:string;
                let rooms_address: string;
                let rooms_seats: number;
                let rooms_type: string;
                let rooms_furniture: string;
                let rooms_href:string;
                let indexName:string;
                let indexAddress:string;

                parser.on('startTag', function (tagName:string, attrs:any) {
                    //rooms_fullname
                    if (tagName == 'h2') {
                        if (attrs.length == 0) {
                            fullNameCounter++;
                        }
                    }

                    //rooms_shortname
                    if (tagName == 'link') {
                        if (attrs.length == 2) {
                            if (attrs[0].value == 'canonical' && attrs[1].name == 'href') {
                                rooms_shortname = attrs[1].value;
                                validRoom++;
                            }
                        }
                    }

                    //rooms_number
                    if (tagName == 'a') {
                        if (attrs.length == 2) {
                            if (attrs[1].name == 'title') {
                                if (attrs[1].value == 'Room Details') {
                                    numberCounter++;
                                    rooms_href = attrs[0].value;
                                    validRoom++;
                                }
                            }
                        }
                    }

                    //rooms_address
                    if (tagName == 'div') {
                        if (attrs.length == 1) {
                            if (attrs[0].value == "field-content") {
                                addressCounter++;
                            }
                        }
                    }

                    if (tagName == 'td') {
                        if (attrs.length == 1) {
                            //rooms_seats
                            if (attrs[0].value == 'views-field views-field-field-room-capacity') {
                                seatsCounter++;
                            }
                            //rooms_type
                            if (attrs[0].value == 'views-field views-field-field-room-type') {
                                typeCounter++;
                            }
                            //rooms_furniture
                            if (attrs[0].value == 'views-field views-field-field-room-furniture') {
                                furnitureCounter++;
                            }
                            //index parsing
                            if (attrs[0].value == 'views-field views-field-field-building-code') {
                                indexNameCounter++;
                            }
                            if (attrs[0].value == 'views-field views-field-field-building-address') {
                                indexAddCounter++;
                            }
                        }
                    }
                });

                parser.on('text', function(text:any) {
                    //index parsing sname
                    if (indexNameCounter == 0) {
                        indexName = text.trim();
                        indexNameCounter++;
                        validIndex++;
                    }

                    //index parsing address
                    if (indexAddCounter == 0) {
                        indexAddress = text.trim();
                        indexAddCounter++;
                        validIndex++;
                    }

                    //rooms_fullname
                    if (fullNameCounter == 0) {
                        rooms_fullname = text.toString();
                        fullNameCounter++;
                        validRoom++;
                    }

                    //rooms_number
                    if (numberCounter == 0) {
                        rooms_number = text.toString();
                        numberCounter++;
                        validRoom++;
                    }

                    //rooms_address
                    if (addressCounter == 0) {
                        rooms_address = text.toString();
                        addressCounter++;
                        validRoom++;
                    }

                    //rooms_seats
                    if (seatsCounter == 0) {
                        rooms_seats = parseInt(text.trim());
                        seatsCounter++;
                        validRoom++;
                    }

                    //rooms_type
                    if (typeCounter == 0) {
                        rooms_type = text.trim().toString();
                        typeCounter++;
                        validRoom++;
                    }

                    //rooms_furniture
                    if (furnitureCounter == 0) {
                        rooms_furniture = text.trim().toString();
                        furnitureCounter++;
                        validRoom++;
                    }
                });

                parser.on('endTag', function(text:string) {
                    if (text == 'tr') {
                        if (validIndex == 2) {
                            validIndex = 0;
                            indexNameCounter = -1;
                            indexAddCounter = -1;
                            let room = {
                                'rooms_shortname' : indexName,
                                'rooms_address' : indexAddress,
                                'rooms_lat' : {},
                                'rooms_lon' : {}
                            };
                            validShortNames.push(indexName);
                            index.push(JSON.stringify(room));
                        }

                        if (validRoom == 8) {
                            validRoom = 3;
                            numberCounter = -1;
                            seatsCounter = -1;
                            typeCounter = -1;
                            furnitureCounter = -1;
                            let room = {
                                [id.concat('_fullname')]: rooms_fullname,
                                [id.concat('_shortname')]: rooms_shortname,
                                [id.concat('_number')]: rooms_number,
                                [id.concat('_name')]: rooms_shortname + '_' + rooms_number,
                                [id.concat('_address')]: rooms_address,
                                [id.concat('_lat')]: {},
                                [id.concat('_lon')]: {},
                                [id.concat('_seats')]: rooms_seats,
                                [id.concat('_type')]: rooms_type,
                                [id.concat('_furniture')]: rooms_furniture,
                                [id.concat('_href')]: rooms_href
                            };
                            rooms.push(JSON.stringify(room));
                        }
                    }
                });

                s.on('end', () => {
                    let result = [];
                    result.push(index);
                    result.push(validShortNames);
                    result.push(rooms);
                    resolve(result);
                });

                s.pipe(parser);

            } catch (e) {
                reject(e);
            }
        }
    });
}

/**
 * Get the location from an Address.
 *
 * @param room represents a valid room of the Dataset
 * @returns Promise <Array<JSON Object - Valid Building>>
 */
function getLocation(room: any): Promise<any> {
    return new Promise(function (resolve, reject) {

        let URL = 'http://skaha.cs.ubc.ca:11316/api/v1/team17/' + encodeURIComponent(room.rooms_address);

        getLatLon(URL).then(function (latLon: any) {
            if (latLon.hasOwnProperty('lat') && latLon.hasOwnProperty('lon')) {
                room.rooms_lat = latLon.lat;
                room.rooms_lon = latLon.lon;
                resolve();
            }
        }).catch(function (e:any) {
            reject(e);
        });
    });
}

/**
 * Send an HTTP request to get Lat/Lon location from an address location.
 *
 * @param URL represents a valid URL string
 * @returns Promise<JSON Object - LatLon>
 */
function getLatLon(URL: string): Promise<any> {
    return new Promise(function (resolve, reject) {
        //taken from nodejs JSON Fetching Example : https://nodejs.org/api/http.html#http_http_get_options_callback
        http.get(URL, (res:any) => {
            const statusCode = res.statusCode;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error(`Request Failed.\n` +
                    `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error(`Invalid content-type.\n` +
                    `Expected application/json but received ${contentType}`);
            }

            if (error) {
                console.log(error.message);
                // consume response data to free up memory
                res.resume();
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk:any) => rawData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                } catch (e) {
                    console.log(e.message);
                }
            });
        }).on('error', function(e:any) {
            reject(e);
        });
    });
}