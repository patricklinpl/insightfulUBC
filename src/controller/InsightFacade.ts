/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import QueryHandler from "./QueryHandler";
import QueryValidator from "./QueryValidator";
import DataHandler from "./DataHandler";
import fs = require("fs");

let cacheCourseData: Object = {};
let cacheCourseID: string = "";
let cacheRoomData: Object = {};
let cacheRoomID: string = "";

export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (fulfill, reject) {
            let processData = new DataHandler();
            processData.process(id, content).then(function (JSONData) {
                if (id == 'courses') {
                    cacheCourseID = id;
                    cacheCourseData = JSONData;
                }

                if (id == 'rooms') {
                    cacheRoomID = id;
                    cacheRoomData = JSONData;
                }

                //201 existed id
                //204 new id
                if (JSONData.length > 0) {
                    if (fs.existsSync('data/' + id + '.json')) {
                        fs.writeFileSync('data/' + id + '.json', JSON.stringify(JSONData));
                        fulfill({code: 201, body: {}});
                    } else {
                        fs.writeFileSync('data/' + id + '.json', JSON.stringify(JSONData));
                        fulfill({code: 204, body: {}});
                    }
                } else {
                    reject({code: 400, body: {"error": "Empty Objects"}});
                }

            }).catch(function (err) {
                reject({code: 400, body: {"error": err}});
            });
        });
    }

    //code 204 successful remove
    //code 404 unsuccessful
    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (fulfill, reject) {
            if (id == 'courses') {
                cacheCourseData = {};
                cacheCourseID = "";
            } else if (id == 'rooms') {
                cacheRoomData = {};
                cacheRoomID = "";
            }
            let fs = require("fs");
            fs.unlink('data/' + id + ".json", (err: any) => {
                if (err) {
                    reject({code: 404, body: {"error": err}});
                }
                fulfill({code: 204, body: {}});
            });
        });
    }

    performQuery(query: QueryRequest): Promise <InsightResponse> {
        return new Promise<InsightResponse>(function (fulfill, reject) {
            let cacheID: string = "";
            let cacheData: Object = {};

            if (typeof query.WHERE == 'undefined' || typeof query.OPTIONS == 'undefined') {
                reject({code: 400, body: {"error": "Query format is wrong"}});
            }

            if (query.OPTIONS.COLUMNS.length !== 0) {

                for(let i = 0; i < query.OPTIONS.COLUMNS.length; i++) {

                    if(query.OPTIONS.COLUMNS[i].indexOf('_') > 0) {
                        if (cacheID == "") {
                            cacheID = query.OPTIONS.COLUMNS[i].split("_")[0];
                        }
                    }
                }

                if (cacheID == "") {
                    if (typeof query.TRANSFORMATIONS != 'undefined') {
                        if(typeof query.TRANSFORMATIONS.GROUP != 'undefined') {
                            for(let i = 0; i < query.TRANSFORMATIONS.GROUP.length; i++) {
                                if(query.TRANSFORMATIONS.GROUP[i].indexOf('_') > 0) {
                                    if (cacheID == "") {
                                        cacheID = query.TRANSFORMATIONS.GROUP[i].split("_")[0];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            let dataSets: string[] = [];

            let validKeys = ["courses_dept", "courses_id",
                "courses_avg", "courses_instructor", "courses_title",
                "courses_pass", "courses_fail", "courses_audit", "courses_uuid", "courses_year", "courses_size",
                "rooms_lat", "rooms_lon", "rooms_seats", 'rooms_fullname', 'rooms_shortname', 'rooms_number',
                'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
                'rooms_href'];

            if (cacheCourseID !== "") {
                dataSets.push(cacheCourseID);
            } else if (cacheCourseID === "" && fs.existsSync('data/courses.json')) {
                cacheCourseID = 'courses';
                dataSets.push(cacheCourseID);
                cacheCourseData = JSON.parse(fs.readFileSync('data/courses.json', {encoding: 'utf-8'}));
            }

            if (cacheRoomID !== "") {
                dataSets.push(cacheRoomID);
            } else if (cacheRoomID === "" && fs.existsSync('data/rooms.json')) {
                cacheRoomID = 'rooms';
                dataSets.push(cacheRoomID);
                cacheRoomData = JSON.parse(fs.readFileSync('data/rooms.json', {encoding: 'utf-8'}));
            }


            if (cacheID === "courses" && Object.keys(cacheCourseData).length > 0) {
                cacheData = cacheCourseData;
            } else if (cacheID === "rooms" && Object.keys(cacheRoomData).length > 0) {
                cacheData = cacheRoomData;
            }

            let qValidate = new QueryValidator();
            if (qValidate.validate(query)) {
                if (typeof query.WHERE == 'undefined' || typeof query.OPTIONS == 'undefined') {
                    reject({code: 400, body: {"error": "Query is not valid"}});
                }

                if (Object.keys(query.WHERE).length != 0) {
                    let checkEmpty = qValidate.validateEmpty(Object.keys(query.WHERE).pop(), query.WHERE);

                    if (checkEmpty != 'Passed') {
                        reject({code: 400, body: {"error": checkEmpty}});
                    }
                }

                if (query.OPTIONS.COLUMNS.length == 0) {
                    reject({code: 400, body: {"error": "Columns cannot be empty"}});
                }

                if (typeof query.OPTIONS.ORDER != 'string' && typeof query.OPTIONS.ORDER != 'undefined') {
                    if (typeof query.OPTIONS.ORDER['keys'] != 'undefined') {
                        for (let good of query.OPTIONS.ORDER['keys']) {
                            if (good.indexOf("_") < 0) {
                                if (query.OPTIONS.COLUMNS.indexOf(good) < 0) {
                                    reject({code: 400, body: {"error": "Order key needs to be included in columns"}});
                                }
                            }
                        }
                    }
                }

                if (typeof query.TRANSFORMATIONS != 'undefined') {
                    if (typeof query.TRANSFORMATIONS.GROUP == 'undefined' || typeof query.TRANSFORMATIONS.APPLY == 'undefined') {
                        reject({code: 400, body: {"error": "Transformations needs to contains both GROUP and APPLY"}});
                    }
                }

                let checkTransform = qValidate.validateTransform(query);
                if (checkTransform != 'Passed') {
                    reject({code: 400, body: {"error": checkTransform}});
                }

                let checkAgainst: string[] = [];
                if (typeof query.TRANSFORMATIONS != 'undefined') {
                    if (typeof query.TRANSFORMATIONS.APPLY != 'undefined') {
                        for (let entry of query.TRANSFORMATIONS.APPLY) {
                            let key = Object.keys(entry).pop();
                            checkAgainst.push(key);
                        }
                    }

                    if (typeof query.TRANSFORMATIONS != 'undefined') {
                        if (typeof query.TRANSFORMATIONS.GROUP != "undefined") {
                            for (let entry of query.TRANSFORMATIONS.GROUP) {
                                if (entry.indexOf('_') >= 0) {
                                    let testID = entry.split("_")[0];
                                    if (testID != cacheID) {
                                        reject({code: 400, body: {"error": "Query is trying to query two datasets at the same time"}});
                                    }
                                }
                            }
                        }

                        if (typeof query.TRANSFORMATIONS.APPLY != "undefined") {

                            for (let i = 0; i < query.TRANSFORMATIONS.APPLY.length; i++) {

                                let myKey = Object.keys(query.TRANSFORMATIONS.APPLY[i]).pop();
                                let myObj = query.TRANSFORMATIONS.APPLY[i][myKey];
                                let myAppTok = Object.keys(myObj).pop();

                                if (myAppTok == 'MAX' || myAppTok == 'MIN' || myAppTok == 'COUNT' || myAppTok == 'AVG' || myAppTok == 'SUM' ) {
                                    let myAppKey = myObj[myAppTok];

                                    if (myAppKey.indexOf('_') > 0) {
                                        let testID = myAppKey.split("_")[0];
                                        if (testID != cacheID) {
                                            reject({code: 400, body: {"error": "Query is trying to query two datasets at the same time"}});
                                        }
                                    }
                                }
                            }
                        }
                    }

                    for (let entry of query.OPTIONS.COLUMNS) {
                        if (validKeys.indexOf(entry) < 0) {
                            if (checkAgainst.indexOf(entry) < 0) {
                                reject({code: 400, body: {"error": entry + " is not a valid key"}});
                            }
                        }
                    }

                    let group_apply_keys: string[] = [];
                    if (typeof query.TRANSFORMATIONS.APPLY != 'undefined') {
                        for (let appKey of query.TRANSFORMATIONS.APPLY) {
                            let key = Object.keys(appKey).pop();
                            group_apply_keys.push(key);     //push apply keys
                        }
                        for (let groupKey of query.TRANSFORMATIONS.GROUP) {
                            group_apply_keys.push(groupKey);    //push group keys
                        }
                    }

                    for (let keys of query.OPTIONS.COLUMNS) {
                        if (group_apply_keys.indexOf(keys) < 0) {
                            reject({
                                code: 400,
                                body: {"error": "All COLUMNS keys need to be either in GROUP or in APPLY"}
                            });
                        }
                    }

                    for (let gKeys of query.TRANSFORMATIONS.GROUP) {
                        if (validKeys.indexOf(gKeys) < 0) {
                            reject({code: 400, body: {"error": "Group cannot contain apply keys"}});
                        }
                    }
                }

                if (Object.keys(query.WHERE).length != 0) {
                    let checkDependency = qValidate.validateDependency(Object.keys(query.WHERE).pop(), query.WHERE, dataSets);

                    for (let entry of query.OPTIONS.COLUMNS) {

                        if (entry.indexOf("_") >= 0) {
                            let testID = entry.split("_")[0];
                            if (dataSets.indexOf(testID) == -1) {
                                checkDependency.push(testID);
                            }
                        }

                        else {
                            if (typeof query.TRANSFORMATIONS == 'undefined') {
                                if (validKeys.indexOf(entry) < 0) {
                                    reject({code: 400, body: {"error": entry + " is not a valid key"}});
                                }
                            } else {
                                if (entry.indexOf("_") >= 0) {
                                    let testID = entry.split("_")[0];
                                    if (dataSets.indexOf(testID) == -1) {
                                        checkDependency.push(testID);
                                    }
                                }
                            }
                        }
                    }

                    if (typeof checkDependency != 'undefined') {
                        if (checkDependency.length != 0) {
                            let newCheck = checkDependency.filter(function (a) {
                                if (checkAgainst.indexOf(a) == -1) {
                                    return a;
                                }
                            });

                            if (newCheck.length > 0) {
                                reject({code: 424, body: {"missing": checkDependency}});
                            }
                        }
                    }

                    let checkMultipleKeys = qValidate.validateMultipleKeys(Object.keys(query.WHERE).pop(), query.WHERE);

                    for (let entry of query.OPTIONS.COLUMNS) {
                        let testID = entry.split("_")[0];
                        if (dataSets.indexOf(testID) == -1) {
                            if (typeof checkAgainst != 'undefined') {
                                if (checkAgainst.indexOf(testID) == -1) {
                                    checkMultipleKeys.push(testID);
                                }
                            } else {
                                checkMultipleKeys.push(testID);
                            }
                        }
                    }

                    if (checkMultipleKeys.length > 1) {
                        reject({code: 400, body: {"error": "Query is trying to query two datasets at the same time"}});
                    }
                }

                let checkOption = qValidate.validateOPTIONS(query);

                if (checkOption != 'Passed') {
                    reject({code: 400, body: {"error": checkOption}});
                }

                if (Object.keys(query.WHERE).length != 0) {

                    if (Object.keys(query.WHERE).length != 1) {
                        reject({code: 400, body: {"error": "Query Malformed"}});
                    }

                    let checkFilt = qValidate.validateFILTER(Object.keys(query.WHERE).pop(), query.WHERE);

                    if (checkFilt != 'Passed') {
                        reject({code: 400, body: {"error": checkFilt}});
                    }
                }

                let copyData = JSON.parse(JSON.stringify(cacheData));
                let qEngine = new QueryHandler(cacheID, copyData);
                let result = qEngine.query(cacheID, query);
                fulfill({code: 200, body: result});
            } else {
                reject({code: 400, body: {"error": "Invalid JSON: Unexpected end of JSON input"}});
            }
        });
    }
}