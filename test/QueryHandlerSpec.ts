/**
 * Created by patricklin on 2017-01-24.
 **/

import {expect} from 'chai';
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";

describe("QueryHandlerSpec", function () {
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
        let data: string;
        try {
            data = fs.readFileSync('test/testzip/courses.zip', {encoding: "base64"});
        } catch (err) {
            throw err;
        }
        return data;
    }

    it("Filter by year", function () {
        let query: QueryRequest = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 90
                                }
                            },
                            {
                                "EQ": {
                                    "courses_year": 2016
                                }
                            }
                        ]
                    },
                    {
                        "EQ": {
                            "courses_avg": 95
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_year"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
            //Log.trace(JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("CASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 90
                                }
                            },
                            {
                                "IS": {
                                    "courses_dept": "adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ": {
                            "courses_avg": 95
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_uuid",
                    "courses_year"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(JSON.stringify(response.body));
            //Log.trace(JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("MISSING ORDER CASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{"courses_dept": "cnps", "courses_avg": 99.19}, {
                    "courses_dept": "cnps",
                    "courses_avg": 97.47
                }, {"courses_dept": "cnps", "courses_avg": 97.47}, {
                    "courses_dept": "crwr",
                    "courses_avg": 98
                }, {"courses_dept": "crwr", "courses_avg": 98}, {
                    "courses_dept": "educ",
                    "courses_avg": 97.5
                }, {"courses_dept": "eece", "courses_avg": 98.75}, {
                    "courses_dept": "eece",
                    "courses_avg": 98.75
                }, {"courses_dept": "epse", "courses_avg": 98.08}, {
                    "courses_dept": "epse",
                    "courses_avg": 98.7
                }, {"courses_dept": "epse", "courses_avg": 98.36}, {
                    "courses_dept": "epse",
                    "courses_avg": 97.29
                }, {"courses_dept": "epse", "courses_avg": 97.29}, {
                    "courses_dept": "epse",
                    "courses_avg": 98.8
                }, {"courses_dept": "epse", "courses_avg": 97.41}, {
                    "courses_dept": "epse",
                    "courses_avg": 98.58
                }, {"courses_dept": "epse", "courses_avg": 98.58}, {
                    "courses_dept": "epse",
                    "courses_avg": 98.76
                }, {"courses_dept": "epse", "courses_avg": 98.76}, {
                    "courses_dept": "epse",
                    "courses_avg": 98.45
                }, {"courses_dept": "epse", "courses_avg": 98.45}, {
                    "courses_dept": "epse",
                    "courses_avg": 97.78
                }, {"courses_dept": "epse", "courses_avg": 97.41}, {
                    "courses_dept": "epse",
                    "courses_avg": 97.69
                }, {"courses_dept": "epse", "courses_avg": 97.09}, {
                    "courses_dept": "epse",
                    "courses_avg": 97.09
                }, {"courses_dept": "epse", "courses_avg": 97.67}, {
                    "courses_dept": "math",
                    "courses_avg": 97.25
                }, {"courses_dept": "math", "courses_avg": 97.25}, {
                    "courses_dept": "math",
                    "courses_avg": 99.78
                }, {"courses_dept": "math", "courses_avg": 99.78}, {
                    "courses_dept": "math",
                    "courses_avg": 97.48
                }, {"courses_dept": "math", "courses_avg": 97.48}, {
                    "courses_dept": "math",
                    "courses_avg": 97.09
                }, {"courses_dept": "math", "courses_avg": 97.09}, {
                    "courses_dept": "nurs",
                    "courses_avg": 98.71
                }, {"courses_dept": "nurs", "courses_avg": 98.71}, {
                    "courses_dept": "nurs",
                    "courses_avg": 98.21
                }, {"courses_dept": "nurs", "courses_avg": 98.21}, {
                    "courses_dept": "nurs",
                    "courses_avg": 97.53
                }, {"courses_dept": "nurs", "courses_avg": 97.53}, {
                    "courses_dept": "nurs",
                    "courses_avg": 98.5
                }, {"courses_dept": "nurs", "courses_avg": 98.5}, {
                    "courses_dept": "nurs",
                    "courses_avg": 98.58
                }, {"courses_dept": "nurs", "courses_avg": 98.58}, {
                    "courses_dept": "nurs",
                    "courses_avg": 97.33
                }, {"courses_dept": "nurs", "courses_avg": 97.33}, {
                    "courses_dept": "spph",
                    "courses_avg": 98.98
                }, {"courses_dept": "spph", "courses_avg": 98.98}]
            });
        }).catch(function (response: InsightResponse) {
            console.log(response.code);
            console.log(response.body);
            expect.fail('Should not happen');
        });
    });

    it("LARGEANDCASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 50
                        }
                    },
                    {
                        "GT": {
                            "courses_pass": 1
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg",
                    "courses_pass"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //Log.trace(JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });


    it("NOT CASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "NOT": {
                    "GT": {
                        "courses_avg": 40
                    }
                }
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
            expect(response.code).to.equal(200);
            //Log.trace(JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("TRIAND", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {


                        "GT": {
                            "courses_avg": 68
                        }

                    },
                    {
                        "EQ": {
                            "courses_avg": 68.71
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "wall*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_instructor",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
            //Log.trace(JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("TRIOR", function () {
        let query: QueryRequest = {
            "WHERE": {
                "OR": [
                    {


                        "GT": {
                            "courses_avg": 99
                        }

                    },
                    {
                        "EQ": {
                            "courses_avg": 98
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "wall*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_instructor",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //Log.trace(JSON.stringify(response.body));
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("1AND", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 99
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Partial-IS", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "courses_instructor": "*holmes*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_instructor"
                ],
                "ORDER": "courses_instructor",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("GT-BASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
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
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("LT-BASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "LT": {
                    "courses_avg": 4
                }
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
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("EQ-BASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "EQ": {
                    "courses_avg": 50
                }
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
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("IS-BASE", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "courses_instructor": "carter, paul martin"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_instructor",
                    "courses_title",
                    "courses_uuid",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("OR-NestedAND", function () {
        let query: QueryRequest = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 90
                                }
                            },
                            {
                                "IS": {
                                    "courses_dept": "adhe"
                                }
                            }
                        ]
                    },
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_pass": 0
                                }
                            },
                            {
                                "GT": {
                                    "courses_audit": 20
                                }

                            }
                        ]
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Complex query", function () {
        let query: QueryRequest = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 90
                                }
                            },
                            {
                                "IS": {
                                    "courses_dept": "adhe"
                                }
                            }
                        ]
                    },
                    {
                        "EQ": {
                            "courses_avg": 95
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

});

