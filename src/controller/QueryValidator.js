'use strict'
var QueryValidator = (function () {
  function QueryValidator () {
  }
  QueryValidator.prototype.validate = function (query) {
    return (query !== null && Object.keys(query).length > 0 && typeof query !== 'undefined')
  }
  QueryValidator.prototype.validateDependency = function (propName, propCallback, datasetid) {
    var missingDependecy = []
    var nestPropKey = Object.keys(propCallback[propName])
    if (propName === 'GT' || propName === 'LT' || propName === 'EQ' || propName === 'IS') {
      var testKey = nestPropKey.pop()
      if (testKey.indexOf('_') >= 0) {
        var testID = testKey.split('_')[0]
        if (datasetid.indexOf(testID) === -1) {
          missingDependecy.push(testID)
          return missingDependecy
        }
      }
      return missingDependecy
    } else if (propName === 'OR' || propName === 'AND') {
      var nestedKeys = propCallback[propName]
      if (nestedKeys.length === 0) {
        return missingDependecy
      }
      var tracker1 = []
      for (var _i = 0, nestedKeys1 = nestedKeys; _i < nestedKeys1.length; _i++) {
        var key = nestedKeys1[_i]
        var newPropName = Object.keys(key).pop()
        var validateit = this.validateDependency(newPropName, key, datasetid)
        tracker1 = tracker1.concat(validateit.filter(function (item) {
          return tracker1.indexOf(item) < 0
        }))
      }
      if (tracker1.length !== 0) {
        return tracker1
      }
    } else if (propName === 'NOT') {
      var nestedKeys = nestPropKey.pop()
      var nestedPropObj = propCallback[propName]
      var validateit = this.validateDependency(nestedKeys, nestedPropObj, datasetid)
      if (validateit.length !== 0) {
        return validateit
      }
    }
    return missingDependecy
  }
  QueryValidator.prototype.validateMultipleKeys = function (propName, propCallback) {
    var keyID = []
    var nestPropKey = Object.keys(propCallback[propName])
    if (propName === 'GT' || propName === 'LT' || propName === 'EQ' || propName === 'IS') {
      var testKey = nestPropKey.pop()
      if (testKey.indexOf('_') >= 0) {
        var testID = testKey.split('_')[0]
        if (keyID.indexOf(testID) === -1) {
          keyID.push(testID)
        }
      }
      return keyID
    } else if (propName === 'OR' || propName === 'AND') {
      var nestedKeys = propCallback[propName]
      if (nestedKeys.length === 0) {
        return keyID
      }
      var tracker2 = []
      for (var _i = 0, nestedKeys2 = nestedKeys; _i < nestedKeys2.length; _i++) {
        var key = nestedKeys2[_i]
        var newPropName = Object.keys(key).pop()
        var validateit = this.validateMultipleKeys(newPropName, key)
        tracker2 = tracker2.concat(validateit.filter(function (item) {
          return tracker2.indexOf(item) < 0
        }))
      }
      if (tracker2.length !== 0) {
        return tracker2
      }
    } else if (propName === 'NOT') {
      var nestedKeys = nestPropKey.pop()
      var nestedPropObj = propCallback[propName]
      var validateit = this.validateMultipleKeys(nestedKeys, nestedPropObj)
      if (validateit.length !== 0) {
        return validateit
      }
    }
    return keyID
  }
  QueryValidator.prototype.validateEmpty = function (propName, propCallback) {
    var nestPropKey = Object.keys(propCallback[propName])
    switch (propName) {
      case 'GT':
        if (nestPropKey.length !== 1) {
          return 'Query is incomplete'
        }
        return 'Passed'
      case 'LT':
        if (nestPropKey.length !== 1) {
          return 'Query is incomplete'
        }
        return 'Passed'
      case 'EQ':
        if (nestPropKey.length !== 1) {
          return 'Query is incomplete'
        }
        return 'Passed'
      case 'IS':
        if (nestPropKey.length !== 1) {
          return 'Query is incomplete'
        }
        return 'Passed'
      case 'NOT':
        if (nestPropKey.length !== 1) {
          return 'Query contains too many parameters'
        } else {
          var nestedKeys = nestPropKey.pop()
          var nestedPropObj = propCallback[propName]
          var validateit = this.validateEmpty(nestedKeys, nestedPropObj)
          if (validateit !== 'Passed') {
            return validateit
          }
          return 'Passed'
        }
      case 'OR':
        if (nestPropKey.length === 0) {
          return 'Invalid query: OR should have at least one condition.'
        } else {
          var nestedKeys = propCallback[propName]
          for (var _i = 0, nestedKeys3 = nestedKeys; _i < nestedKeys3.length; _i++) {
            var key = nestedKeys3[_i]
            var newPropName = Object.keys(key).pop()
            var validateit = this.validateEmpty(newPropName, key)
            if (validateit !== 'Passed') {
              return validateit
            }
          }
          return 'Passed'
        }
      case 'AND':
        if (nestPropKey.length === 0) {
          return 'Invalid query: AND should have at least one condition.'
        } else {
          var nestedKeys = propCallback[propName]
          for (var _a = 0, nestedKeys4 = nestedKeys; _a < nestedKeys4.length; _a++) {
            var key = nestedKeys4[_a]
            var newPropName = Object.keys(key).pop()
            var validateit = this.validateEmpty(newPropName, key)
            if (validateit !== 'Passed') {
              return validateit
            }
          }
          return 'Passed'
        }
    }
  }
  QueryValidator.prototype.validateFILTER = function (propName, propCallback) {
    var nestPropKey = Object.keys(propCallback[propName])
    var propertyValue = propCallback[propName][nestPropKey[0]]
    switch (propName) {
      case 'GT':
        if (nestPropKey.length !== 1) {
          return 'Query contains too many parameters'
        }
        if (typeof propertyValue !== 'number') {
          return 'Invalid query: GT value should be a number.'
        }
        if (['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_year', 'courses_size', 'rooms_lat',
          'rooms_lon', 'rooms_seats'].indexOf(nestPropKey.pop()) < 0) {
          return 'Invalid query: GT requires a number key'
        }
        return 'Passed'
      case 'LT':
        if (nestPropKey.length !== 1) {
          return 'Query contains too many parameters'
        }
        if (typeof propertyValue !== 'number') {
          return 'Invalid query: LT value should be a number.'
        }
        if (['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_year', 'courses_size', 'rooms_lat',
          'rooms_lon', 'rooms_seats'].indexOf(nestPropKey.pop()) < 0) {
          return 'Invalid query: LT requires a number key'
        }
        return 'Passed'
      case 'EQ':
        if (nestPropKey.length !== 1) {
          return 'Query contains too many parameters'
        }
        if (typeof propertyValue !== 'number') {
          return 'Invalid query: EQ value should be a number.'
        }
        if (['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_year', 'courses_size', 'rooms_lat',
          'rooms_lon', 'rooms_seats'].indexOf(nestPropKey.pop()) < 0) {
          return 'Invalid query: EQ requires a number key'
        }
        return 'Passed'
      case 'IS':
        if (nestPropKey.length !== 1) {
          return 'Query contains too many parameters'
        }
        if (typeof propertyValue !== 'string') {
          return 'Invalid query: IS value should be a string'
        }
        if (['courses_dept', 'courses_id', 'courses_instructor', 'courses_title',
          'courses_uuid', 'rooms_fullname', 'rooms_shortname', 'rooms_number',
          'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
          'rooms_href'].indexOf(nestPropKey.pop()) < 0) {
          return 'Invalid query: IS requires a string key'
        }
        return 'Passed'
      case 'NOT':
        if (nestPropKey.length !== 1) {
          return 'Query contains too many parameters'
        } else {
          var nestedKeys = nestPropKey.pop()
          var nestedPropObj = propCallback[propName]
          var validateit = this.validateFILTER(nestedKeys, nestedPropObj)
          if (validateit !== 'Passed') {
            return validateit
          }
          return 'Passed'
        }
      case 'OR':
        if (nestPropKey.length === 0) {
          return 'Invalid query: OR should have at least one condition.'
        } else {
          var nestedKeys = propCallback[propName]
          for (var _i = 0, nestedKeys5 = nestedKeys; _i < nestedKeys5.length; _i++) {
            var key = nestedKeys5[_i]
            var newPropName = Object.keys(key).pop()
            var validateit = this.validateFILTER(newPropName, key)
            if (validateit !== 'Passed') {
              return validateit
            }
          }
          return 'Passed'
        }
      case 'AND':
        if (nestPropKey.length === 0) {
          return 'Invalid query: AND should have at least one condition.'
        } else {
          var nestedKeys = propCallback[propName]
          for (var _a = 0, nestedKeys6 = nestedKeys; _a < nestedKeys6.length; _a++) {
            var key = nestedKeys6[_a]
            var newPropName = Object.keys(key).pop()
            var validateit = this.validateFILTER(newPropName, key)
            if (validateit !== 'Passed') {
              return validateit
            }
          }
          return 'Passed'
        }
    }
  }
  QueryValidator.prototype.validateOPTIONS = function (query) {
    var validKeys = ['courses_dept', 'courses_id',
      'courses_avg', 'courses_instructor', 'courses_title',
      'courses_pass', 'courses_fail', 'courses_audit', 'courses_uuid', 'courses_year', 'courses_size',
      'rooms_lat', 'rooms_lon', 'rooms_seats', 'rooms_fullname', 'rooms_shortname', 'rooms_number',
      'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
      'rooms_href']
    if (query.OPTIONS.COLUMNS.length === 0) {
      return 'Columns cannot be empty'
    }
    if (typeof query.TRANSFORMATIONS !== 'undefined') {
      if (typeof query.TRANSFORMATIONS.APPLY !== 'undefined') {
        for (var _i = 0, _a = query.TRANSFORMATIONS.APPLY; _i < _a.length; _i++) {
          var entry = _a[_i]
          var key = Object.keys(entry).pop()
          validKeys.push(key)
        }
      }
    }
    for (var _b = 0, _c = query.OPTIONS.COLUMNS; _b < _c.length; _b++) {
      var entry = _c[_b]
      if (validKeys.indexOf(entry) < 0) {
        return 'Query is not valid'
      }
    }
    if (query.OPTIONS.FORM !== 'TABLE') {
      return 'Query is not valid'
    }
    if (typeof query.OPTIONS.ORDER !== 'undefined') {
      if (typeof query.OPTIONS.ORDER === 'string') {
        if (validKeys.indexOf(query.OPTIONS.ORDER) < 0 ||
                    query.OPTIONS.COLUMNS.indexOf(query.OPTIONS.ORDER) < 0) {
          return 'Query is not valid'
        }
      } else {
        if (typeof query.OPTIONS.ORDER['dir'] === 'undefined' ||
                    typeof query.OPTIONS.ORDER['keys'] === 'undefined') {
          return 'Options order not valid'
        }
        var dirToken = ['UP', 'DOWN']
        if (dirToken.indexOf(query.OPTIONS.ORDER['dir']) < 0) {
          return 'Order direction not valid'
        }
        var validOrderKeys = query.OPTIONS.ORDER['keys']
        for (var _d = 0, validOrderKeys1 = validOrderKeys; _d < validOrderKeys1.length; _d++) {
          var validKey = validOrderKeys1[_d]
          if (query.OPTIONS.COLUMNS.indexOf(validKey) === -1) {
            return 'Order key needs to be included in columns'
          }
        }
      }
    }
    return 'Passed'
  }
  QueryValidator.prototype.validateTransform = function (query) {
    if (typeof query.TRANSFORMATIONS === 'undefined') {
      return 'Passed'
    } else {
      if (query.TRANSFORMATIONS.GROUP.length === 0) {
        return 'Group cannot be empty'
      }
      if (query.TRANSFORMATIONS.APPLY.length === 0) {
        return 'Passed'
      }
      var checkDup = []
      for (var et = 0; et < query.TRANSFORMATIONS.APPLY.length; et++) {
        var apppkey = Object.keys(query.TRANSFORMATIONS.APPLY[et]).pop()
        checkDup.push(apppkey)
      }
      if (hasDuplicates(checkDup)) {
        return 'Duplicate apply key'
      }
      for (var ent = 0; ent < query.TRANSFORMATIONS.APPLY.length; ent++) {
        var apppkey = Object.keys(query.TRANSFORMATIONS.APPLY[ent])
        if (apppkey.length === 0) {
          return 'Malformed apply'
        }
        var nextkey = Object.keys(query.TRANSFORMATIONS.APPLY[ent][apppkey.pop()])
        if (nextkey.length === 0) {
          return 'Malformed apply'
        }
      }
      var tokens = ['MAX', 'MIN', 'AVG', 'COUNT', 'SUM']
      var numfields = ['MAX', 'MIN', 'AVG', 'SUM']
      var numKeys = ['courses_avg', 'courses_pass', 'courses_fail', 'courses_audit', 'courses_year', 'courses_size',
        'rooms_lat', 'rooms_lon', 'rooms_seats']
      var validKeys = ['courses_dept', 'courses_id',
        'courses_avg', 'courses_instructor', 'courses_title',
        'courses_pass', 'courses_fail', 'courses_audit', 'courses_uuid', 'courses_year', 'courses_size',
        'rooms_lat', 'rooms_lon', 'rooms_seats', 'rooms_fullname', 'rooms_shortname', 'rooms_number',
        'rooms_name', 'rooms_address', 'rooms_type', 'rooms_furniture',
        'rooms_href']
      var applyKeys = []
      for (var y = 0; y < query.TRANSFORMATIONS.APPLY.length; y++) {
        applyKeys.push(Object.keys(query.TRANSFORMATIONS.APPLY[y])[0])
      }
      for (var _i = 0, applyKeys1 = applyKeys; _i < applyKeys1.length; _i++) {
        var entry = applyKeys1[_i]
        if (entry.indexOf('_') > -1) {
          return "Apply keys cannot contain '_'"
        }
      }
      for (var i = 0; i < query.TRANSFORMATIONS.APPLY.length; i++) {
        var appkey = Object.keys(query.TRANSFORMATIONS.APPLY[i])[0]
        var app = query.TRANSFORMATIONS.APPLY[i][appkey]
        var appToken = Object.keys(app)[0]
        var appTokenVal = app[appToken]
        if (tokens.indexOf(appToken) < 0) {
          return 'Apply token not recognized'
        } else {
          if (appToken === 'COUNT') {
            if (validKeys.indexOf(appTokenVal) < 0) {
              return appTokenVal + ' is not a valid key'
            }
          }
        }
        if (numfields.indexOf(appToken) >= 0) {
          if (numKeys.indexOf(appTokenVal) < 0) {
            if (appToken === 'MAX') {
              return 'Max supports only numerical values'
            } else if (appToken === 'MIN') {
              return 'Min supports only numerical values'
            } else if (appToken === 'AVG') {
              return 'Avg supports only numerical values'
            } else if (appToken === 'SUM') {
              return 'Sum supports only numerical values'
            }
          }
        }
      }
      return 'Passed'
    }
  }
  return QueryValidator
}())
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = QueryValidator
function hasDuplicates (array) {
  return (new Set(array)).size !== array.length
}
;
// # sourceMappingURL=QueryValidator.js.map
