/**
 * Created by naing on 2017-02-28.
 */

import restify = require('restify');
import {InsightResponse, QueryRequest} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";
import fs = require('fs');
import Log from "../Util";


export default class RESTHandler {

    private static insightFacade  = new InsightFacade();

    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            let result = RESTHandler.performEcho(req.params.msg);
            Log.info('Server::echo(..) - responding ' + result.code);
            res.json(result.code, result.body);
        } catch (err) {
            res.json(400, {error: err.message});
        }
        return next();
    }

    public static performEcho(msg: string): InsightResponse {
        if (typeof msg !== 'undefined' && msg !== null) {
            return {code: 200, body: {message: msg + '...' + msg}};
        } else {
            return {code: 400, body: {error: 'Message not provided'}};
        }
    }

    public static getIndexPage (req:restify.Request, res: restify.Response, next: restify.Next) {
        fs.readFile('./src/rest/views/index.html', function (err: any, data: any) {
            if (err) {
                next(err);
                return;
            }

            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(data);

            return next();
        });
    }

    public static getCoursesPage (req:restify.Request, res: restify.Response, next: restify.Next) {
        fs.readFile('./src/rest/views/courses.html', function (err: any, data: any) {
            if (err) {
                next(err);
                return;
            }

            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(data);

            return next();
        });
    }

    public static getRoomsPage (req:restify.Request, res: restify.Response, next: restify.Next) {
        fs.readFile('./src/rest/views/rooms.html', function (err: any, data: any) {
            if (err) {
                next(err);
                return;
            }

            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(data);

            return next();
        });
    }

    public static getSchedulePage (req:restify.Request, res: restify.Response, next: restify.Next) {
        fs.readFile('./src/rest/views/scheduler.html', function (err: any, data: any) {
            if (err) {
                next(err);
                return;
            }

            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(data);

            return next();
        });
    }


    public static PUT(req: restify.Request, res: restify.Response, next: restify.Next) {
        let content = new Buffer(req.params.body).toString('base64');
        RESTHandler.insightFacade.addDataset(req.params.id, content).then(function (result) {
            Log.info('Server::PUT(..) - responding ' + result.code);
            res.json(result.code, result.body);
        }).catch(function (err) {
            res.json(err.code, err);
        });
        return next();
    }

    //curl -X "DELETE" localhost:4321/dataset/rooms
    public static DEL(req: restify.Request, res: restify.Response, next: restify.Next) {
        RESTHandler.insightFacade.removeDataset(req.params.id).then(function (result){
            Log.info('Server::DEL(..) - responding ' + result.code);
            res.json(result.code, result.body);
        }).catch(function (err){
            Log.warn('Server::DEL(..) - responding ' + err.code);
            res.json(err.code, err);
        });
        return next();
    }


    public static POST(req: restify.Request, res: restify.Response, next: restify.Next) {
        let query: QueryRequest = req.body;
        RESTHandler.insightFacade.performQuery(query).then(function(result){
            Log.info('Server::POST(..) - responding ' + result.code);
            res.json(result.code, result.body);
        }).catch(function(err){
            Log.error('Server::POST(..) - responding ' + err.code);
            res.json(err.code, err);
        });
        return next();
    }
}
