/**
 * Created by naing on 2017-03-03.
 */

import {expect} from 'chai';
import {Response} from 'restify';
import {QueryRequest} from "../src/controller/IInsightFacade";
import Server from "../src/rest/Server";


describe("RESTHandlerSpec", function () {

    var chai = require('chai'),
        chaiHttp = require('chai-http');
    chai.use(chaiHttp);

    let s = new Server(4321);
    var fs = require('fs');

    before(function () {
        s.start();
    });

    after(function () {
        s.stop();
    });

    it("Testing Echo", function () {
        return chai.request('http://localhost:4321')
            .get('/echo/Msg')
            .then(function (res: Response) {
                expect(res).to.have.status(200);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Testing get", function () {
        return chai.request('http://localhost:4321')
            .get('/')
            .then(function (res: Response) {
                expect(res).to.have.status(200);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Testing getCoursesPage", function () {
        return chai.request('http://localhost:4321')
            .get('/courses')
            .then(function (res: Response) {
                expect(res).to.have.status(200);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Testing getRoomsPage", function () {
        return chai.request('http://localhost:4321')
            .get('/rooms')
            .then(function (res: Response) {
                expect(res).to.have.status(200);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Testing getSchedulePage", function () {
        return chai.request('http://localhost:4321')
            .get('/scheduler')
            .then(function (res: Response) {
                expect(res).to.have.status(200);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    //code:204 = id is new
    //code:201 = id is already existed
    it("PUT Rooms Dataset", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/rooms')
            .attach('body',fs.readFileSync('test/testzip/rooms.zip'), 'rooms')
            .then(function (res: Response) {
                expect(res).to.have.status(204);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("PUT Courses Dataset", function () {
        return chai.request('http://localhost:4321')
            .put('/dataset/courses')
            .attach('body',fs.readFileSync('test/testzip/courses.zip'), 'courses')
            .then(function (res: Response) {
                expect(res).to.have.status(204);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Testing POST - valid query", function () {
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
        return chai.request('http://localhost:4321')
            .post('/query')
            .send(query)
            .then(function (res: Response) {
                expect(res).to.have.status(200);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Testing POST - invalid query (400)", function () {
        let query: QueryRequest = {
            "WHERE": {
                "IS": {
                    "rooms_address": 123
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        };
        return chai.request('http://localhost:4321')
            .post('/query')
            .send(query)
            .then(function (res: Response) {
                expect.fail();
            }).catch(function (err: any) {
                expect(err).to.have.status(400);
            })
    });

    it("Testing POST - multiple keys (400)", function () {
        let query: QueryRequest = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "rooms_seats": 90
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
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        return chai.request('http://localhost:4321')
            .post('/query')
            .send(query)
            .then(function (res: Response) {
                expect.fail();
            }).catch(function (err: any) {
                expect(err).to.have.status(400);
            })
    });

    it("Delete Courses Dataset", function () {
        return chai.request('http://localhost:4321')
            .del('/dataset/courses')
            .then(function (res: Response) {
                expect(res).to.have.status(204);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Delete Rooms Dataset", function () {
        return chai.request('http://localhost:4321')
            .del('/dataset/rooms')
            .then(function (res: Response) {
                expect(res).to.have.status(204);
            }).catch(function (err: any) {
                expect.fail();
            })
    });

    it("Delete Courses Dataset again", function () {
        return chai.request('http://localhost:4321')
            .del('/dataset/courses')
            .then(function (res: Response) {
                expect.fail();
            }).catch(function (err: any) {
                expect(err).to.have.status(404);
            })
    });
})
