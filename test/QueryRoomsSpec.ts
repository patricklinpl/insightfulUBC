/**
 * Created by patricklin on 2017-02-13.
 */


import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse, QueryRequest} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";

describe("QueryRoomsSpec", function () {
    let insightFacade: InsightFacade = null;
    before(function () {
        insightFacade = new InsightFacade();
        let content = readZip();
        return insightFacade.addDataset('rooms', content);
    });

    after(function () {
        return insightFacade.removeDataset('rooms');
    });

    function readZip() {
        let fs = require("fs");
        let data: string;
        try {
            data = fs.readFileSync('test/testzip/rooms.zip', {encoding: "base64"});
        } catch (err) {
            throw err;
        }
        return data;
    }

    it("Apply only case", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "maxSeats"
                ],
                "ORDER":
                    "maxSeats"
                ,
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"render":"TABLE","result":[{"maxSeats":350},{"maxSeats":375},{"maxSeats":442}]});
        }).catch(function (response: InsightResponse) {
            console.log(response.code);
            console.log(response.body);
            expect.fail('Should not happen');
        });
    });


    it("Another Count case", function () {
        let query: QueryRequest = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture",
                    "countThings"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["rooms_furniture", "countThings"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": [{
                    "countThings": {
                        "COUNT": "rooms_type"
                    }

                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{
                    "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs",
                    "countThings": 2
                }, {
                    "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs",
                    "countThings": 5
                }, {
                    "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs",
                    "countThings": 2
                }, {
                    "rooms_furniture": "Classroom-Fixed Tablets",
                    "countThings": 2
                }, {
                    "rooms_furniture": "Classroom-Hybrid Furniture",
                    "countThings": 3
                }, {
                    "rooms_furniture": "Classroom-Learn Lab",
                    "countThings": 1
                }, {
                    "rooms_furniture": "Classroom-Movable Tables & Chairs",
                    "countThings": 4
                }, {
                    "rooms_furniture": "Classroom-Movable Tablets",
                    "countThings": 2
                }, {
                    "rooms_furniture": "Classroom-Moveable Tables & Chairs",
                    "countThings": 2
                }, {"rooms_furniture": "Classroom-Moveable Tablets", "countThings": 1}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Multi Group", function () {
        let query: QueryRequest = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname", "rooms_address", "rooms_type",
                    "sumSeats"
                ],
                "ORDER": "sumSeats",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_address", "rooms_type"],
                "APPLY": [{
                    "sumSeats": {
                        "COUNT": "rooms_seats"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            //console.log(response.body);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Greater Count", function () {
        let query: QueryRequest = {
            "WHERE": {"AND": [{"IS": {"rooms_furniture": "*Tables*"}}, {"GT": {"rooms_seats": 100}}]},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_address",
                    "totalNames",
                    "avgSeats"],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["totalNames"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_address"],
                "APPLY": [{
                    "totalNames": {
                        "COUNT": "rooms_name"
                    }
                },
                    {
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    }

                ]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Apply Count", function () {
        let query: QueryRequest = {
            "WHERE": {"AND": [{"IS": {"rooms_furniture": "*Tables*"}}, {"GT": {"rooms_seats": 300}}]},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_address",
                    "totalNames",
                    "avgSeats"],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["totalNames"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_address"],
                "APPLY": [{
                    "totalNames": {
                        "COUNT": "rooms_name"
                    }
                },
                    {
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    }

                ]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{
                    "rooms_shortname": "LSC",
                    "rooms_address": "2350 Health Sciences Mall",
                    "totalNames": 2,
                    "avgSeats": 350
                }, {
                    "rooms_shortname": "HEBB",
                    "rooms_address": "2045 East Mall",
                    "totalNames": 1,
                    "avgSeats": 375
                }, {
                    "rooms_shortname": "OSBO",
                    "rooms_address": "6108 Thunderbird Boulevard",
                    "totalNames": 1,
                    "avgSeats": 442
                }]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("MultiApply", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [
                    {
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    },
                    {
                        "GT": {
                            "rooms_seats": 300
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_address",
                    "totalSeats",
                    "avgSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": [
                        "totalSeats"
                    ]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": [
                    "rooms_shortname",
                    "rooms_address"
                ],
                "APPLY": [
                    {
                        "totalSeats": {
                            "SUM": "rooms_seats"
                        }
                    },
                    {
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    }
                ]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{
                    "rooms_shortname": "LSC",
                    "rooms_address": "2350 Health Sciences Mall",
                    "totalSeats": 700,
                    "avgSeats": 350
                }, {
                    "rooms_shortname": "OSBO",
                    "rooms_address": "6108 Thunderbird Boulevard",
                    "totalSeats": 442,
                    "avgSeats": 442
                }, {"rooms_shortname": "HEBB", "rooms_address": "2045 East Mall", "totalSeats": 375, "avgSeats": 375}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Complex Sample Query A", function () {
        let query: QueryRequest = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{"rooms_shortname": "OSBO", "maxSeats": 442}, {
                    "rooms_shortname": "HEBB",
                    "maxSeats": 375
                }, {"rooms_shortname": "LSC", "maxSeats": 350}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Complex Sample Query B", function () {
        let query: QueryRequest = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "render": "TABLE",
                "result": [{"rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs"}, {"rooms_furniture": "Classroom-Fixed Tables/Movable Chairs"},
                    {"rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs"}, {"rooms_furniture": "Classroom-Fixed Tablets"},
                    {"rooms_furniture": "Classroom-Hybrid Furniture"}, {"rooms_furniture": "Classroom-Learn Lab"},
                    {"rooms_furniture": "Classroom-Movable Tables & Chairs"}, {"rooms_furniture": "Classroom-Movable Tablets"},
                    {"rooms_furniture": "Classroom-Moveable Tables & Chairs"}, {"rooms_furniture": "Classroom-Moveable Tablets"}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("Simple Room Query", function () {
        let query: QueryRequest = {
            "WHERE": {
                "NOT": {
                    "NOT": {
                        "AND": [
                            {
                                "IS": {"rooms_shortname": "ALRD"}
                            },

                            {
                                "OR": [
                                    {
                                        "IS": {"rooms_number": "3*"}
                                    },
                                    {
                                        "IS": {"rooms_number": "1*"}
                                    }]
                            },

                            {
                                "GT": {"rooms_seats": 40}
                            }
                        ]
                    }
                }
            },
            "OPTIONS": {
                "COLUMNS": ["rooms_shortname",
                    "rooms_href", "rooms_fullname",
                    "rooms_number", "rooms_address", "rooms_furniture"]
                , "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
        }).catch(function (response: InsightResponse) {
            expect.fail('Should not happen');
        });
    });

    it("all rooms for LSK", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_shortname": "LSK"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_number",
                    "rooms_furniture",
                    "rooms_lat",
                    "rooms_lon"
                ],
                "ORDER": "rooms_number",
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

    it("Sample Query A", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
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

    it("Sample Query B", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_address": "*Agrono*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
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

    it("Check dependency 424", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms1_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms2_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        };
        return insightFacade.performQuery(query).then(function (response: InsightResponse) {
            expect.fail();
        }).catch(function (response: InsightResponse) {
            expect(response.code).to.equal(424);
        });
    });

});


