'use strict'
var Util_1 = require('../Util')
var QueryHandler_1 = require('./QueryHandler')
var QueryValidator_1 = require('./QueryValidator')
var DataHandler_1 = require('./DataHandler')
var fs = require('fs')
var cacheCourseData = {}
var cacheCourseID = ''
var cacheRoomData = {}
var cacheRoomID = ''
var InsightFacade = (function () {
  function InsightFacade () {
    Util_1.default.trace('InsightFacadeImpl::init()')
  }
  InsightFacade.prototype.addDataset = function (id, content) {
    return new Promise(function (fulfill, reject) {
      var processData = new DataHandler_1.default()
      processData.process(id, content).then(function (JSONData) {
        if (id === 'courses') {
          cacheCourseID = id
          cacheCourseData = JSONData
        }
        if (id === 'rooms') {
          cacheRoomID = id
          cacheRoomData = JSONData
        }
        if (JSONData.length > 0) {
          if (fs.existsSync('data/' + id + '.json')) {
            fs.writeFileSync('data/' + id + '.json', JSON.stringify(JSONData))
            fulfill({ code: 201, body: {} })
          } else {
            fs.writeFileSync('data/' + id + '.json', JSON.stringify(JSONData))
            fulfill({ code: 204, body: {} })
          }
        } else {
          reject({ code: 400, body: { 'error': 'Empty Objects' } })
        }
      }).catch(function (err) {
        reject({ code: 400, body: { 'error': err } })
      })
    })
  }
  InsightFacade.prototype.removeDataset = function (id) {
    return new Promise(function (fulfill, reject) {
      if (id === 'courses') {
        cacheCourseData = {}
        cacheCourseID = ''
      } else if (id === 'rooms') {
        cacheRoomData = {}
        cacheRoomID = ''
      }
      var fs = require('fs')
      fs.unlink('data/' + id + '.json', function (err) {
        if (err) {
          reject({ code: 404, body: { 'error': err } })
        }
        fulfill({ code: 204, body: {} })
      })
    })
  }
  InsightFacade.prototype.performQuery = function (query) {
    return new Promise(function (fulfill, reject) {
      var cacheID = ''
      var cacheData = {}
      if (typeof query.WHERE === 'undefined' || typeof query.OPTIONS === 'undefined') {
        reject({ code: 400, body: { 'error': 'Query format is wrong' } })
      }
      if (query.OPTIONS.COLUMNS.length !== 0) {
        for (var i = 0; i < query.OPTIONS.COLUMNS.length; i++) {
          if (query.OPTIONS.COLUMNS[i].indexOf('_') > 0) {
            if (cacheID === '') {
              cacheID = query.OPTIONS.COLUMNS[i].split('_')[0]
            }
          }
        }
        if (cacheID === '') {
          if (typeof query.TRANSFORMATIONS !== 'undefined') {
            if (typeof query.TRANSFORMATIONS.GROUP !== 'undefined') {
              for (var i = 0; i < query.TRANSFORMATIONS.GROUP.length; i++) {
                if (query.TRANSFORMATIONS.GROUP[i].indexOf('_') > 0) {
                  if (cacheID === '') {
                    cacheID = query.TRANSFORMATIONS.GROUP[i].split('_')[0]
                  }
                }
              }
            }
          }
        }
      }
      var dataSets = []
      var validKeys = ['courses_dept', 'courses_id',
        'courses_avg', 'courses_instructor', 'courses_title',
        'courses_pass', 'courses_fail', 'courses_audit', 'courses_uuid', 'courses_year', 'courses_size',
        'rooms_lat', 'rooms_lon', 'rooms_seats', 'rooms_fullname', 'rooms_shortname', 'rooms_number',
        'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
        'rooms_href']
      if (cacheCourseID !== '') {
        dataSets.push(cacheCourseID)
      } else if (cacheCourseID === '' && fs.existsSync('data/courses.json')) {
        cacheCourseID = 'courses'
        dataSets.push(cacheCourseID)
        cacheCourseData = JSON.parse(fs.readFileSync('data/courses.json', { encoding: 'utf-8' }))
      }
      if (cacheRoomID !== '') {
        dataSets.push(cacheRoomID)
      } else if (cacheRoomID === '' && fs.existsSync('data/rooms.json')) {
        cacheRoomID = 'rooms'
        dataSets.push(cacheRoomID)
        cacheRoomData = JSON.parse(fs.readFileSync('data/rooms.json', { encoding: 'utf-8' }))
      }
      if (cacheID === 'courses' && Object.keys(cacheCourseData).length > 0) {
        cacheData = cacheCourseData
      } else if (cacheID === 'rooms' && Object.keys(cacheRoomData).length > 0) {
        cacheData = cacheRoomData
      }
      var qValidate = new QueryValidator_1.default()
      if (qValidate.validate(query)) {
        if (typeof query.WHERE === 'undefined' || typeof query.OPTIONS === 'undefined') {
          reject({ code: 400, body: { 'error': 'Query is not valid' } })
        }
        if (Object.keys(query.WHERE).length !== 0) {
          var checkEmpty = qValidate.validateEmpty(Object.keys(query.WHERE).pop(), query.WHERE)
          if (checkEmpty !== 'Passed') {
            reject({ code: 400, body: { 'error': checkEmpty } })
          }
        }
        if (query.OPTIONS.COLUMNS.length === 0) {
          reject({ code: 400, body: { 'error': 'Columns cannot be empty' } })
        }
        if (typeof query.OPTIONS.ORDER !== 'string' && typeof query.OPTIONS.ORDER !== 'undefined') {
          if (typeof query.OPTIONS.ORDER['keys'] !== 'undefined') {
            for (var _i = 0, _a = query.OPTIONS.ORDER['keys']; _i < _a.length; _i++) {
              var good = _a[_i]
              if (good.indexOf('_') < 0) {
                if (query.OPTIONS.COLUMNS.indexOf(good) < 0) {
                  reject({ code: 400, body: { 'error': 'Order key needs to be included in columns' } })
                }
              }
            }
          }
        }
        if (typeof query.TRANSFORMATIONS !== 'undefined') {
          if (typeof query.TRANSFORMATIONS.GROUP === 'undefined' || typeof query.TRANSFORMATIONS.APPLY === 'undefined') {
            reject({ code: 400, body: { 'error': 'Transformations needs to contains both GROUP and APPLY' } })
          }
        }
        var checkTransform = qValidate.validateTransform(query)
        if (checkTransform !== 'Passed') {
          reject({ code: 400, body: { 'error': checkTransform } })
        }
        var checkAgainst1 = []
        if (typeof query.TRANSFORMATIONS !== 'undefined') {
          if (typeof query.TRANSFORMATIONS.APPLY !== 'undefined') {
            for (var _b = 0, _c = query.TRANSFORMATIONS.APPLY; _b < _c.length; _b++) {
              var entry = _c[_b]
              var key = Object.keys(entry).pop()
              checkAgainst1.push(key)
            }
          }
          if (typeof query.TRANSFORMATIONS !== 'undefined') {
            if (typeof query.TRANSFORMATIONS.GROUP !== 'undefined') {
              for (var _d = 0, _e = query.TRANSFORMATIONS.GROUP; _d < _e.length; _d++) {
                var entry = _e[_d]
                if (entry.indexOf('_') >= 0) {
                  var testID = entry.split('_')[0]
                  if (testID !== cacheID) {
                    reject({ code: 400, body: { 'error': 'Query is trying to query two datasets at the same time' } })
                  }
                }
              }
            }
            if (typeof query.TRANSFORMATIONS.APPLY !== 'undefined') {
              for (var i = 0; i < query.TRANSFORMATIONS.APPLY.length; i++) {
                var myKey = Object.keys(query.TRANSFORMATIONS.APPLY[i]).pop()
                var myObj = query.TRANSFORMATIONS.APPLY[i][myKey]
                var myAppTok = Object.keys(myObj).pop()
                if (myAppTok === 'MAX' || myAppTok === 'MIN' || myAppTok === 'COUNT' || myAppTok === 'AVG' || myAppTok === 'SUM') {
                  var myAppKey = myObj[myAppTok]
                  if (myAppKey.indexOf('_') > 0) {
                    var testID = myAppKey.split('_')[0]
                    if (testID !== cacheID) {
                      reject({ code: 400, body: { 'error': 'Query is trying to query two datasets at the same time' } })
                    }
                  }
                }
              }
            }
          }
          for (var _f = 0, _g = query.OPTIONS.COLUMNS; _f < _g.length; _f++) {
            var entry = _g[_f]
            if (validKeys.indexOf(entry) < 0) {
              if (checkAgainst1.indexOf(entry) < 0) {
                reject({ code: 400, body: { 'error': entry + ' is not a valid key' } })
              }
            }
          }
          var groupApplyKeys = []
          if (typeof query.TRANSFORMATIONS.APPLY !== 'undefined') {
            for (var _h = 0, _j = query.TRANSFORMATIONS.APPLY; _h < _j.length; _h++) {
              var appKey = _j[_h]
              var key = Object.keys(appKey).pop()
              groupApplyKeys.push(key)
            }
            for (var _k = 0, _l = query.TRANSFORMATIONS.GROUP; _k < _l.length; _k++) {
              var groupKey = _l[_k]
              groupApplyKeys.push(groupKey)
            }
          }
          for (var _m = 0, _o = query.OPTIONS.COLUMNS; _m < _o.length; _m++) {
            var keys = _o[_m]
            if (groupApplyKeys.indexOf(keys) < 0) {
              reject({
                code: 400,
                body: { 'error': 'All COLUMNS keys need to be either in GROUP or in APPLY' }
              })
            }
          }
          for (var _p = 0, _q = query.TRANSFORMATIONS.GROUP; _p < _q.length; _p++) {
            var gKeys = _q[_p]
            if (validKeys.indexOf(gKeys) < 0) {
              reject({ code: 400, body: { 'error': 'Group cannot contain apply keys' } })
            }
          }
        }
        if (Object.keys(query.WHERE).length !== 0) {
          var checkDependency = qValidate.validateDependency(Object.keys(query.WHERE).pop(), query.WHERE, dataSets)
          for (var _r = 0, _s = query.OPTIONS.COLUMNS; _r < _s.length; _r++) {
            var entry = _s[_r]
            if (entry.indexOf('_') >= 0) {
              var testID = entry.split('_')[0]
              if (dataSets.indexOf(testID) === -1) {
                checkDependency.push(testID)
              }
            } else {
              if (typeof query.TRANSFORMATIONS === 'undefined') {
                if (validKeys.indexOf(entry) < 0) {
                  reject({ code: 400, body: { 'error': entry + ' is not a valid key' } })
                }
              } else {
                if (entry.indexOf('_') >= 0) {
                  var testID = entry.split('_')[0]
                  if (dataSets.indexOf(testID) === -1) {
                    checkDependency.push(testID)
                  }
                }
              }
            }
          }
          if (typeof checkDependency !== 'undefined') {
            if (checkDependency.length !== 0) {
              var newCheck = checkDependency.filter(function (a) {
                if (checkAgainst1.indexOf(a) === -1) {
                  return a
                }
              })
              if (newCheck.length > 0) {
                reject({ code: 424, body: { 'missing': checkDependency } })
              }
            }
          }
          var checkMultipleKeys = qValidate.validateMultipleKeys(Object.keys(query.WHERE).pop(), query.WHERE)
          for (var _t = 0, _u = query.OPTIONS.COLUMNS; _t < _u.length; _t++) {
            var entry = _u[_t]
            var testID = entry.split('_')[0]
            if (dataSets.indexOf(testID) === -1) {
              if (typeof checkAgainst1 !== 'undefined') {
                if (checkAgainst1.indexOf(testID) === -1) {
                  checkMultipleKeys.push(testID)
                }
              } else {
                checkMultipleKeys.push(testID)
              }
            }
          }
          if (checkMultipleKeys.length > 1) {
            reject({ code: 400, body: { 'error': 'Query is trying to query two datasets at the same time' } })
          }
        }
        var checkOption = qValidate.validateOPTIONS(query)
        if (checkOption !== 'Passed') {
          reject({ code: 400, body: { 'error': checkOption } })
        }
        if (Object.keys(query.WHERE).length !== 0) {
          if (Object.keys(query.WHERE).length !== 1) {
            reject({ code: 400, body: { 'error': 'Query Malformed' } })
          }
          var checkFilt = qValidate.validateFILTER(Object.keys(query.WHERE).pop(), query.WHERE)
          if (checkFilt !== 'Passed') {
            reject({ code: 400, body: { 'error': checkFilt } })
          }
        }
        var copyData = JSON.parse(JSON.stringify(cacheData))
        var qEngine = new QueryHandler_1.default(cacheID, copyData)
        var result = qEngine.query(cacheID, query)
        fulfill({ code: 200, body: result })
      } else {
        reject({ code: 400, body: { 'error': 'Invalid JSON: Unexpected end of JSON input' } })
      }
    })
  }
  return InsightFacade
}())
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = InsightFacade
// # sourceMappingURL=InsightFacade.js.map
