/**
 * Created by patricklin on 2017-03-06.
 */

import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";

describe("CompQueries - Courses", function () {
    let insightFacade: InsightFacade = null;
    before(function () {
        insightFacade = new InsightFacade();
        let content = readZip();
        return insightFacade.addDataset('courses', content);
    });

    after(function () {
        return insightFacade.removeDataset('courses');
    });

    function readZip() {
        let fs = require("fs");
        let data: string;
        try {
            data = fs.readFileSync('test/testzip/courses.zip', {encoding: "base64"});
        } catch (err) {
            throw err;
        }
        return data;
    }

    it("Count Sort on String", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS":{
                    "courses_id":"106"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_id", "bestAvg", "LowPass", "AvgAudit", "NumberOfInstructor", "SUMPass"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_id", "bestAvg", "LowPass", "AvgAudit", "NumberOfInstructor", "SUMPass"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_id"],
                "APPLY": [
                    {
                        "bestAvg": {
                            "MAX": "courses_avg"
                        }
                    },

                    {
                        "LowPass": {
                            "MIN": "courses_pass"
                        }
                    },

                    {
                        "AvgAudit": {
                            "AVG": "courses_audit"
                        }
                    },

                    {
                        "NumberOfInstructor": {
                            "COUNT": "courses_instructor"
                        }
                    },

                    {
                        "SUMPass": {
                            "SUM": "courses_pass"
                        }
                    }
                ]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"render":"TABLE","result":[{"courses_id":"106","bestAvg":85.04,"LowPass":18,"AvgAudit":0.22,"NumberOfInstructor":5,"SUMPass":2331}]});
        }).catch(function (response: InsightResponse) {
            console.log(response.code);
            console.log(response.body);
            expect.fail('Should not happen');
        });
    });

    it("Sort on Multi Order", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "courses_title": "*software*"
                    }
                }, {
                    "GT": {
                        "courses_avg": 80
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_avg",
                    "courses_id",
                    "maxGrade"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_id", "maxGrade"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_avg", "courses_id"],
                "APPLY": [{
                    "maxGrade": {
                        "MAX": "courses_avg"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{"courses_avg": 80.87, "courses_id": "321", "maxGrade": 80.87}, {
                    "courses_avg": 80.18,
                    "courses_id": "410",
                    "maxGrade": 80.18
                }, {"courses_avg": 85.92, "courses_id": "492", "maxGrade": 85.92}, {
                    "courses_avg": 82.5,
                    "courses_id": "507",
                    "maxGrade": 82.5
                }, {"courses_avg": 84.75, "courses_id": "507", "maxGrade": 84.75}, {
                    "courses_avg": 89,
                    "courses_id": "507",
                    "maxGrade": 89
                }, {"courses_avg": 89.17, "courses_id": "507", "maxGrade": 89.17}, {
                    "courses_avg": 91.79,
                    "courses_id": "507",
                    "maxGrade": 91.79
                }, {"courses_avg": 80.91, "courses_id": "530", "maxGrade": 80.91}, {
                    "courses_avg": 82.63,
                    "courses_id": "530",
                    "maxGrade": 82.63
                }, {"courses_avg": 86, "courses_id": "530", "maxGrade": 86}, {
                    "courses_avg": 87.37,
                    "courses_id": "530",
                    "maxGrade": 87.37
                }, {"courses_avg": 88.52, "courses_id": "530", "maxGrade": 88.52}, {
                    "courses_avg": 88.68,
                    "courses_id": "530",
                    "maxGrade": 88.68
                }, {"courses_avg": 89.68, "courses_id": "530", "maxGrade": 89.68}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Sort on Two Orders", function () {
        let query: QueryRequest = {
            "WHERE": {
                "EQ": {
                    "courses_avg": 60
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "deptAVG"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["deptAVG", "courses_dept"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept"],
                "APPLY": [{
                    "deptAVG": {
                        "AVG": "courses_avg"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{"courses_dept": "test", "deptAVG": 60}, {
                    "courses_dept": "phil",
                    "deptAVG": 60
                }, {"courses_dept": "phar", "deptAVG": 60}, {
                    "courses_dept": "hist",
                    "deptAVG": 60
                }, {"courses_dept": "dhyg", "deptAVG": 60}, {
                    "courses_dept": "chem",
                    "deptAVG": 60
                }, {"courses_dept": "busi", "deptAVG": 60}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("SUM of all courses in dept", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {"GT": {"courses_year": 2014}},
                    {"IS": {"courses_dept": "cp*"}}
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_instructor",
                    "avgGrade"
                ],
                "ORDER": "avgGrade",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_instructor"],
                "APPLY": [{
                    "avgGrade": {
                        "SUM": "courses_avg"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{
                    "courses_dept": "cpsc",
                    "courses_instructor": "allen, meghan",
                    "avgGrade": 69.24
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "fedorova, alexandra",
                    "avgGrade": 69.41
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "little, james joseph",
                    "avgGrade": 70.47
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "hutchinson, norman",
                    "avgGrade": 70.7
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "lis, mieszko",
                    "avgGrade": 71.13
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "aiello, william",
                    "avgGrade": 71.14
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "gao, xi",
                    "avgGrade": 72.03
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "khosravi, hassan",
                    "avgGrade": 72.4
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "kotthoff, lars",
                    "avgGrade": 72.53
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "ng, raymond tak-yan",
                    "avgGrade": 72.9
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "kruchten, philippe",
                    "avgGrade": 73.42
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "aamodt, tor",
                    "avgGrade": 73.81
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "tung, frederick",
                    "avgGrade": 73.95
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "gelbart, michael",
                    "avgGrade": 74.23
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "lemieux, guy",
                    "avgGrade": 74.78
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "wolfman, steven",
                    "avgGrade": 74.79
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "qi, hongxing estella",
                    "avgGrade": 74.82
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "mesbah, ali",
                    "avgGrade": 75.94
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "wiseman, kelleen",
                    "avgGrade": 76.21
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "gopalakrishnan, sathish",
                    "avgGrade": 76.56
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "sagaii, sara mahboubeh",
                    "avgGrade": 76.93
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "ripeanu, radu",
                    "avgGrade": 77.13
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "bessmeltsev, mikhail",
                    "avgGrade": 78.7
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "ascher, uri michael",
                    "avgGrade": 79.29
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "lakshmanan, laks",
                    "avgGrade": 79.56
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "mitchell, ian",
                    "avgGrade": 83.36
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "hoos, holger",
                    "avgGrade": 83.59
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "dunfield, joshua",
                    "avgGrade": 84.39
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "awad, ahmed",
                    "avgGrade": 87.93
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "berg, celina",
                    "avgGrade": 145.44
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "feeley, michael",
                    "avgGrade": 147.14
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "hu, alan",
                    "avgGrade": 147.74
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "wilton, steven",
                    "avgGrade": 148.95999999999998
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "berndt, annette",
                    "avgGrade": 151.5
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "minns, steven",
                    "avgGrade": 152.85
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "kiczales, gregor",
                    "avgGrade": 155.69
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "dawson, jessica",
                    "avgGrade": 156.56
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "conati, cristina",
                    "avgGrade": 156.98000000000002
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "friedman, joel",
                    "avgGrade": 157.53
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "calvino-fraga, jesus",
                    "avgGrade": 161.54
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "beznosov, konstantin",
                    "avgGrade": 162.15
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "carenini, giuseppe",
                    "avgGrade": 164.01
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "munzner, tamara",
                    "avgGrade": 165.14
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "greenstreet, mark",
                    "avgGrade": 170.17000000000002
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "arefifar, seyed ali;botman, pieter;fels, s sidney;grecu, cristian sorin;kruchten, philippe;lee, terry;lusina, paul;madden, john;najarian, siamak;tang, shuo",
                    "avgGrade": 172.24
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "beschastnikh, ivan",
                    "avgGrade": 172.4
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "garcia, ronald",
                    "avgGrade": 173.2
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "manuch, jan",
                    "avgGrade": 212.19
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "baniassad, elisa",
                    "avgGrade": 232.48000000000002
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "evans, william",
                    "avgGrade": 232.53
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "poole, david",
                    "avgGrade": 235.14
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "maclean, karon",
                    "avgGrade": 241.99
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "holmes, reid",
                    "avgGrade": 249.17000000000002
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "davies, paul",
                    "avgGrade": 251.01000000000002
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "schmidt, mark",
                    "avgGrade": 253.48
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "carter, paul martin",
                    "avgGrade": 296.55
                }, {"courses_dept": "cpsc", "courses_instructor": "", "avgGrade": 329.98}, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "acton, donald",
                    "avgGrade": 362.48
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "belleville, patrice",
                    "avgGrade": 374.03000000000003
                }, {"courses_dept": "cpsc", "courses_instructor": "tsiknis, georgios", "avgGrade": 418.46}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("AVG of all courses in dept", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {"GT": {"courses_year": 2014}},
                    {"IS": {"courses_dept": "cp*"}}
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_instructor",
                    "avgGrade"
                ],
                "ORDER": "avgGrade",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_instructor"],
                "APPLY": [{
                    "avgGrade": {
                        "AVG": "courses_avg"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{
                    "courses_dept": "cpsc",
                    "courses_instructor": "allen, meghan",
                    "avgGrade": 69.2
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "fedorova, alexandra",
                    "avgGrade": 69.4
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "little, james joseph",
                    "avgGrade": 70.5
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "hutchinson, norman",
                    "avgGrade": 70.7
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "manuch, jan",
                    "avgGrade": 70.73
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "lis, mieszko",
                    "avgGrade": 71.1
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "aiello, william",
                    "avgGrade": 71.1
                }, {"courses_dept": "cpsc", "courses_instructor": "gao, xi", "avgGrade": 72}, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "khosravi, hassan",
                    "avgGrade": 72.4
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "kotthoff, lars",
                    "avgGrade": 72.5
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "acton, donald",
                    "avgGrade": 72.5
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "berg, celina",
                    "avgGrade": 72.75
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "ng, raymond tak-yan",
                    "avgGrade": 72.9
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "kruchten, philippe",
                    "avgGrade": 73.4
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "feeley, michael",
                    "avgGrade": 73.6
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "aamodt, tor",
                    "avgGrade": 73.8
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "hu, alan",
                    "avgGrade": 73.9
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "tung, frederick",
                    "avgGrade": 74
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "carter, paul martin",
                    "avgGrade": 74.17
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "gelbart, michael",
                    "avgGrade": 74.2
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "wilton, steven",
                    "avgGrade": 74.45
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "wolfman, steven",
                    "avgGrade": 74.8
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "qi, hongxing estella",
                    "avgGrade": 74.8
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "lemieux, guy",
                    "avgGrade": 74.8
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "belleville, patrice",
                    "avgGrade": 74.82
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "berndt, annette",
                    "avgGrade": 75.75
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "mesbah, ali",
                    "avgGrade": 75.9
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "wiseman, kelleen",
                    "avgGrade": 76.2
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "minns, steven",
                    "avgGrade": 76.4
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "gopalakrishnan, sathish",
                    "avgGrade": 76.6
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "sagaii, sara mahboubeh",
                    "avgGrade": 76.9
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "ripeanu, radu",
                    "avgGrade": 77.1
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "evans, william",
                    "avgGrade": 77.5
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "baniassad, elisa",
                    "avgGrade": 77.5
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "kiczales, gregor",
                    "avgGrade": 77.85
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "dawson, jessica",
                    "avgGrade": 78.25
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "poole, david",
                    "avgGrade": 78.37
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "conati, cristina",
                    "avgGrade": 78.5
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "bessmeltsev, mikhail",
                    "avgGrade": 78.7
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "friedman, joel",
                    "avgGrade": 78.75
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "ascher, uri michael",
                    "avgGrade": 79.3
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "lakshmanan, laks",
                    "avgGrade": 79.6
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "maclean, karon",
                    "avgGrade": 80.67
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "calvino-fraga, jesus",
                    "avgGrade": 80.75
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "beznosov, konstantin",
                    "avgGrade": 81.1
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "carenini, giuseppe",
                    "avgGrade": 82
                }, {"courses_dept": "cpsc", "courses_instructor": "", "avgGrade": 82.5}, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "munzner, tamara",
                    "avgGrade": 82.6
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "holmes, reid",
                    "avgGrade": 83.07
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "mitchell, ian",
                    "avgGrade": 83.4
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "hoos, holger",
                    "avgGrade": 83.6
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "davies, paul",
                    "avgGrade": 83.7
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "tsiknis, georgios",
                    "avgGrade": 83.7
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "dunfield, joshua",
                    "avgGrade": 84.4
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "schmidt, mark",
                    "avgGrade": 84.5
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "greenstreet, mark",
                    "avgGrade": 85.05
                }, {
                    "courses_dept": "cpen",
                    "courses_instructor": "arefifar, seyed ali;botman, pieter;fels, s sidney;grecu, cristian sorin;kruchten, philippe;lee, terry;lusina, paul;madden, john;najarian, siamak;tang, shuo",
                    "avgGrade": 86.1
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "beschastnikh, ivan",
                    "avgGrade": 86.2
                }, {
                    "courses_dept": "cpsc",
                    "courses_instructor": "garcia, ronald",
                    "avgGrade": 86.6
                }, {"courses_dept": "cpsc", "courses_instructor": "awad, ahmed", "avgGrade": 87.9}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Sample Query A for Courses", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "courses_title": "*software*"
                    }
                }, {
                    "GT": {
                        "courses_avg": 80
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_avg",
                    "courses_id",
                    "maxGrade"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_id"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_avg", "courses_id"],
                "APPLY": [{
                    "maxGrade": {
                        "MAX": "courses_avg"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{"courses_avg": 80.87, "courses_id": "321", "maxGrade": 80.87}, {
                    "courses_avg": 80.18,
                    "courses_id": "410",
                    "maxGrade": 80.18
                }, {"courses_avg": 85.92, "courses_id": "492", "maxGrade": 85.92}, {
                    "courses_avg": 89.17,
                    "courses_id": "507",
                    "maxGrade": 89.17
                }, {"courses_avg": 82.5, "courses_id": "507", "maxGrade": 82.5}, {
                    "courses_avg": 91.79,
                    "courses_id": "507",
                    "maxGrade": 91.79
                }, {"courses_avg": 84.75, "courses_id": "507", "maxGrade": 84.75}, {
                    "courses_avg": 89,
                    "courses_id": "507",
                    "maxGrade": 89
                }, {"courses_avg": 80.91, "courses_id": "530", "maxGrade": 80.91}, {
                    "courses_avg": 87.37,
                    "courses_id": "530",
                    "maxGrade": 87.37
                }, {"courses_avg": 89.68, "courses_id": "530", "maxGrade": 89.68}, {
                    "courses_avg": 82.63,
                    "courses_id": "530",
                    "maxGrade": 82.63
                }, {"courses_avg": 88.52, "courses_id": "530", "maxGrade": 88.52}, {
                    "courses_avg": 86,
                    "courses_id": "530",
                    "maxGrade": 86
                }, {"courses_avg": 88.68, "courses_id": "530", "maxGrade": 88.68}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Sample Query B for Courses", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "courses_title": "*software*"
                    }
                }, {
                    "GT": {
                        "courses_avg": 80
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_id",
                    "maxGrade"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_id"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_id"],
                "APPLY": [{
                    "maxGrade": {
                        "MAX": "courses_avg"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{"courses_id": "321", "maxGrade": 80.87}, {
                    "courses_id": "410",
                    "maxGrade": 80.18
                }, {"courses_id": "492", "maxGrade": 85.92}, {
                    "courses_id": "507",
                    "maxGrade": 91.79
                }, {"courses_id": "530", "maxGrade": 89.68}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

});

