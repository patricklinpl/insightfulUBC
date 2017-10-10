'use strict'
var restify = require('restify')
var Util_1 = require('../Util')
var RESTHandler_1 = require('./RESTHandler')
var Server = (function () {
  function Server (port) {
    Util_1.default.info('Server::<init>( ' + port + ' )')
    this.port = port
  }
  Server.prototype.stop = function () {
    Util_1.default.info('Server::close()')
    var that = this
    return new Promise(function (fulfill) {
      that.rest.close(function () {
        fulfill(true)
      })
    })
  }
  Server.prototype.start = function () {
    var that = this
    return new Promise(function (fulfill, reject) {
      try {
        Util_1.default.info('Server::start() - start')
        that.rest = restify.createServer({
          name: 'insightUBC'
        })
        that.rest.use(restify.bodyParser({ mapParams: true, mapFiles: true }))
        that.rest.get(/\/public\/?.*/, restify.serveStatic({
          directory: __dirname
        }))
        that.rest.get('/', RESTHandler_1.default.getIndexPage)
        that.rest.get('/courses', RESTHandler_1.default.getCoursesPage)
        that.rest.get('/rooms', RESTHandler_1.default.getRoomsPage)
        that.rest.get('/scheduler', RESTHandler_1.default.getSchedulePage)
        that.rest.get('/echo/:msg', RESTHandler_1.default.echo)
        that.rest.put('/dataset/:id', RESTHandler_1.default.PUT)
        that.rest.del('/dataset/:id', RESTHandler_1.default.DEL)
        that.rest.post('/query', RESTHandler_1.default.POST)
        that.rest.listen(that.port, function () {
          Util_1.default.info('Server::start() - restify listening: ' + that.rest.url)
          fulfill(true)
        })
        that.rest.on('error', function (err) {
          Util_1.default.info('Server::start() - restify ERROR: ' + err)
          reject(err)
        })
      } catch (err) {
        Util_1.default.error('Server::start() - ERROR: ' + err)
        reject(err)
      }
    })
  }
  return Server
}())
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = Server
// # sourceMappingURL=Server.js.map
