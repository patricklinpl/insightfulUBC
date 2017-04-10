/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');

import Log from "../Util";
import {InsightResponse} from "../controller/IInsightFacade";
import RESTHandler from "./RESTHandler";

/**
 * This configures the REST endpoints for the server.
 */

export default class Server {

    private port: number;
    private rest: restify.Server;

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info('Server::close()');
        let that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info('Server::start() - start');

                that.rest = restify.createServer({
                    name: 'insightUBC'
                });

                that.rest.use(restify.bodyParser({ mapParams: true, mapFiles: true }));

                that.rest.get(/\/public\/?.*/, restify.serveStatic({
                    directory: __dirname
                }));

                that.rest.get('/', RESTHandler.getIndexPage);
                that.rest.get('/courses', RESTHandler.getCoursesPage);
                that.rest.get('/rooms', RESTHandler.getRoomsPage);
                that.rest.get('/scheduler', RESTHandler.getSchedulePage);

                // provides the echo service
                // curl -is  http://localhost:4321/echo/myMessage
                that.rest.get('/echo/:msg', RESTHandler.echo);

                // Other endpoints will go here
                that.rest.put('/dataset/:id', RESTHandler.PUT);
                that.rest.del('/dataset/:id', RESTHandler.DEL);
                that.rest.post('/query', RESTHandler.POST);

                that.rest.listen(that.port, function () {
                    Log.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });

                that.rest.on('error', function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal node not using normal exceptions here
                    Log.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            } catch (err) {
                Log.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    }

    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.


    //MOVED ECHO AND PERFORM ECHO TO RESTHandler.ts


}
