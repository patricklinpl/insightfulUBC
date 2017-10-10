'use strict'
var Util_1 = require('../Util')
var JSZip = require('jszip')
var fs = require('fs')
var parse5 = require('parse5')
var http = require('http')
var DataHandler = (function () {
  function DataHandler () {
    Util_1.default.info('DataHandler::init()')
  }
  DataHandler.prototype.process = function (id, content) {
    return new Promise(function (fulfill, reject) {
      var zip = new JSZip()
      var files = []
      var parsedFiles = []
      var JSONData
      zip.loadAsync(content, { base64: true }).then(function () {
        for (var filename in zip.files) {
          files.push(zip.files[filename].async('string'))
        }
        var dir = './data'
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir)
        }
        Promise.all(files).then(function (contentData) {
          if (id === 'courses') {
            parsedFiles = JSONParser(id, contentData)
            JSONData = JSON.parse('[' + parsedFiles + ']')
            fulfill(JSONData)
          }
          if (id === 'rooms') {
            HTMLParser(id, contentData).then(function (result) {
              var roomsData = JSON.parse('[' + result.pop() + ']')
              var validShortNames = result.pop()
              var validRooms = JSON.parse('[' + result.pop() + ']')
              Promise.all(validRooms.map(getLocation)).then(function () {
                JSONData = []
                for (var i = 0; i < roomsData.length; i++) {
                  if (validShortNames.indexOf(roomsData[i].rooms_shortname) !== -1) {
                    JSONData.push(roomsData[i])
                  }
                }
                for (var _i = 0, validRooms_1 = validRooms; _i < validRooms_1.length; _i++) {
                  var room = validRooms_1[_i]
                  for (var _a = 0, JSONData_1 = JSONData; _a < JSONData_1.length; _a++) {
                    var entry = JSONData_1[_a]
                    if (room.rooms_shortname === entry.rooms_shortname) {
                      entry.rooms_lat = room.rooms_lat
                      entry.rooms_lon = room.rooms_lon
                    }
                  }
                }
                var index = JSONData.length - 1
                while (index >= 0) {
                  if (JSON.stringify(JSONData[index].rooms_lat) === JSON.stringify({}) ||
                                        JSON.stringify(JSONData[index].rooms_lon) === JSON.stringify({})) {
                    JSONData.splice(index, 1)
                  }
                  index -= 1
                }
                fulfill(JSONData)
              }).catch(function (err) {
                reject({ code: 400, body: { 'error': err } })
              })
            }).catch(function (err) {
              reject({ code: 400, body: { 'error': err } })
            })
          }
        }).catch(function (err) {
          reject({ code: 400, body: { 'error': err } })
        })
      }).catch(function (err) {
        reject({ code: 400, body: { 'error': err } })
      })
    })
  }
  return DataHandler
}())
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = DataHandler
function JSONParser (id, contentData) {
  var parsedFiles = []
  for (var i = 0; i < contentData.length; i++) {
    try {
      var JSONfile = JSON.parse(contentData[i]
                .split('"Subject"').join('"' + id + '_dept"')
                .split('"Course"').join('"' + id + '_id"')
                .split('"Avg"').join('"' + id + '_avg"')
                .split('"Professor"').join('"' + id + '_instructor"')
                .split('"Title"').join('"' + id + '_title"')
                .split('"Pass"').join('"' + id + '_pass"')
                .split('"Fail"').join('"' + id + '_fail"')
                .split('"Audit"').join('"' + id + '_audit"')
                .split('"id"').join('"' + id + '_uuid"')
                .split('"Year"').join('"' + id + '_year"')
                .split('"Enrolled"').join('"' + id + '_size"'))
      for (var department in JSONfile) {
        if (department === 'result' && JSONfile[department] !== '') {
          for (var course in JSONfile[department]) {
            for (var key in JSONfile[department][course]) {
              if (key === 'courses_uuid') {
                JSONfile[department][course].courses_uuid = String(JSONfile[department][course].courses_uuid)
              }
              if (key === 'courses_year') {
                JSONfile[department][course].courses_year = parseInt(JSONfile[department][course].courses_year)
              }
              if (key === 'courses_size') {
                JSONfile[department][course].courses_size = JSONfile[department][course].courses_pass + JSONfile[department][course].courses_fail
              }
              if (key === 'Section') {
                if (JSONfile[department][course].Section === 'overall') {
                  JSONfile[department][course].courses_year = 1900
                }
              }
            }
          }
          parsedFiles.push(JSON.stringify(JSONfile[department]).slice(1, -1))
        }
      }
    } catch (e) {
    }
  }
  return parsedFiles
}
function HTMLParser (id, contentData) {
  return new Promise(function (resolve, reject) {
    var rooms = []
    var index = []
    var validShortNames = []
    var Readable = require('stream').Readable
    var _loop_1 = function (i) {
      try {
        var parser = new parse5.SAXParser()
        var s = new Readable()
        s.push(contentData[i])
        s.push(null)
        var fullNameCounter1 = -1
        var numberCounter1 = -1
        var addressCounter1 = -1
        var seatsCounter1 = -1
        var typeCounter1 = -1
        var furnitureCounter1 = -1
        var indexNameCounter1 = -1
        var indexAddCounter1 = -1
        var validIndex1 = 0
        var validRoom1 = 0
        var roomsFullName1
        var roomsShortName1
        var roomsNumber1
        var roomsAddress1
        var roomsSeats1
        var roomsType1
        var roomsFurniture1
        var roomsHref1
        var indexName1
        var indexAddress1
        parser.on('startTag', function (tagName, attrs) {
          if (tagName === 'h2') {
            if (attrs.length === 0) {
              fullNameCounter1++
            }
          }
          if (tagName === 'link') {
            if (attrs.length === 2) {
              if (attrs[0].value === 'canonical' && attrs[1].name === 'href') {
                roomsShortName1 = attrs[1].value
                validRoom1++
              }
            }
          }
          if (tagName === 'a') {
            if (attrs.length === 2) {
              if (attrs[1].name === 'title') {
                if (attrs[1].value === 'Room Details') {
                  numberCounter1++
                  roomsHref1 = attrs[0].value
                  validRoom1++
                }
              }
            }
          }
          if (tagName === 'div') {
            if (attrs.length === 1) {
              if (attrs[0].value === 'field-content') {
                addressCounter1++
              }
            }
          }
          if (tagName === 'td') {
            if (attrs.length === 1) {
              if (attrs[0].value === 'views-field views-field-field-room-capacity') {
                seatsCounter1++
              }
              if (attrs[0].value === 'views-field views-field-field-room-type') {
                typeCounter1++
              }
              if (attrs[0].value === 'views-field views-field-field-room-furniture') {
                furnitureCounter1++
              }
              if (attrs[0].value === 'views-field views-field-field-building-code') {
                indexNameCounter1++
              }
              if (attrs[0].value === 'views-field views-field-field-building-address') {
                indexAddCounter1++
              }
            }
          }
        })
        parser.on('text', function (text) {
          if (indexNameCounter1 === 0) {
            indexName1 = text.trim()
            indexNameCounter1++
            validIndex1++
          }
          if (indexAddCounter1 === 0) {
            indexAddress1 = text.trim()
            indexAddCounter1++
            validIndex1++
          }
          if (fullNameCounter1 === 0) {
            roomsFullName1 = text.toString()
            fullNameCounter1++
            validRoom1++
          }
          if (numberCounter1 === 0) {
            roomsNumber1 = text.toString()
            numberCounter1++
            validRoom1++
          }
          if (addressCounter1 === 0) {
            roomsAddress1 = text.toString()
            addressCounter1++
            validRoom1++
          }
          if (seatsCounter1 === 0) {
            roomsSeats1 = parseInt(text.trim())
            seatsCounter1++
            validRoom1++
          }
          if (typeCounter1 === 0) {
            roomsType1 = text.trim().toString()
            typeCounter1++
            validRoom1++
          }
          if (furnitureCounter1 === 0) {
            roomsFurniture1 = text.trim().toString()
            furnitureCounter1++
            validRoom1++
          }
        })
        parser.on('endTag', function (text) {
          if (text === 'tr') {
            if (validIndex1 === 2) {
              validIndex1 = 0
              indexNameCounter1 = -1
              indexAddCounter1 = -1
              var room = {
                'rooms_shortname': indexName1,
                'rooms_address': indexAddress1,
                'rooms_lat': {},
                'rooms_lon': {}
              }
              validShortNames.push(indexName1)
              index.push(JSON.stringify(room))
            }
            if (validRoom1 === 8) {
              validRoom1 = 3
              numberCounter1 = -1
              seatsCounter1 = -1
              typeCounter1 = -1
              furnitureCounter1 = -1
              var room = (_a = {},
                                _a[id.concat('_fullname')] = roomsFullName1,
                                _a[id.concat('_shortname')] = roomsShortName1,
                                _a[id.concat('_number')] = roomsNumber1,
                                _a[id.concat('_name')] = roomsShortName1 + '_' + roomsNumber1,
                                _a[id.concat('_address')] = roomsAddress1,
                                _a[id.concat('_lat')] = {},
                                _a[id.concat('_lon')] = {},
                                _a[id.concat('_seats')] = roomsSeats1,
                                _a[id.concat('_type')] = roomsType1,
                                _a[id.concat('_furniture')] = roomsFurniture1,
                                _a[id.concat('_href')] = roomsHref1,
                                _a)
              rooms.push(JSON.stringify(room))
            }
          }
          var _a
        })
        s.on('end', function () {
          var result = []
          result.push(index)
          result.push(validShortNames)
          result.push(rooms)
          resolve(result)
        })
        s.pipe(parser)
      } catch (e) {
        reject(e)
      }
    }
    for (var i = 0; i < contentData.length; i++) {
      _loop_1(i)
    }
  })
}
function getLocation (room) {
  return new Promise(function (resolve, reject) {
    var URL = 'http://skaha.cs.ubc.ca:11316/api/v1/team17/' + encodeURIComponent(room.rooms_address)
    getLatLon(URL).then(function (latLon) {
      if (latLon.hasOwnProperty('lat') && latLon.hasOwnProperty('lon')) {
        room.rooms_lat = latLon.lat
        room.rooms_lon = latLon.lon
        resolve()
      }
    }).catch(function (e) {
      reject(e)
    })
  })
}
function getLatLon (URL) {
  return new Promise(function (resolve, reject) {
    http.get(URL, function (res) {
      var statusCode = res.statusCode
      var contentType = res.headers['content-type']
      var error
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                    ('Status Code: ' + statusCode))
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                    ('Expected application/json but received ' + contentType))
      }
      if (error) {
        console.log(error.message)
        res.resume()
        return
      }
      res.setEncoding('utf8')
      var rawData = ''
      res.on('data', function (chunk) { return rawData += chunk })
      res.on('end', function () {
        try {
          resolve(JSON.parse(rawData))
        } catch (e) {
          console.log(e.message)
        }
      })
    }).on('error', function (e) {
      reject(e)
    })
  })
}
// # sourceMappingURL=DataHandler.js.map
