/**
 * Created by patricklin on 2017-03-15.
 */

/* global $, bootbox, hide, numberDropOptions,  cssDropDown, dropDownOptions, sendQuery, getDropDownVal, show, CanvasJS */

'use strict'

$(function () {
  var dialog = bootbox.dialog({message: '<div class="text-center"><i class="fa fa-refresh fa-spin fa-1x fa-fw"></i> Loading...</div>'})
  onStart().then(function () {
    dialog.modal('hide')
    $('#deptName').on('selectmenuchange', function () {
      return new Promise(function (fulfill) {
        var dialog = bootbox.dialog({message: '<div class="text-center"><i class="fa fa-refresh fa-spin fa-1x fa-fw"></i> Loading...</div>'})
        var strName = getDropDownVal('deptName')
        $('#courseID').find('option').remove().end()
        $('#courseID').selectmenu('destroy').selectmenu({style: 'dropdown'})
        var courseNumbers = numberDropOptions('courses_dept', strName, 'courses_id', '#courseID')
        Promise.all([courseNumbers]).then(function () {
          cssDropDown('#courseID', 'courseIDDropDown')
          dialog.modal('hide')
          fulfill()
        })
      })
    })
    $('#cDeptName').on('selectmenuchange', function () {
      return new Promise(function (fulfill) {
        var dialog = bootbox.dialog({message: '<div class="text-center"><i class="fa fa-refresh fa-spin fa-1x fa-fw"></i> Loading...</div>'})
        var strName = getDropDownVal('cDeptName')
        $('#ccourseID').find('option').remove().end()
        $('#ccourseID').selectmenu('destroy').selectmenu({style: 'dropdown'})
        var courseNumbers = numberDropOptions('courses_dept', strName, 'courses_id', '#ccourseID')
        Promise.all([courseNumbers]).then(function () {
          cssDropDown('#ccourseID', 'courseIDDropDown')
          dialog.modal('hide')
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
    hide('chartContainer')
    $('input[type=checkbox]').each(function () {
      this.checked = false
    })
    $('#searchCourses').trigger('reset')
    $('#searchSection').trigger('reset')
    $('#tabs').tabs()
    cssDropDown('#equation', 'equationDropDown')
    cssDropDown('#sequation', 'equationDropDown')
    cssDropDown('#deptName', 'overflow')
    cssDropDown('#cDeptName', 'overflow')
    cssDropDown('#courseID', 'courseIDDropDown')
    cssDropDown('#ccourseID', 'courseIDDropDown')
    var secDeptName = dropDownOptions('#deptName', 'courses_dept')
    var cDeptName = dropDownOptions('#cDeptName', 'courses_dept')
    Promise.all([secDeptName, cDeptName]).then(function () {
      return fulfill()
    })
  })
}

function sectionQueryController () {
  var dialog = bootbox.dialog({message: '<div class="text-center"><i class="fa fa-refresh fa-spin fa-1x fa-fw"></i> Loading...</div>'})
  var dept = getDropDownVal('deptName')
  var title = document.getElementById('stitle').value
  var size = document.getElementById('ssize').value
  var prof = document.getElementById('prof').value
  var makeChart = 0
  hide('chartContainer')

  if (checkSectionFilter(dept, prof, title, size, dialog)) {
    return
  }

  var cID = ''
  if (dept !== '') {
    cID = getDropDownVal('courseID')
  }

  var query = buildSectionQuery(dept, cID, prof, title, size)

  if (dept !== '' && cID !== '' && document.getElementById('secAvg').checked) {
    makeChart = 1
  }

  sendQuery(query, dialog, 'courseResult', makeChart)
}

function checkSectionFilter (dept, prof, title, size, dialog) {
  if (size !== '' && size) {
    var rx = new RegExp(/^\d+$/)
    if (!rx.test(size)) {
      dialog.modal('hide')
      $('#ssize').val('')
      bootbox.alert({
        title: 'Error',
        message: 'Please use a whole number for size',
        backdrop: true
      })
      return true
    }
  }

  if (dept === '' && prof === '' &&
        title === '' && size === '') {
    dialog.modal('hide')
    bootbox.alert({
      title: 'Error',
      message: 'Please specify a filtering option',
      backdrop: true
    })
    return true
  } else {
    return false
  }
}

function buildSectionQuery (dept, cID, prof, title, size) {
  var query = {
    'WHERE': {},
    'OPTIONS': {
      'COLUMNS': [
        'courses_dept',
        'courses_id',
        'courses_title',
        'courses_instructor',
        'courses_size',
        'courses_year'
      ],
      'ORDER': {
        'dir': 'DOWN',
        'keys': []
      },
      'FORM': 'TABLE'

    },
    'TRANSFORMATIONS': {
      'GROUP': ['courses_dept', 'courses_id',
        'courses_title', 'courses_instructor',
        'courses_size',
        'courses_year'],
      'APPLY': []
    }
  }

  var whereArray = []

  if (dept !== '') {
    whereArray.push({
      'IS': {
        'courses_dept': dept
      }
    })
  }

  if (cID !== '') {
    whereArray.push({
      'IS': {
        'courses_id': cID
      }
    })
  }

  if (prof !== '' && prof) {
    whereArray.push({
      'IS': {
        'courses_instructor': '*' + prof + '*'
      }
    })
  }

  if (title !== '' && title) {
    whereArray.push({
      'IS': {
        'courses_title': '*' + title + '*'
      }
    })
  }

  if (size !== '' && size && parseInt(size)) {
    var e = document.getElementById('sequation')
    var eq = e.options[e.selectedIndex].value

    query['OPTIONS']['COLUMNS'].push('courses_size')
    query['TRANSFORMATIONS']['GROUP'].push('courses_size')

    if (eq === '=') {
      whereArray.push({
        'EQ': {
          'courses_size': parseInt(size)
        }
      })
    } else if (eq === '>') {
      whereArray.push({
        'GT': {
          'courses_size': parseInt(size)
        }
      })
    } else if (eq === '<') {
      whereArray.push({
        'LT': {
          'courses_size': parseInt(size)
        }
      })
    }
  }

  if (whereArray.length > 1) {
    query['WHERE'] = {
      'AND': whereArray
    }
  } else if (whereArray.length === 1) {
    query['WHERE'] = whereArray.pop()
  }

  if (document.getElementById('secAvg').checked) {
    query['OPTIONS']['ORDER']['dir'] = 'DOWN'
    query['OPTIONS']['COLUMNS'].push('average')
    query['OPTIONS']['ORDER']['keys'].push('average')
    query['TRANSFORMATIONS']['APPLY'].push(
      {
        'average': {
          'AVG': 'courses_avg'
        }
      }
        )
  }

  if (document.getElementById('secPass').checked) {
    query['OPTIONS']['COLUMNS'].push('maxPass')
    query['OPTIONS']['ORDER']['keys'].push('maxPass')
    query['TRANSFORMATIONS']['APPLY'].push(
      {
        'maxPass': {
          'MAX': 'courses_pass'
        }
      }
        )
  }

  if (document.getElementById('secFail').checked) {
    query['OPTIONS']['COLUMNS'].push('maxFail')
    query['OPTIONS']['ORDER']['keys'].push('maxFail')
    query['TRANSFORMATIONS']['APPLY'].push(
      {
        'maxFail': {
          'MAX': 'courses_fail'
        }
      }
        )
  }

  if (document.getElementById('secSize').checked) {
    query['OPTIONS']['ORDER']['dir'] = 'DOWN'
    query['OPTIONS']['ORDER']['keys'].push('courses_size')
  }

  if (query['OPTIONS']['ORDER']['keys'].length === 0) {
    query['OPTIONS']['ORDER']['dir'] = 'UP'
    query['OPTIONS']['ORDER']['keys'].push('courses_id')
  }

  return query
}

function courseQueryController () {
  var dialog = bootbox.dialog({message: '<div class="text-center"><i class="fa fa-refresh fa-spin fa-1x fa-fw"></i> Loading...</div>'})
  var dept = getDropDownVal('cDeptName')
  var title = document.getElementById('title').value
  var size = document.getElementById('size').value
  var num = 0
  hide('chartContainer')

  if (checkCourseFilter(dept, title, size, dialog)) {
    return
  }

  var cID = ''
  if (dept !== '') {
    cID = getDropDownVal('ccourseID')
  }

  var query = buildCourseQuery(dept, cID, title, size)

  sendQuery(query, dialog, 'courseResult', num)
}

function checkCourseFilter (dept, title, size, dialog) {
  if (size !== '' && size) {
    var rx = new RegExp(/^\d+$/)
    if (!rx.test(size)) {
      dialog.modal('hide')
      $('#size').val('')
      bootbox.alert({
        title: 'Error',
        message: 'Please use a whole number for size',
        backdrop: true
      })
      return true
    }
  }

  if (dept === '' && title === '' && size === '') {
    dialog.modal('hide')
    bootbox.alert({
      title: 'Error',
      message: 'Please specify a filtering option',
      backdrop: true
    })
    return true
  } else {
    return false
  }
}

function buildCourseQuery (dept, cID, title, size) {
  var query = {
    'WHERE': {},
    'OPTIONS': {
      'COLUMNS': [
        'courses_dept',
        'courses_id',
        'courses_title'

      ],
      'ORDER': {
        'dir': 'DOWN',
        'keys': []
      },
      'FORM': 'TABLE'

    },
    'TRANSFORMATIONS': {
      'GROUP': ['courses_dept', 'courses_id', 'courses_title'],
      'APPLY': []
    }
  }

  var whereArray = []

  if (dept !== '') {
    whereArray.push({
      'IS': {
        'courses_dept': dept
      }
    })
  }

  if (cID !== '') {
    whereArray.push({
      'IS': {
        'courses_id': cID
      }
    })
  }

  if (title !== '' && title) {
    query['OPTIONS']['COLUMNS'].push('courses_title')
    query['TRANSFORMATIONS']['GROUP'].push('courses_title')
    whereArray.push({
      'IS': {
        'courses_title': '*' + title + '*'
      }
    })
  }

  if (size !== '' && size && parseInt(size)) {
    var e = document.getElementById('equation')
    var eq = e.options[e.selectedIndex].value

    if (eq === '=') {
      whereArray.push({
        'EQ': {
          'courses_size': parseInt(size)
        }
      })
    } else if (eq === '>') {
      whereArray.push({
        'GT': {
          'courses_size': parseInt(size)
        }
      })
    } else if (eq === '<') {
      whereArray.push({
        'LT': {
          'courses_size': parseInt(size)
        }
      })
    }
  }

  if (whereArray.length > 1) {
    query['WHERE'] = {
      'AND': whereArray
    }
  } else if (whereArray.length === 1) {
    query['WHERE'] = whereArray.pop()
  }

  if (document.getElementById('cAvg').checked) {
    query['OPTIONS']['ORDER']['dir'] = 'DOWN'
    query['OPTIONS']['COLUMNS'].push('average')
    query['OPTIONS']['ORDER']['keys'].push('average')
    query['TRANSFORMATIONS']['APPLY'].push(
      {
        'average': {
          'AVG': 'courses_avg'
        }
      }
        )
  }

  if (document.getElementById('cPass').checked) {
    query['OPTIONS']['COLUMNS'].push('maxPass')
    query['OPTIONS']['ORDER']['keys'].push('maxPass')
    query['TRANSFORMATIONS']['APPLY'].push(
      {
        'maxPass': {
          'MAX': 'courses_pass'
        }
      }
        )
  }

  if (document.getElementById('cFail').checked) {
    query['OPTIONS']['COLUMNS'].push('maxFail')
    query['OPTIONS']['ORDER']['keys'].push('maxFail')
    query['TRANSFORMATIONS']['APPLY'].push(
      {
        'maxFail': {
          'MAX': 'courses_fail'
        }
      }
        )
  }

  if (document.getElementById('cSection').checked) {
    query['OPTIONS']['ORDER']['dir'] = 'DOWN'
    query['OPTIONS']['COLUMNS'].push('maxSection')
    query['OPTIONS']['ORDER']['keys'].push('maxSection')
    query['TRANSFORMATIONS']['APPLY'].push({
      'maxSection': {
        'COUNT': 'courses_uuid'
      }
    }
        )
  }

  if (document.getElementById('cSize').checked) {
    query['OPTIONS']['ORDER']['dir'] = 'DOWN'
    query['OPTIONS']['COLUMNS'].push('maxSize')
    query['OPTIONS']['ORDER']['keys'].push('maxSize')
    query['TRANSFORMATIONS']['APPLY'].push({
      'maxSize': {
        'MAX': 'courses_size'
      }
    }
        )
  }

  if (query['OPTIONS']['ORDER']['keys'].length === 0) {
    query['OPTIONS']['ORDER']['dir'] = 'UP'
    query['OPTIONS']['ORDER']['keys'].push('courses_id')
  }

  return query
}

function createChart (array) {
  show('chartContainer')
  var deptName = array[0]['courses_dept'].toUpperCase()
  var courseID = array[0]['courses_id']
  var lessThan50 = 0
  var fiftyto59 = 0
  var sixtyto63 = 0
  var sixty4to67 = 0
  var sixty8to71 = 0
  var seventy2to75 = 0
  var seventy6to79 = 0
  var eightyto84 = 0
  var eighty5to89 = 0
  var nintyto100 = 0

  if (array.length !== 0) {
    for (var i = 0; i < array.length; i++) {
      var sectionavg = array[i]['average']
      if (sectionavg < 50) {
        lessThan50++
      } else if (sectionavg >= 50 && sectionavg < 60) {
        fiftyto59++
      } else if (sectionavg >= 60 && sectionavg < 64) {
        sixtyto63++
      } else if (sectionavg >= 64 && sectionavg < 68) {
        sixty4to67++
      } else if (sectionavg >= 68 && sectionavg < 72) {
        sixty8to71++
      } else if (sectionavg >= 72 && sectionavg < 76) {
        seventy2to75++
      } else if (sectionavg >= 76 && sectionavg < 80) {
        seventy6to79++
      } else if (sectionavg >= 80 && sectionavg < 85) {
        eightyto84++
      } else if (sectionavg >= 85 && sectionavg < 90) {
        eighty5to89++
      } else if (sectionavg >= 90 && sectionavg <= 100) {
        nintyto100++
      }
    }
    var chart = new CanvasJS.Chart('chartContainer', {
      theme: 'theme1',
      title: {
        text: 'Grades Distribution for' + ' ' + deptName + ' ' + courseID
      },
      animationEnabled: true,   // change to true
      data: [
        {
          type: 'column',
          dataPoints: [
                        {label: '< 50', y: lessThan50},
                        {label: '50 - 59', y: fiftyto59},
                        {label: '60 - 63', y: sixtyto63},
                        {label: '64 - 67', y: sixty4to67},
                        {label: '68 - 71', y: sixty8to71},
                        {label: '72 - 75', y: seventy2to75},
                        {label: '76 - 79', y: seventy6to79},
                        {label: '80 - 84', y: eightyto84},
                        {label: '85 - 89', y: eighty5to89},
                        {label: '90 - 100', y: nintyto100}
          ]
        }
      ]
    })
    chart.render()
  }
}
