/**
 * Created by patricklin on 2017-01-28.
 **/

import {expect} from 'chai';
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";

describe("QueryHandlerErrorsSpec", function () {

    var insightFacade: InsightFacade = null;

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
        let data : string;
        try {
            data = fs.readFileSync('test/testzip/courses.zip', {encoding: "base64"});
        } catch (err) {
            throw err;
        }
        return data;
    }

    it("No option should result in 400", function () {
        let query: QueryRequest ={
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            }

        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            //console.log(response.code);
            expect(response.code).to.equal(400);
            expect(response.body).to.deep.equal({"error":"Query format is wrong"});
        });
    });

    it("No Where should result in 400", function () {
        let query: QueryRequest = {

            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("order not in columns should result in 400", function () {
        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Multifilter in where should result in 400", function () {
        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                },
                "LT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_dept",
                "FORM":"TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Missing dependency NOT- 424", function () {
        let query: QueryRequest ={
            "WHERE":{
                "NOT":
                    {
                        "AND":[
                            {
                                "GT":{
                                    "courss_avg":90
                                }
                            },
                            {
                                "IS":{
                                    "amazin_dept":"adhe"
                                }
                            }
                        ]
                    }
            },


            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Missing dependency [2]- 424", function () {
        let query: QueryRequest ={
            "WHERE":{
                "OR":[
                    {
                        "AND":[
                            {
                                "GT":{
                                    "courss_avg":90
                                }
                            },
                            {
                                "IS":{
                                    "corses_dept":"adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ":{
                            "courses_avg":95
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
            //Log.trace(JSON.stringify(response.body));
        });
    });


    it("Missing dependency - 424", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg",
                    "amazing_test"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Missing dependency[all] - 424", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "amazing_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "amazing_test"
                ],
                "ORDER": "amazing_test",
                "FORM": "TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Missing dependency[nested] - 424", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "GT": {
                        "amazing_avg": 97
                    }
                }, {
                    "LT": {
                        "amazing_test": 12
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("L1-Invalid GT should result in 400", function () {
        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_dept":"dept"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });


    it("L1-Empty OR should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "OR":[]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("L1-Invalid IS should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "IS":{ "courses_avg":10}
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("L1-Invalid NOT should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "NOT": {
                    "LT":{"courses_avg":"90"}
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Empty COLUMN should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[

                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Invalid FORM should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM": "DANCE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Invalid ORDER input should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_advg",
                "FORM": "TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Invalid ORDER should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_instructor",
                "FORM": "TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("L2-Empty AND should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "OR":[
                    {
                        "AND":[

                        ]
                    },
                    {
                        "EQ":{
                            "courses_avg":95
                        }
                    }
                ]
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });


    it("Invalid COLUMN input should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_avg",
                    "courses"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });


    it("Invalid GT input should result in 400", function () {

        let query: QueryRequest = {
            "WHERE":{
                "IS":{
                    "courses_afvg":"97"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Too many param in GT", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg":97,
                    "courses_id": 6127
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("string value in GT", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{
                    "courses_avg": "97"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Empty GT", function () {

        let query: QueryRequest = {
            "WHERE":{
                "GT":{

                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });


    it("Too many param in LT", function () {

        let query: QueryRequest = {
            "WHERE":{
                "LT":{
                    "courses_avg":40,
                    "courses_id": 6127
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("string value in LT", function () {

        let query: QueryRequest = {
            "WHERE":{
                "LT":{
                    "courses_avg": "40"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Too many param in EQ", function () {

        let query: QueryRequest = {
            "WHERE":{
                "EQ":{
                    "courses_avg": 95,
                    "courses_id": 310
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("String value in EQ", function () {

        let query: QueryRequest = {
            "WHERE":{
                "EQ":{
                    "courses_avg": "95",
                    "courses_id": "310"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Empty EQ", function () {

        let query: QueryRequest = {
            "WHERE":{
                "EQ":{

                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
            //Log.trace(JSON.stringify(response.body));
        });
    });

    it("Too many param in IS", function () {

        let query: QueryRequest = {
            "WHERE":{
                "IS":{
                    "courses_instructor": "*holmes",
                    "courses_dept": "cpsc"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(400);
        });
    });

    it("LT requires number key", function () {

        let query: QueryRequest = {
            "WHERE":{
                "LT":{
                    "courses_dept":97
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_dept",
                "FORM":"TABLE"
            }
        };

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            console.log(response.body);
            expect(response.code).to.equal(400);
        });
    });

    it("EQ should be a number", function () {

        let query: QueryRequest = {
            "WHERE":{
                "EQ":{
                    "courses_avg": "invalid"
                }
            },
            "OPTIONS":{
                "COLUMNS":[
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER":"courses_avg",
                "FORM":"TABLE"
            }
        }

        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail('Should not happen');
        }).catch(function (response: InsightResponse) {
            console.log(response.body);
            expect(response.code).to.equal(400);
        });
    });
});



