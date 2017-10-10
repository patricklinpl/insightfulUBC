'use strict'
var InsightFacade_1 = require('../controller/InsightFacade')
var fs = require('fs')
var Util_1 = require('../Util')
var RESTHandler = (function () {
  function RESTHandler () {
  }
  RESTHandler.echo = function (req, res, next) {
    Util_1.default.trace('Server::echo(..) - params: ' + JSON.stringify(req.params))
    try {
      var result = RESTHandler.performEcho(req.params.msg)
      Util_1.default.info('Server::echo(..) - responding ' + result.code)
      res.json(result.code, result.body)
    } catch (err) {
      res.json(400, { error: err.message })
    }
    return next()
  }
  RESTHandler.performEcho = function (msg) {
    if (typeof msg !== 'undefined' && msg !== null) {
      return { code: 200, body: { message: msg + '...' + msg } }
    } else {
      return { code: 400, body: { error: 'Message not provided' } }
    }
  }
  RESTHandler.getIndexPage = function (req, res, next) {
    fs.readFile('./src/rest/views/index.html', function (err, data) {
      if (err) {
        next(err)
        return
      }
      res.setHeader('Content-Type', 'text/html')
      res.writeHead(200)
      res.end(data)
      return next()
    })
  }
  RESTHandler.getCoursesPage = function (req, res, next) {
    fs.readFile('./src/rest/views/courses.html', function (err, data) {
      if (err) {
        next(err)
        return
      }
      res.setHeader('Content-Type', 'text/html')
      res.writeHead(200)
      res.end(data)
      return next()
    })
  }
  RESTHandler.getRoomsPage = function (req, res, next) {
    fs.readFile('./src/rest/views/rooms.html', function (err, data) {
      if (err) {
        next(err)
        return
      }
      res.setHeader('Content-Type', 'text/html')
      res.writeHead(200)
      res.end(data)
      return next()
    })
  }
  RESTHandler.getSchedulePage = function (req, res, next) {
    fs.readFile('./src/rest/views/scheduler.html', function (err, data) {
      if (err) {
        next(err)
        return
      }
      res.setHeader('Content-Type', 'text/html')
      res.writeHead(200)
      res.end(data)
      return next()
    })
  }
  RESTHandler.PUT = function (req, res, next) {
    var content = new Buffer(req.params.body).toString('base64')
    RESTHandler.insightFacade.addDataset(req.params.id, content).then(function (result) {
      Util_1.default.info('Server::PUT(..) - responding ' + result.code)
      res.json(result.code, result.body)
    }).catch(function (err) {
      res.json(err.code, err)
    })
    return next()
  }
  RESTHandler.DEL = function (req, res, next) {
    RESTHandler.insightFacade.removeDataset(req.params.id).then(function (result) {
      Util_1.default.info('Server::DEL(..) - responding ' + result.code)
      res.json(result.code, result.body)
    }).catch(function (err) {
      Util_1.default.warn('Server::DEL(..) - responding ' + err.code)
      res.json(err.code, err)
    })
    return next()
  }
  RESTHandler.POST = function (req, res, next) {
    var query = req.body
    RESTHandler.insightFacade.performQuery(query).then(function (result) {
      Util_1.default.info('Server::POST(..) - responding ' + result.code)
      res.json(result.code, result.body)
    }).catch(function (err) {
      Util_1.default.error('Server::POST(..) - responding ' + err.code)
      res.json(err.code, err)
    })
    return next()
  }
  return RESTHandler
}())
RESTHandler.insightFacade = new InsightFacade_1.default()
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = RESTHandler
// # sourceMappingURL=RESTHandler.js.map
