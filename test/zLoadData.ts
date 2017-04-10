/**
 * Created by naing on 2017-03-17.
 */
import {expect} from 'chai';
import {Response} from 'restify';
import {QueryRequest} from "../src/controller/IInsightFacade";
import Server from "../src/rest/Server";


describe("LoadData", function () {

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
})
