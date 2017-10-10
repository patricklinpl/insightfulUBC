/**
 * Created by patricklin on 2017-03-28.
 */

 /* global $, bootbox, hide, numberDropOptions,  cssDropDown, dropDownOptions, getDistanceFromLatLonInMeter, google, generateTable, getDropDownVal, show */

'use strict'

$(function () {
  onStart().then(function () {
    $('#bName').on('selectmenuchange', function () {
      return new Promise(function (fulfill) {
        var strName = getDropDownVal('bName')
        $('#rNumber').find('option').remove().end()
        $('#rNumber').selectmenu('destroy').selectmenu({style: 'dropdown'})
        var roomNumbers = numberDropOptions('rooms_fullname', strName, 'rooms_number', '#rNumber')
        Promise.all([roomNumbers]).then(function () {
          cssDropDown('#rNumber', 'courseIDDropDown')
          fulfill()
        })
      })
    })
  }).catch(function () {
    console.log('error on start')
  })
})

function onStart () {
  return new Promise(function (fulfill) {
    hide('map')
    $('#searchRoom').trigger('reset')
    cssDropDown('#bName', 'overflow')
    cssDropDown('#rType', 'overflow')
    cssDropDown('#fType', 'overflow')
    cssDropDown('#locName', 'overflow')
    cssDropDown('#rNumber', 'courseIDDropDown')
    var bname = dropDownOptions('#bName', 'rooms_fullname')
    var locname = dropDownOptions('#locName', 'rooms_shortname')
    var rType = dropDownOptions('#rType', 'rooms_type')
    var fType = dropDownOptions('#fType', 'rooms_furniture')
    Promise.all([bname, locname, rType, fType]).then(function () {
      return fulfill()
    })
  })
}

function roomQueryController () {
  var building = getDropDownVal('bName')
  var size = document.getElementById('rSize').value
  var meter = document.getElementById('location').value
  var locName = getDropDownVal('locName')
  var roomType = getDropDownVal('rType')
  var furType = getDropDownVal('fType')

  if (checkRoomFilter(size, meter, locName)) {
    return
  }

  var rNumber = ''
  if (building !== '') {
    rNumber = getDropDownVal('rNumber')
  }

  var query = buildRoomQuery(building, size, roomType, furType, rNumber, meter, locName)

  if (meter !== '' && locName !== '') {
    var filtRoomData = []
    var filtLocLat = []
    var correctRoomData = []
    var mappingRoomData = []

    getRoomsData(query).then(function (roomData) {
      filtRoomData = roomData
      getLocForBuilding(locName).then(function (locData) {
        filtLocLat = locData
        var lat1 = filtLocLat[0]['rooms_lat']
        var lon1 = filtLocLat[0]['rooms_lon']
        for (var i = 0; i < filtRoomData.length; i++) {
          var lat2 = filtRoomData[i]['rooms_lat']
          var lon2 = filtRoomData[i]['rooms_lon']

          if (getDistanceFromLatLonInMeter(lat1, lon1, lat2, lon2) <= meter) {
            var dataToCopy = JSON.parse(JSON.stringify(filtRoomData[i]))
            var mapData = JSON.parse(JSON.stringify(filtRoomData[i]))
            mappingRoomData.push(mapData)
            delete dataToCopy['rooms_lat']
            delete dataToCopy['rooms_lon']
            correctRoomData.push(dataToCopy)
          }
        }
        if (correctRoomData.length === 0) {
          bootbox.alert({
            title: 'No Result',
            message: 'The query resulted in no entry being found.',
            backdrop: true
          })
          return
        }
        show('map')
        generateMarkers(mappingRoomData)
        generateTable(correctRoomData, 'roomResult')
      })
    }).catch(function (e) {
      bootbox.alert(e)
    })
  } else {
    hide('map')
    sendQueryWithOutDialog(query, 'roomResult')
  }
}

function checkRoomFilter (size, meter, locName) {
  var rx = new RegExp(/^\d+$/)
  if (size !== '' && size) {
    if (!rx.test(size)) {
      bootbox.alert({
        title: 'Error',
        message: 'Please use a whole number for size',
        backdrop: true
      })
      return true
    }
  }

  if (meter !== '' && meter) {
    if (!rx.test(meter)) {
      bootbox.alert({
        title: 'Error',
        message: 'Please use a whole number for meter input',
        backdrop: true
      })
      return true
    }
  }

  if (meter === '' && locName !== '') {
    bootbox.alert({
      title: 'Error',
      message: 'Please input a whole number in the meter input',
      backdrop: true
    })
    return true
  }
}

function buildRoomQuery (building, size, roomType, furType, rNumber, meter, locName) {
  var query = {
    'WHERE': {},
    'OPTIONS': {
      'COLUMNS': [
        'rooms_fullname',
        'rooms_shortname',
        'rooms_number',
        'rooms_seats',
        'rooms_type',
        'rooms_furniture'
      ],
      'ORDER': {
        'dir': 'DOWN',
        'keys': []
      },
      'FORM': 'TABLE'
    }
  }

  var whereArray = []
  var typeArray = []

  if (building !== '') {
    whereArray.push({
      'IS': {
        'rooms_fullname': building
      }
    })
  }

  if (rNumber !== '') {
    whereArray.push({
      'IS': {
        'rooms_number': rNumber
      }
    })
  }

  if (size !== '' && size && parseInt(size)) {
    whereArray.push({
      'GT': {
        'rooms_seats': parseInt(size)
      }
    })
  }

  if (roomType !== '' || furType !== '') {
    if (roomType !== '' && roomType) {
      typeArray.push({
        'IS': {
          'rooms_type': roomType
        }
      })
    }

    if (furType !== '' && furType) {
      typeArray.push({
        'IS': {
          'rooms_furniture': furType
        }
      })
    }
  }

  if (meter !== '' && locName !== '') {
    query['OPTIONS']['COLUMNS'].push('rooms_lat', 'rooms_lon')
  }

  if (typeArray.length > 1) {
    whereArray.push({
      'OR': typeArray
    })
  } else if (typeArray.length === 1) {
    whereArray.push(typeArray.pop())
  }

  if (whereArray.length > 1) {
    query['WHERE'] = {
      'AND': whereArray
    }
  } else if (whereArray.length === 1) {
    query['WHERE'] = whereArray.pop()
  }

  if (query['OPTIONS']['ORDER']['keys'].length === 0) {
    query['OPTIONS']['ORDER']['dir'] = 'UP'
    query['OPTIONS']['ORDER']['keys'].push('rooms_fullname', 'rooms_number')
  }

  return query
}

function getRoomsData (query) {
  return new Promise(function (fulfill, reject) {
    var filterRooms = []
    $.ajax({
      url: '/query',
      type: 'POST',
      data: JSON.stringify(query),
      contentType: 'application/json',
      datatType: 'json',
      success: function (data) {
        filterRooms = data['result']
      }
    }).then(function () {
      if (filterRooms.length === 0) {
        reject({
          title: 'No Result',
          message: 'The query resulted in no entry being found.',
          backdrop: true
        })
      }
      fulfill(filterRooms)
    }).catch(function () {
      reject({
        title: '400',
        message: 'Bad Request',
        backdrop: true
      })
    })
  })
}

function getLocForBuilding (locName) {
  return new Promise(function (fulfill) {
    var query = {
      'WHERE': {
        'IS': {
          'rooms_shortname': locName
        }
      },
      'OPTIONS': {
        'COLUMNS': [
          'rooms_lat',
          'rooms_lon'

        ],
        'ORDER': {
          'dir': 'DOWN',
          'keys': []
        },
        'FORM': 'TABLE'
      },
      'TRANSFORMATIONS': {
        'GROUP': ['rooms_shortname', 'rooms_lat', 'rooms_lon'],
        'APPLY': []
      }
    }
    var filterLocation = []
    $.ajax({
      url: '/query',
      type: 'POST',
      data: JSON.stringify(query),
      contentType: 'application/json',
      datatType: 'json',
      success: function (data) {
        filterLocation = data['result']
      }
    }).then(function () {
      fulfill(filterLocation)
    }).catch(function () {
      bootbox.alert({
        title: '400',
        message: 'Bad Request',
        backdrop: true
      })
    })
  })
}

function sendQueryWithOutDialog (query, classID) {
  var filterSection = []
  $.ajax({
    url: '/query',
    type: 'POST',
    data: JSON.stringify(query),
    contentType: 'application/json',
    datatType: 'json',
    success: function (data) {
      filterSection = data['result']
    }
  }).then(function () {
    if (filterSection.length === 0) {
      bootbox.alert({
        title: 'No Result',
        message: 'The query resulted in no entry being found.',
        backdrop: true
      })
      return
    }
    generateTable(filterSection, classID)
  }).catch(function () {
    bootbox.alert({
      title: '400',
      message: 'Bad Request',
      backdrop: true
    })
  })
}

function generateMarkers (mappingRoomData) {
  var results = []
  var idsSeen = {}, idSeenValue = {}
  for (var x = 0, len = mappingRoomData.length, id; x < len; ++x) {
    id = mappingRoomData[x]['rooms_shortname']
    if (idsSeen[id] !== idSeenValue) {
      results.push(mappingRoomData[x])
      idsSeen[id] = idSeenValue
    }
  }
  var locations = []
  for (var y = 0; y < results.length; y++) {
    var locationName = results[y]['rooms_fullname']
    var lat = results[y]['rooms_lat']
    var lon = results[y]['rooms_lon']
    locations.push([locationName, lat, lon])
  }

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: new google.maps.LatLng(49.2606, -123.2460),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  })

  google.maps.event.trigger(map, 'resize')

  var infowindow = new google.maps.InfoWindow()

  var marker, i

  for (i = 0; i < locations.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map
    })

    google.maps.event.addListener(marker, 'click', (function (marker, i) {
      return function () {
        infowindow.setContent(locations[i][0])
        infowindow.open(map, marker)
      }
    })(marker, i))
  }
}
