/**
 * Created by patricklin on 2017-01-23.
 */
import Log from "../Util";
import {QueryRequest} from "./IInsightFacade";

export interface QueryResponse {
    render: string;
    result: {};
}

export default class QueryHandler {
    cacheData: any;
    cacheID: string;

    constructor(id: string, data: any) {
        this.cacheData = data;
        this.cacheID = id;
        Log.info('QueryHandler::init()')
    }

    /**
     * Queries a given dataset
     *
     * @param id represents the name of the Dataset
     * @param query represents the EBNF syntax to send a query
     * @returns QueryResponse represents the output data based on query request
     */
    public query(id: string, query: QueryRequest): QueryResponse {
        let data = this.cacheData;
        let queryKey = Object.keys(query.WHERE).pop();
        let queryOutput: any;

        if (Object.keys(query.WHERE).length != 0) {
            //filter data if where exists
            let queryObj = query.WHERE;
            queryOutput = filter(id, data, queryKey, queryObj);
        } else {
            //else entire data set
            queryOutput = data;
        }

        let validKeys = collectValidKeys(query);

        //filter each object for valid keys
        for (let entry of queryOutput) {
            let keys = Object.keys(entry);
            for (let j = 0; j < keys.length; j++) {
                let key = keys[j];
                if (!filterKey(key, validKeys)) {
                    delete entry[key];
                }
            }
        }

        if (typeof query.TRANSFORMATIONS != 'undefined' &&
            query.TRANSFORMATIONS.APPLY.length > 0) {
                queryOutput = createApplyKeys(query, queryOutput);
        }

        // handle groups
        if (typeof query.TRANSFORMATIONS != 'undefined' && query.TRANSFORMATIONS.GROUP.length > 0) {
            let result = groupBy(queryOutput, function (item: any) {
                let resultArray = [];
                for (let groupConstraint of query.TRANSFORMATIONS.GROUP) {
                    if (typeof item[groupConstraint] != 'undefined') {
                        resultArray.push(item[groupConstraint]);
                    }
                }
                return resultArray;
            });

            queryOutput = [];

            for (let entry of result) {

                let copy = JSON.parse(JSON.stringify(entry[0]));

                for (let app of query.TRANSFORMATIONS.APPLY) {
                    let datatowork = [];

                    let resultKey = Object.keys(app).pop();
                    let applyCalc = Object.keys(app[resultKey]).pop();

                    if (entry.length > 0) {

                        for (let z = 0; z < entry.length; z++) {
                            datatowork.push(entry[z][resultKey]);
                        }

                        if (applyCalc == 'MAX') {
                            copy[resultKey] = Math.max.apply(Math, datatowork);
                        }

                        else if (applyCalc == 'MIN') {
                            copy[resultKey] = Math.min.apply(Math, datatowork);
                        }

                        else if (applyCalc == 'AVG') {

                            let numRows = datatowork.length;

                            let trimData = datatowork.map(function (x: number) {
                                x = x * 10;
                                x = Number(x.toFixed(0));
                                return x;
                            });

                            let total = trimData.reduce(function (a, b) {
                                return a + b;
                            }, 0);
                            let avg = total / numRows;
                            avg = avg / 10;
                            copy[resultKey] = Number(avg.toFixed(2));
                        }

                        else if (applyCalc == 'COUNT') {

                            let ham: any = [];

                            datatowork.filter(function (a: any) {

                                let co = JSON.stringify(a);

                                if (ham.indexOf(co) < 0) {
                                    ham.push(co);
                                    return a;
                                }
                            });

                            copy[resultKey] = ham.length;
                        }

                        else if (applyCalc == 'SUM') {
                            copy[resultKey] = datatowork.reduce(function (a, b) {
                                return a + b;
                            }, 0);
                        }

                    }
                }
                queryOutput.push(copy);
            }
        }

        //sorting
        if (typeof query.OPTIONS.ORDER != 'undefined') {
            //sort array of objects based on query order - string only
            if (typeof query.OPTIONS.ORDER == 'string') {
                queryOutput.sort(function (a: any, b: any) {
                    let validNumKeys = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year", "courses_size",
                        "rooms_lat", "rooms_lon", "rooms_seats"];

                    if (typeof query.TRANSFORMATIONS != 'undefined') {
                        for (let i = 0; i < query.TRANSFORMATIONS.APPLY.length; i++) {
                            let applyObj: any = query.TRANSFORMATIONS.APPLY[i];
                            let appObjKey: any = Object.keys(applyObj).pop();
                            let innerObj: any = applyObj[appObjKey];
                            let appToken: any = Object.keys(innerObj).pop();
                            let validKey: any = innerObj[appToken];
                            if (validNumKeys.indexOf(validKey) >= 0) {
                                validNumKeys.push(appObjKey);
                            }
                        }
                    }

                    if (validNumKeys.indexOf(<string> query.OPTIONS.ORDER) >= 0) {
                        return a[<string> query.OPTIONS.ORDER] - b[<string> query.OPTIONS.ORDER];
                    } else {
                        let A = a[<string> query.OPTIONS.ORDER].toUpperCase();
                        let B = b[<string> query.OPTIONS.ORDER].toUpperCase();
                        return (A < B) ? -1 : (A > B) ? 1 : 0;
                    }
                });
            } else { // sort on multi strings
                queryOutput.sort(function (a: any, b: any) {
                    if (typeof query.OPTIONS.ORDER != 'string') {
                        for (let i = 0; i < query.OPTIONS.ORDER['keys'].length; i++) {

                            if (typeof queryOutput[0][query.OPTIONS.ORDER['keys'][i]] == 'number') {

                                let myNumKey = sortByNumber(a, b, query.OPTIONS.ORDER['keys'][i], query.OPTIONS.ORDER['dir']);

                                if (myNumKey != 0) {
                                    return myNumKey;
                                } else if (i > query.OPTIONS.ORDER['keys'].length) {
                                    return myNumKey;
                                }
                            } else {
                                let myStringKey = sortbyString(a, b, query.OPTIONS.ORDER['keys'][i], query.OPTIONS.ORDER['dir']);

                                if (myStringKey == -1 || myStringKey == 1) {
                                    return myStringKey;
                                } else if (i > query.OPTIONS.ORDER['keys'].length) {
                                    return myStringKey;
                                }
                            }
                        }
                    }
                });
            }
        }

        let placeholder = [];
        //sort each individual object by query column
        for (let i = 0; i < queryOutput.length; i++) {
            let foo = queryOutput[i];
            let objString = JSON.stringify(foo, query.OPTIONS.COLUMNS);

            let ham = eval('(' + objString + ')');

            placeholder.push(ham);
        }
        queryOutput = placeholder;

        return {
            render: query.OPTIONS.FORM,
            result: queryOutput
        };
    }
}

/**
 * Filters query based on query request
 *
 * @param id represents the name of the Dataset
 * @param courseData represents the given Dataset
 * @param queryKey represents the name of the Dataset
 * @param queryObj represents the given Dataset
 * @returns Array of objects based on input query request
 */
function filter(id: string, courseData: any, queryKey: string, queryObj: any): Array<any> {
    let constraint: string;
    let constraintValue: any;
    let filteredArray: Array<any>[] = [];
    let queryKeys = Object.keys(queryObj[queryKey]);
    constraintValue = queryObj[queryKey][queryKeys[0]];
    constraint = queryKeys.pop().toString();

    // AND / OR use cases
    let arrayBranch: Array<any>[] = [];
    let branch;
    let nestedQueryObjects = queryObj[queryKey];

    if (["GT", "LT", "EQ", "IS"].indexOf(queryKey) >= 0) {
        for (let i = 0; i < courseData.length; i++) {
            if (queryKey == 'GT') {
                if (courseData[i][constraint] > constraintValue) {
                    filteredArray.push(courseData[i]);
                }
            } else if (queryKey == 'LT') {
                if (courseData[i][constraint] < constraintValue) {
                    filteredArray.push(courseData[i]);
                }
            } else if (queryKey == 'EQ') {
                if (courseData[i][constraint] == constraintValue) {
                    filteredArray.push(courseData[i]);
                }
            } else if (queryKey == 'IS') {
                let regVal = new RegExp("^" + constraintValue.split("*").join(".*") + "$");
                if (courseData[i][constraint] == constraintValue) {
                    filteredArray.push(courseData[i]);
                } else if (regVal.test(courseData[i][constraint])) {
                    filteredArray.push(courseData[i]);
                }
            }
        }
        return filteredArray;
    } else if (["AND", "OR"].indexOf(queryKey) >= 0) {
        for (let i = 0; i < nestedQueryObjects.length; i++) {
            let nestedKey = Object.getOwnPropertyNames(nestedQueryObjects[i]).pop();
            let nestedVal = nestedQueryObjects[i];
            branch = filter(id, courseData, nestedKey, nestedVal);
            arrayBranch.push(branch);
        }

        if (queryKey == 'AND') {
            return intersect(id, arrayBranch);
        } else {
            return union(id, arrayBranch);
        }
    } else if (["NOT"].indexOf(queryKey) >= 0) {
        let nestedKey = Object.getOwnPropertyNames(nestedQueryObjects).pop();
        let resultData: Array<any> = filter(id, courseData, nestedKey, nestedQueryObjects);
        return negate(id, courseData, resultData);
    }
}

/**
 * Finds the intersection from a list of arrays
 *
 * @param id represents the name of the Dataset
 * @param arrays represents an array of arrays of filtered dataset objects
 * @returns Array of intersected dataset objects
 */
function intersect(id: string, arrays: Array<any>): Array<any> {
    let uniqueID = 'rooms_name';
    if (id == 'courses') {
        uniqueID = 'courses_uuid';
    }
    let oTracker: Array<any> = [];
    let intersect: Array<any> = [];
    let aTemp;
    for (let i = 0; i < arrays.length; i++) {
        aTemp = arrays[i];
        for (let j = 0; j < aTemp.length; j++) {
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

/**
 * Finds the union from a list of arrays
 *
 * @param id represents the name of the Dataset
 * @param arrays represents an array of arrays of filtered dataset objects
 * @returns Array of unioned dataset objects
 */
function union(id: string, arrays: Array<any>): Array<any> {
    let uniqueID = 'rooms_name';
    if (id == 'courses') {
        uniqueID = 'courses_uuid';
    }
    let oTracker: Array<any> = [];
    let union: Array<any> = [];
    let aTemp;
    for (let i = 0; i < arrays.length; i++) {
        aTemp = arrays[i];
        for (let j = 0; j < aTemp.length; j++) {
            if (!oTracker[aTemp[j][uniqueID]]) {
                oTracker[aTemp[j][uniqueID]] = 1;
                union.push(aTemp[j]);
            }
        }
    }
    return union;
}

/**
 * Finds the negation from a list of arrays
 *
 * @param id represents the name of the dataset
 * @param fullSet represents the entire unfiltered dataset
 * @param negateSet represents the filtered dataset to find the negation of
 * @returns Array
 */
function negate(id: string, fullSet: Array<any>, negateSet: Array<any>): Array<any> {
    let uniqueID = 'rooms_name';
    if (id == 'courses') {
        uniqueID = 'courses_uuid';
    }
    let oTemp: Array<any> = [];
    let negation: Array<any> = [];
    for (let i = 0; i < negateSet.length; i++) {
        oTemp[negateSet[i][uniqueID]] = 1;
    }
    for (let j = 0; j < fullSet.length; j++) {
        if (!oTemp[fullSet[j][uniqueID]]) {
            negation.push(fullSet[j]);
        }
    }
    return negation;
}

/**
 * Determines if a key is valid based on query request
 *
 * @param dataKey represents a key value in the dataset
 * @param validKeys represents the valid keys in the queryRequest
 * @returns true : if required by queried request, false otherwise
 */
function filterKey(dataKey: string, validKeys: Array<string>): boolean {
    for (let i = 0; i < validKeys.length; i++) {
        if (validKeys[i] == dataKey) {
            return true;
        }
    }
    return false;
}

/**
 * Collects an array of valid keys in the query only if APPLY exists
 *
 * @param query represents a query request
 * @returns a string array of valid keys (includes apply keys)
 */
function collectValidKeys(query: QueryRequest): string[] {
    let filterKeysArray: string[] = [];

    if (typeof query.OPTIONS != 'undefined') {
        if (typeof query.OPTIONS.COLUMNS != 'undefined' && query.OPTIONS.COLUMNS.length > 0) {
            for (let i = 0; i < query.OPTIONS.COLUMNS.length; i++) {
                filterKeysArray.push(query.OPTIONS.COLUMNS[i]);
            }
        }
    }

    if (typeof query.TRANSFORMATIONS != 'undefined') {
        if (typeof query.TRANSFORMATIONS.APPLY != 'undefined' &&
            query.TRANSFORMATIONS.APPLY.length > 0) {
            for (let entry of query.TRANSFORMATIONS.APPLY) {
                let applyKey = Object.keys(entry).pop();
                let applyToken = Object.keys(entry[applyKey]).pop();
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
            for (let groupKey of query.TRANSFORMATIONS.GROUP) {
                filterKeysArray.push(groupKey);
            }
        }
    }
    return filterKeysArray;
}

/**
 * Create apply keys in each object
 *
 * @param query represents a query request
 * @param queryOutput represents the dataset
 * @returns an array of the transformed dataset (added apply keys)
 */
function createApplyKeys(query: QueryRequest, queryOutput: Array<any>): Array<any> {
    for (let entry of query.TRANSFORMATIONS.APPLY) {
        let applyKey = Object.keys(entry).pop();
        let applyToken = Object.keys(entry[applyKey]).pop();
        let replaceKey: string = "";
        if (applyToken == 'MAX') {
            replaceKey = entry[applyKey].MAX;
        } else if (applyToken == 'MIN') {
            replaceKey = entry[applyKey].MIN;
        } else if (applyToken == 'AVG') {
            replaceKey = entry[applyKey].AVG;
        } else if (applyToken == 'COUNT') {
            replaceKey = entry[applyKey].COUNT;
        } else if (applyToken == 'SUM') {
            replaceKey = entry[applyKey].SUM;
        }

        if (replaceKey != "") {
            for (let i = 0; i < queryOutput.length; i++) {
                queryOutput[i][applyKey] = queryOutput[i][replaceKey];
            }
        }
    }
    return queryOutput;
}

function groupBy(array: any, f: any): any {
    let groups: any = {};
    array.forEach(function (o: any) {
        let group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });

    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}

function sortByNumber(a: any, b: any, keyToSort: string, dir: string): number {
    if (dir == 'UP') {
        return a[keyToSort] - b[keyToSort];
    } else {
        return b[keyToSort] - a[keyToSort];
    }
}

function sortbyString(a: any, b: any, keyToSort: string, dir: string): number {
    let A = a[keyToSort].toUpperCase();
    let B = b[keyToSort].toUpperCase();

    if (dir == 'UP') {
        return (A < B) ? -1 : (A > B) ? 1 : 0;
    } else {
        return (A > B) ? -1 : (A < B) ? 1 : 0;
    }
}