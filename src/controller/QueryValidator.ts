/**
 * Created by naing on 2017-02-15.
 */

import {QueryRequest} from "./IInsightFacade";

export default class QueryValidator {
    public validate(query: QueryRequest): boolean {
        return (query !== null && Object.keys(query).length > 0 && typeof query !== 'undefined');
    }

    public validateDependency(propName: any, propCallback: any, datasetid: string[]): string[] {
        let missingDependecy:string[] = [];
        let nestPropKey = Object.keys(propCallback[propName]);
        if (propName == 'GT' || propName == 'LT' || propName == 'EQ' || propName == 'IS'){
            let testKey = nestPropKey.pop();
            if(testKey.indexOf("_") >= 0) {
                let testID = testKey.split("_")[0];
                if (datasetid.indexOf(testID) === -1){
                    missingDependecy.push(testID);
                    return missingDependecy;
                }
            }
            return missingDependecy;
        } else if (propName == 'OR' || propName == 'AND') {
            let nestedKeys = propCallback[propName];
            if (nestedKeys.length == 0) {
                return missingDependecy;
            }
            let tracker:string[] = [];
            for (let key of nestedKeys) {
                let newPropName = Object.keys(key).pop();
                let validateit = this.validateDependency(newPropName, key, datasetid);
                tracker = tracker.concat(validateit.filter(function (item) {
                    return tracker.indexOf(item) < 0;
                }));
            }
            if (tracker.length != 0) {
                return tracker;
            }

        } else if (propName == 'NOT') {
            let nestedKeys = nestPropKey.pop();
            let nestedPropObj = propCallback[propName];
            let validateit = this.validateDependency(nestedKeys, nestedPropObj,datasetid);
            if (validateit.length != 0) {
                return validateit;
            }
        }
        return missingDependecy;
    }

    public validateMultipleKeys(propName: any, propCallback: any) : string[] {
        let keyID: Array<string> = [];
        let nestPropKey = Object.keys(propCallback[propName]);
        if (propName == 'GT' || propName == 'LT' || propName == 'EQ' || propName == 'IS'){
            let testKey = nestPropKey.pop();
            if(testKey.indexOf("_") >= 0) {
                let testID = testKey.split("_")[0];
                if(keyID.indexOf(testID) === -1) {
                    keyID.push(testID);
                }
            }
            return keyID;
        } else if (propName == 'OR' || propName == 'AND') {
            let nestedKeys = propCallback[propName];
            if (nestedKeys.length == 0) {
                return keyID;
            }
            let tracker:string[] = [];
            for (let key of nestedKeys) {
                let newPropName = Object.keys(key).pop();
                let validateit = this.validateMultipleKeys(newPropName, key);
                tracker = tracker.concat(validateit.filter(function (item) {
                    return tracker.indexOf(item) < 0;
                }));
            }
            if (tracker.length != 0) {
                return tracker;
            }

        } else if (propName == 'NOT') {
            let nestedKeys = nestPropKey.pop();
            let nestedPropObj = propCallback[propName];
            let validateit = this.validateMultipleKeys(nestedKeys, nestedPropObj);
            if (validateit.length != 0) {
                return validateit;
            }
        }
        return keyID;
    }

    public validateEmpty(propName: any, propCallback: any): string {
        let nestPropKey = Object.keys(propCallback[propName]);
        switch (propName) {
            case 'GT':
                if (nestPropKey.length != 1) {
                    return "Query is incomplete";
                }
                return "Passed";

            case 'LT':
                if (nestPropKey.length != 1) {
                    return "Query is incomplete";
                }
                return "Passed";

            case 'EQ':
                if (nestPropKey.length != 1) {
                    return "Query is incomplete";
                }
                return "Passed";

            case 'IS':
                if (nestPropKey.length != 1) {
                    return "Query is incomplete";
                }
                return "Passed";

            case 'NOT':
                if (nestPropKey.length != 1) {
                    return "Query contains too many parameters";
                }

                else {
                    let nestedKeys = nestPropKey.pop();
                    let nestedPropObj = propCallback[propName];
                    let validateit = this.validateEmpty(nestedKeys, nestedPropObj);
                    if (validateit != 'Passed') {
                        return validateit;
                    }
                    return "Passed";
                }

            case 'OR':
                if (nestPropKey.length == 0) {
                    return "Invalid query: OR should have at least one condition.";
                } else {
                    let nestedKeys = propCallback[propName];
                    for (let key of nestedKeys) {
                        let newPropName = Object.keys(key).pop();
                        let validateit = this.validateEmpty(newPropName, key);
                        if (validateit != 'Passed') {
                            return validateit;
                        }
                    }
                    return "Passed";
                }

            case 'AND':
                if (nestPropKey.length == 0) {
                    return "Invalid query: AND should have at least one condition.";
                } else {
                    let nestedKeys = propCallback[propName];
                    for (let key of nestedKeys) {
                        let newPropName = Object.keys(key).pop();
                        let validateit = this.validateEmpty(newPropName, key);
                        if (validateit != 'Passed') {
                            return validateit;
                        }

                    }
                    return "Passed";
                }
        }
    }

    public validateFILTER(propName: any, propCallback: any): string {
        let nestPropKey = Object.keys(propCallback[propName]);
        let propertyValue = propCallback[propName][nestPropKey[0]];

        switch (propName) {
            case 'GT':
                if (nestPropKey.length != 1) {
                    return "Query contains too many parameters";
                }
                if (typeof propertyValue != "number") {
                    return "Invalid query: GT value should be a number.";
                }
                if (["courses_avg", "courses_pass", "courses_fail", "courses_audit","courses_year", "courses_size","rooms_lat",
                        "rooms_lon","rooms_seats"].indexOf(nestPropKey.pop()) < 0) {
                    return "Invalid query: GT requires a number key";
                }
                return "Passed";

            case 'LT':
                if (nestPropKey.length != 1) {
                    return "Query contains too many parameters";
                }
                if (typeof propertyValue != "number") {
                    return "Invalid query: LT value should be a number.";
                }
                if (["courses_avg", "courses_pass", "courses_fail", "courses_audit","courses_year", "courses_size",  "rooms_lat",
                        "rooms_lon","rooms_seats"].indexOf(nestPropKey.pop()) < 0) {
                    return "Invalid query: LT requires a number key";
                }
                return "Passed";

            case 'EQ':
                if (nestPropKey.length != 1) {
                    return "Query contains too many parameters";
                }
                if (typeof propertyValue != "number") {
                    return "Invalid query: EQ value should be a number.";
                }
                if (["courses_avg", "courses_pass", "courses_fail", "courses_audit","courses_year", "courses_size","rooms_lat",
                        "rooms_lon","rooms_seats"].indexOf(nestPropKey.pop()) < 0) {
                    return "Invalid query: EQ requires a number key";
                }
                return "Passed";

            case 'IS':
                if (nestPropKey.length != 1) {
                    return "Query contains too many parameters";
                }
                if (typeof propertyValue != "string") {
                    return "Invalid query: IS value should be a string";
                }

                if (["courses_dept", "courses_id", "courses_instructor", "courses_title"
                        , "courses_uuid", 'rooms_fullname', 'rooms_shortname', 'rooms_number',
                        'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
                        'rooms_href'].indexOf(nestPropKey.pop()) < 0) {
                    return "Invalid query: IS requires a string key";
                }
                return "Passed";

            case 'NOT':
                if (nestPropKey.length != 1) {
                    return "Query contains too many parameters";
                }

                else {
                    let nestedKeys = nestPropKey.pop();
                    let nestedPropObj = propCallback[propName];
                    let validateit = this.validateFILTER(nestedKeys, nestedPropObj);
                    if (validateit != 'Passed') {
                        return validateit;
                    }
                    return "Passed";
                }

            case 'OR':
                if (nestPropKey.length == 0) {
                    return "Invalid query: OR should have at least one condition.";
                } else {
                    let nestedKeys = propCallback[propName];
                    for (let key of nestedKeys) {
                        let newPropName = Object.keys(key).pop();
                        let validateit = this.validateFILTER(newPropName, key);
                        if (validateit != 'Passed') {
                            return validateit;
                        }
                    }
                    return "Passed";
                }

            case 'AND':
                if (nestPropKey.length == 0) {
                    return "Invalid query: AND should have at least one condition.";
                } else {
                    let nestedKeys = propCallback[propName];
                    for (let key of nestedKeys) {
                        let newPropName = Object.keys(key).pop();
                        let validateit = this.validateFILTER(newPropName, key);
                        if (validateit != 'Passed') {
                            return validateit;
                        }

                    }
                    return "Passed";
                }
        }
    }

    public validateOPTIONS(query: QueryRequest): string {

        let validKeys = ["courses_dept", "courses_id",
            "courses_avg", "courses_instructor", "courses_title",
            "courses_pass", "courses_fail", "courses_audit", "courses_uuid", "courses_year", "courses_size",
            "rooms_lat", "rooms_lon","rooms_seats", 'rooms_fullname', 'rooms_shortname', 'rooms_number',
            'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
            'rooms_href'];

        if (query.OPTIONS.COLUMNS.length == 0) {
            return "Columns cannot be empty";
        }

        if (typeof query.TRANSFORMATIONS != 'undefined') {
            if (typeof query.TRANSFORMATIONS.APPLY != 'undefined') {
                for (let entry of query.TRANSFORMATIONS.APPLY) {
                    let key = Object.keys(entry).pop();
                    validKeys.push(key);
                }
            }
        }

        for (let entry of query.OPTIONS.COLUMNS) {
            if (validKeys.indexOf(entry) < 0) {
                return "Query is not valid";
            }
        }

        if (query.OPTIONS.FORM != "TABLE") {
            return "Query is not valid";
        }

        if (typeof query.OPTIONS.ORDER != 'undefined') {
            if (typeof query.OPTIONS.ORDER == 'string') {
                if (validKeys.indexOf(query.OPTIONS.ORDER) < 0 ||
                    query.OPTIONS.COLUMNS.indexOf(query.OPTIONS.ORDER) < 0) {
                    return "Query is not valid";
                }
            } else {

                //safeguard - unreachable?
                if (typeof query.OPTIONS.ORDER['dir'] == 'undefined' ||
                    typeof query.OPTIONS.ORDER['keys'] == 'undefined') {
                    return "Options order not valid";
                }

                let dirToken = ["UP","DOWN"];
                //safeguard - unreachable?
                if (dirToken.indexOf(query.OPTIONS.ORDER['dir']) < 0) {
                    return "Order direction not valid";
                }

                let validOrderKeys = query.OPTIONS.ORDER['keys'];
                for (let validKey of validOrderKeys) {
                    if (query.OPTIONS.COLUMNS.indexOf(validKey) == -1) {
                        return "Order key needs to be included in columns";
                    }
                }
            }

        }
        return 'Passed';
    }

    public validateTransform(query: QueryRequest): string {

        if (typeof query.TRANSFORMATIONS == 'undefined') {
            return 'Passed';
        } else {
/*            if (typeof query.TRANSFORMATIONS.GROUP == 'string') {
                return "Group cannot contain apply keys";
            }*/

            if (query.TRANSFORMATIONS.GROUP.length == 0) {
                return "Group cannot be empty";
            }

            if (query.TRANSFORMATIONS.APPLY.length == 0) {
                return 'Passed';
            }

            let checkDup = [];
            for (let et = 0; et < query.TRANSFORMATIONS.APPLY.length; et++) {
                let apppkey = Object.keys(query.TRANSFORMATIONS.APPLY[et]).pop();
                checkDup.push(apppkey);
            }

            if(hasDuplicates(checkDup)) {
                return 'Duplicate apply key';
            }

            for (let ent = 0; ent < query.TRANSFORMATIONS.APPLY.length; ent++) {
                let apppkey = Object.keys(query.TRANSFORMATIONS.APPLY[ent]);
                if (apppkey.length == 0) {
                    return 'Malformed apply';
                }
                let nextkey = Object.keys(query.TRANSFORMATIONS.APPLY[ent][apppkey.pop()]);
                if (nextkey.length == 0) {
                    return 'Malformed apply';
                }
            }

            let tokens = ['MAX', 'MIN', 'AVG', 'COUNT', 'SUM'];
            let numfields = ['MAX', 'MIN', 'AVG', 'SUM'];
            let numKeys = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year", "courses_size",
                "rooms_lat", "rooms_lon", "rooms_seats"];
            let validKeys = ["courses_dept", "courses_id",
                "courses_avg", "courses_instructor", "courses_title",
                "courses_pass", "courses_fail", "courses_audit", "courses_uuid", "courses_year", "courses_size",
                "rooms_lat", "rooms_lon", "rooms_seats", 'rooms_fullname', 'rooms_shortname', 'rooms_number',
                'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
                'rooms_href'];

            let applyKeys = [];

            for (let y = 0; y < query.TRANSFORMATIONS.APPLY.length; y++) {
                applyKeys.push(Object.keys(query.TRANSFORMATIONS.APPLY[y])[0]);
            }

            //Can't Apply _
            for (let entry of applyKeys) {
                if (entry.indexOf('_') > -1) {
                    return "Apply keys cannot contain '_'";
                }
            }

            for (let i = 0; i < query.TRANSFORMATIONS.APPLY.length; i++) {
                let appkey = Object.keys(query.TRANSFORMATIONS.APPLY[i])[0];
                let app :any= query.TRANSFORMATIONS.APPLY[i][appkey];
                let appToken = Object.keys(app)[0];
                let appTokenVal:any = app[appToken];

                if (tokens.indexOf(appToken) < 0) {
                    return 'Apply token not recognized'
                } else {
                    if (appToken == 'COUNT') {
                        if (validKeys.indexOf(appTokenVal) < 0) {
                            return appTokenVal + " is not a valid key";
                        }
                    }
                }

                if (numfields.indexOf(appToken) >= 0) {
                    if (numKeys.indexOf(appTokenVal) < 0) {
                        if (appToken == 'MAX') {
                            return "Max supports only numerical values";
                        } else if (appToken == 'MIN') {
                            return "Min supports only numerical values";
                        } else if (appToken == 'AVG') {
                            return "Avg supports only numerical values";
                        } else if (appToken == 'SUM') {
                            return "Sum supports only numerical values";
                        }
                    }
                }
            }
            return 'Passed';
        }
    }
}

function hasDuplicates(array:any) {
    return (new Set(array)).size !== array.length;
};