/**
 * Created by naing on 2017-03-19.
 */
$(function () {

    function buildCourseInputQuery(dept, cID, filter) {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_pass",
                    "courses_fail",
                    "courses_year"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_dept", "courses_id"]
                },
                "FORM": "TABLE"
            }
        };

        var whereArray = [];

        if (dept !== "") {
            whereArray.push({
                "IS": {
                    "courses_dept": dept
                }
            });
        }

        var gtYear = {"GT": {"courses_year": 1900}}


        if (cID !== "") {
            whereArray.push({
                "IS": {
                    "courses_id": cID
                }
            });
        }

        if (filter === "AND") {
            if (whereArray.length > 1) {
                query['WHERE'] = {
                    "AND": [{"AND": whereArray}, gtYear]
                }
            } else if (whereArray.length === 1) {
                query['WHERE'] = {
                    "AND": whereArray.concat(gtYear)
                }
            }
        } else {
            if (whereArray.length > 1) {
                query['WHERE'] = {
                    "AND": [{"OR": whereArray}, gtYear]
                }
            } else if (whereArray.length === 1) {
                query['WHERE'] = {
                    "AND": whereArray.concat(gtYear)
                }
            }
        }

        return query;
    }

    function buildCourse2014Query(dept, cID, filter) {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_pass",
                    "courses_fail",
                    "courses_year"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["courses_dept", "courses_id"]
                },
                "FORM": "TABLE"
            }
        };

        var whereArray = [];

        if (dept !== "") {
            whereArray.push({
                "IS": {
                    "courses_dept": dept
                }
            });
        }

        var lastYear = {"EQ": {"courses_year": 2014}}

        if (cID !== "") {
            whereArray.push({
                "IS": {
                    "courses_id": cID
                }
            });
        }

        if (filter === "AND") {
            if (whereArray.length > 1) {
                query['WHERE'] = {
                    "AND": [{"AND": whereArray}, lastYear]
                }
            } else if (whereArray.length === 1) {
                query['WHERE'] = {
                    "AND": whereArray.concat(lastYear)
                }
            }
        } else {
            if (whereArray.length > 1) {
                query['WHERE'] = {
                    "AND": [{"OR": whereArray}, lastYear]
                }
            } else if (whereArray.length === 1) {
                query['WHERE'] = {
                    "AND": whereArray.concat(lastYear)
                }
            }
        }
        return query;
    }

    function getLatLon(shortname) {
        return {
            "WHERE": {
                "IS": {
                    "rooms_shortname": shortname
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_lat", "rooms_lon", "rooms_shortname"
                ],
                "ORDER": "rooms_shortname",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_lat", "rooms_lon"],
                "APPLY": []
            }
        };
    }

    function getAllLatLon() {
        return {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_lat", "rooms_lon", "rooms_shortname"
                ],
                "ORDER": "rooms_shortname",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_lat", "rooms_lon"],
                "APPLY": []
            }
        };
    }

    function buildRoomsQuery(shortname, buildingList, filter) {
        var query = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name", "rooms_seats"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        };

        var whereArray = [];

        if (shortname !== "") {
            whereArray.push({
                "IS": {
                    "rooms_shortname": shortname
                }
            });
        }

        if (buildingList.length > 0) {
            for (var i = 0; i < buildingList.length; i++) {
                whereArray.push({
                    "IS": {
                        "rooms_shortname": buildingList[i].rooms_shortname
                    }
                });
            }
        }

        if (filter === 'AND') {
            if (whereArray.length > 1 && shortname !== '') {
                query['WHERE'] = {
                    "AND": whereArray
                }
            } else if (whereArray.length === 1) {
                query['WHERE'] = whereArray.pop();
            } else if (shortname === '') {
                query['WHERE'] = {
                    "OR": whereArray
                }
            }
        } else {
            if (whereArray.length > 1) {
                query['WHERE'] = {
                    "OR": whereArray
                }
            } else if (whereArray.length === 1) {
                query['WHERE'] = whereArray.pop();
            }
        }


        return query;
    }

    $('#timeTableSubmit').on('click', function () {
        var dept = $('#dept').val();
        var cId = $('#courseid').val();
        var shortname = $('#shortname').val();
        var distance = $('#distance').val();
        var fromBuilding = $('#fromBuilding').val();
        var cOption = document.getElementById("ddlCourses");
        var rOption = document.getElementById("ddlRooms");
        var filterCourse = cOption.options[cOption.selectedIndex].value;
        var filterRoom = rOption.options[rOption.selectedIndex].value;

        if (dept === '' && cId === '' && shortname === '' && distance === '' && fromBuilding === '') {
            $("#error").html("Please fill in the fields");
            $('#myModal').modal("show");
            return;
        } else if (dept === '' && cId === '') {
            $("#error").html("Please fill at least one field for <strong>Course</strong>");
            $('#myModal').modal("show");
            return;
        } else if (distance === '' && fromBuilding === '' && shortname === '') {
            $("#error").html("Please fill at least one field for <strong>Room</strong>");
            $('#myModal').modal("show");
            return;
        } else if (distance === '' && fromBuilding !== '') {
            $("#error").html("Please fill in the field for <strong>Distance</strong>");
            $('#myModal').modal("show");
            return;
        } else if (distance !== '' && fromBuilding === '') {
            $("#error").html("Please fill in the field for <strong>From Building</strong>");
            $('#myModal').modal("show");
            return;
        } else if (distance < 0) {
            $("#error").html("The distance cannot be negative!");
            $('#myModal').modal("show");
            return;
        } else if (/\D/.test(distance)) {
            $("#error").html("Please only input numbers for <strong>Distance</strong>!");
            $('#myModal').modal("show");
            return;
        } else if (!/^[a-z]+$/.test(dept) && dept != '') {
            $("#error").html("Please only input lower case letters for <strong>Department</strong>!");
            $('#myModal').modal("show");
            return;
        } else if (!/^[A-Z]+$/.test(shortname) && shortname != '') {
            $("#error").html("Please only input capital letters for <strong>Building Short Name</strong>!");
            $('#myModal').modal("show");
            return;
        } else if (!/^[^\W_]+$/.test(cId) && cId != '') {
            $("#error").html("Please only input letters or numbers for <strong>Course ID</strong>!");
            $('#myModal').modal("show");
            return;
        } else if (!/^[A-Z]+$/.test(fromBuilding) && fromBuilding != '') {
            $("#error").html("Please only input capital letters for <strong>From Building field</strong>!");
            $('#myModal').modal("show");
            return;
        }

        var resArray = [];
        if (fromBuilding !== '' && distance !== '') {
            var latLonQuery = getLatLon(fromBuilding);
            var allLatLonQuery = getAllLatLon();
            var aData = [];
            var roomsData = [];
            $.ajax({
                url: "/query",
                type: "POST",
                data: JSON.stringify(latLonQuery),
                contentType: "application/json",
                datatType: "json",
                async: false
            }).done(function (data) {
                aData = data['result'];
            }).fail(function (e) {
                alert(e.responseText);
            });

            if(aData.length === 0) {
                document.getElementById('displayResult').style.display = 'none';
                $("#error").html("The values you specified for filtering <strong>rooms</strong> resulted in no entry being found!");
                $('#myModal').modal("show");
                return;
            }

            $.ajax({
                url: "/query",
                type: "POST",
                data: JSON.stringify(allLatLonQuery),
                contentType: "application/json",
                datatType: "json",
                async: false
            }).done(function (data) {
                roomsData = data['result'];
            }).fail(function (e) {
                alert(e.responseText);
            });

            //aData : get a single lat, lon value from From Building field (required call to 1 query)
            //roomsData: get all the lat lon of all the buildings (required call to 1 query)
            // ----- Main Loop to compute Distance From Building ------
            for (var i = 0; i < roomsData.length; i++) {
                if (aData[0] && roomsData[i]) {
                    var resDistance = getDistanceFromLatLonInMeter(aData[0].rooms_lat, aData[0].rooms_lon, roomsData[i].rooms_lat, roomsData[i].rooms_lon);
                    if (resDistance <= distance) {
                        resArray.push(roomsData[i]);
                    }
                }
            }
        }

        var inputCourseQuery = buildCourseInputQuery(dept, cId, filterCourse);
        var lyCourseQuery = buildCourse2014Query(dept, cId, filterCourse);
        var roomQuery = buildRoomsQuery(shortname, resArray, filterRoom);
        $.when(
            $.ajax({
                url: "/query",
                type: "POST",
                data: JSON.stringify(inputCourseQuery),
                contentType: "application/json",
                datatType: "json"
            }).fail(function (e) {
                alert(e.responseText);
            }),
            $.ajax({
                url: "/query",
                type: "POST",
                data: JSON.stringify(lyCourseQuery),
                contentType: "application/json",
                datatType: "json"
            }).fail(function (e) {
                alert(e.responseText);
            }),
            $.ajax({
                url: "/query",
                type: "POST",
                data: JSON.stringify(roomQuery),
                contentType: "application/json",
                datatType: "json"
            }).fail(function (e) {
                alert(e.responseText);
            })).then(function (resp1, resp2, resp3) {
            rbSelect();
            var dataInput = resp1[0]['result'];
            var data2014 = resp2[0]['result'];
            var roomData = resp3[0]['result'];

            if (dataInput.length === 0 && data2014.length === 0 && roomData.length === 0) {
                document.getElementById('displayResult').style.display = 'none';
                $("#error").html("The values you specified for filtering <strong>courses</strong> and <strong>rooms</strong> resulted in no entry being found!");
                $('#myModal').modal("show");
                return;
            } else if (dataInput.length === 0 || data2014.length === 0) {
                document.getElementById('displayResult').style.display = 'none';
                $("#error").html("The values you specified for filtering <strong>courses</strong> resulted in no entry being found!");
                $('#myModal').modal("show");
                return;
            } else if (roomData.length === 0) {
                document.getElementById('displayResult').style.display = 'none';
                $("#error").html("The values you specified for filtering <strong>rooms</strong> resulted in no entry being found!");
                $('#myModal').modal("show");
                return;
            } else {
                document.getElementById('displayResult').style.display = 'block';
            }

            var courseData = coursesToSchedule(dataInput, data2014)[0];
            var sectionCount = coursesToSchedule(dataInput, data2014)[1];
            var timeTable = scheduleRooms(courseData, roomData)[0];
            var timeTableData = scheduleRooms(courseData, roomData)[1];

            //$("#resultList").html(JSON.stringify(timeTable));
            //$("#courseList").html(JSON.stringify(roomData));
            scheduleQuality(timeTable, sectionCount);
            if (timeTableData[0].length === 0) {
                document.getElementById('displayResult').style.display = 'none';
                $("#error").html("The <strong>courses</strong> selected cannot be fit into any selected <strong>rooms</strong>!");
                $('#myModal').modal("show");
            } else {
                buildTimetable(timeTableData);
                buildRoomTable(timeTableData);
            }

        });
    });

    function rbSelect() {
        $('input[type="radio"]').change(function () {
            $('#showmeTime').show();
            if ($(this).attr('id') === 'rbTimetable') {
                $('#timetable').show();
            }
            else {
                $('#timetable').hide();
            }

            if ($(this).attr('id') === 'rbTable') {
                $('#timetableData').show();
            }
            else {
                $('#timetableData').hide();
            }
        }).filter(function () {
            return $(this).prop("checked");
        }).trigger("change");
    }

    function coursesToSchedule(courses, courses2014) {
        var i;
        var sKey,
            nSize;
        var oCourse;
        var oCurData = {};
        var o2014Data = {};
        for (i = 0; i < courses2014.length; i++) {
            oCourse = courses2014[i];
            sKey = oCourse.courses_dept + oCourse.courses_id;
            if (!o2014Data[sKey]) {
                o2014Data[sKey] = 0;
            }
            o2014Data[sKey]++;
        }

        for (sKey in o2014Data) {
            o2014Data[sKey] = Math.ceil(o2014Data[sKey] / 3);
        }

        for (i = 0; i < courses.length; i++) {
            oCourse = courses[i];
            sKey = oCourse.courses_dept + oCourse.courses_id;
            nSize = oCourse.courses_pass + oCourse.courses_fail;
            if (!oCurData[sKey]) {
                oCurData[sKey] = {
                    source: oCourse,
                    total: 0,
                    size: 0
                };
            }
            if (oCurData[sKey].size < nSize) {
                oCurData[sKey].size = nSize;
            }
            oCurData[sKey].total++;
        }

        var aResult = [];
        var oResult;
        var oCourse;
        var nEntry;
        var sectionCount = 0;
        var totalSec;
        for (sKey in oCurData) {
            oCourse = oCurData[sKey];

            if (!o2014Data[sKey]) {
                nEntry = 0;
            } else {
                nEntry = o2014Data[sKey];
                if (nEntry >= 15) {
                    sectionCount = nEntry - 15;
                    nEntry = 15;
                }
            }

            totalSec = nEntry + sectionCount;
            for (i = 0; i < nEntry; i++) {
                oResult = {
                    courses_dept: oCourse.source.courses_dept,
                    courses_id: oCourse.source.courses_id,
                    courses_size: oCourse.size,
                    courses_section: o2014Data[sKey]
                };
                aResult.push(oResult);
            }
        }
        return [aResult, sectionCount];
    }

    function scheduleQuality(aResult, sectionCount) {
        var count = 0;
        var quality;
        var unScheduled;
        var totalCourse;
        var qPercent;
        for (var i = 0; i < aResult.length; i++) {
            if (!aResult[i].room) {
                count++;
            }
        }
        totalCourse = sectionCount + aResult.length;
        unScheduled = count + sectionCount;
        quality = 1 - (unScheduled / totalCourse);
        qPercent = quality * 100;
        document.getElementById('quality').innerHTML = "Schedule Quality: " + qPercent.toPrecision(3) + "% " +
            "&nbsp;&nbsp;<small class='text-muted'>(Unscheduled Courses: " + unScheduled + ",&nbsp;&nbsp; Total Courses: "
            + totalCourse + " )</small>";
    }

    function scheduleRooms(courses, rooms) {
        var oCourse;
        var roomSize;
        var courseSize;
        var timeId = 1;
        var maxTimeId = 15;
        var i = 0;
        var roomArr = [];
        var resArr = [];
        courses = courses.sort(function (o1, o2) {
            return o2.courses_size - o1.courses_size;
        });

        rooms = rooms.sort(function (o1, o2) {
            return o2.rooms_seats - o1.rooms_seats;
        });
        roomLoop: for (var j = 0; j < rooms.length; j++) {
            roomArr = [];
            timeId = 1;
            roomSize = rooms[j]['rooms_seats'];
            do {
                oCourse = courses[i++];
                courseSize = oCourse['courses_size'];
                oCourse.room = rooms[j]['rooms_name'];
                oCourse.room_size = roomSize;
                if (courseSize > roomSize) {
                    oCourse.timeId = 99;
                    delete oCourse['room'];
                    delete oCourse['room_size'];
                } else {
                    if (timeId <= maxTimeId) {
                        oCourse.timeId = timeId++;
                        roomArr.push(oCourse);
                    } else {
                        i--;
                        if (j === rooms.length - 1) {
                            delete oCourse['room'];
                            delete oCourse['room_size'];
                            delete oCourse['timeId'];
                        } else {
                            oCourse.timeId = 1;
                        }
                        resArr.push(roomArr);
                        continue roomLoop;
                    }
                }
            } while (i < courses.length && oCourse)

            resArr.push(roomArr);

            if (i >= courses.length) {
                break roomLoop;
            }
        }
        return [courses, resArr];
    }

    function buildTimetable(data) {
        var k = '';
        for (var i = 0; i < data.length; i++) {
            var courseData = data[i];
            k += '<table class="table table-bordered table-condensed">';
            k += '<thead><p><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span> ' + courseData[0].room + '</p></thead>';
            k += '<tr class="warning"><td align="center"><span class="glyphicon glyphicon-time" aria-hidden="true"></span></td>' +
                '<td>8am</td><td>9am</td><td>10am</td><td>11am</td><td>12pm</td><td>1pm</td>';
            k += '<td>2pm</td><td>3pm</td><td>4pm</td></tr>';
            //Table row for Monday
            k += '<tr> <td class="warning"> Monday </td>';
            for (var j = 0; j < 9; j++) {
                if (typeof courseData[j] === 'undefined') {
                    k += '<td> </td>';
                } else {
                    k += '<td><code>' + courseData[j].courses_dept + '' + courseData[j].courses_id + '</code></td>'
                }
            }
            k += '</tr>';

            //Table row for Tuesday
            k += '<tr> <td class="warning"> Tuesday </td>';
            for (var j = 9; j < 14; j += 2) {
                if (typeof courseData[j] === 'undefined') {
                    k += '<td colspan="3">';
                    k += '<div class="firstcol">';
                    k += '<div style="color:white;">null</div> </div>';
                    k += '<div class="secondcol"> </div></td>';
                } else if (typeof courseData[j + 1] === 'undefined') {
                    k += '<td colspan="3">';
                    k += '<div class="firstcol"><code>'
                        + courseData[j].courses_dept + ''
                        + courseData[j].courses_id + '</code></div>';
                    k += '<div class="secondcol"></div></td>'
                } else {
                    k += '<td colspan="3">';
                    k += '<div class="firstcol"><code>'
                        + courseData[j].courses_dept + ''
                        + courseData[j].courses_id + '</code></div>';
                    k += '<div class="secondcol"><code>'
                        + courseData[j + 1].courses_dept + ''
                        + courseData[j + 1].courses_id + '</code></div></td>'
                }
            }
            k += '</tr>';

            //Table row for Wednesday
            k += '<tr> <td class="warning"> Wednesday </td>';
            for (var j = 0; j < 9; j++) {
                if (typeof courseData[j] === 'undefined') {
                    k += '<td> </td>';
                } else {
                    k += '<td><code>' + courseData[j].courses_dept + '' + courseData[j].courses_id + '</code></td>'
                }
            }
            k += '</tr>';

            //Table row for Thursday
            k += '<tr> <td class="warning"> Thursday </td>';
            for (var j = 9; j < 14; j += 2) {
                if (typeof courseData[j] === 'undefined') {
                    k += '<td colspan="3">';
                    k += '<div class="firstcol">';
                    k += '<div style="color:white;">null</div> </div>';
                    k += '<div class="secondcol"> </div></td>';
                } else if (typeof courseData[j + 1] === 'undefined') {
                    k += '<td colspan="3">';
                    k += '<div class="firstcol"><code>'
                        + courseData[j].courses_dept + ''
                        + courseData[j].courses_id + '</code></div>';
                    k += '<div class="secondcol"></div></td>'
                } else {
                    k += '<td colspan="3">';
                    k += '<div class="firstcol"><code>'
                        + courseData[j].courses_dept + ''
                        + courseData[j].courses_id + '</code></div>';
                    k += '<div class="secondcol"><code>'
                        + courseData[j + 1].courses_dept + ''
                        + courseData[j + 1].courses_id + '</code></div></td>'
                }
            }
            k += '</tr>';

            //Table row for Friday
            k += '<tr> <td class="warning"> Friday </td>';
            for (var j = 0; j < 9; j++) {
                if (typeof courseData[j] === 'undefined') {
                    k += '<td> </td>';
                } else {
                    k += '<td><code>' + courseData[j].courses_dept + '' + courseData[j].courses_id + '</code></td>'
                }
            }
            k += '</tr>';

            k += '</table>';
            k += '<br>'
        }
        document.getElementById('timetable').innerHTML = k;
    }

    function buildRoomTable(data) {
        var k = '';
        for (var j = 0; j < data.length; j++) {
            var aResult = data[j];
            k += '<table class="table table-hover"><thead><p>' +
                '<span class="glyphicon glyphicon-calendar" aria-hidden="true"></span> ' + aResult[0].room;
            k += ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-object-align-left" aria-hidden="true"></span> ' +
                'Capacity: ' + aResult[0].room_size + '</p></thead>';
            k += '<tr><th>Department</th><th>Course ID</th><th>Course Size</th>' +
                '<th>No. of section</th><th>Time</th>';
            for (var i = 0; i < aResult.length; i++) {
                k += '<tr>';
                k += '<td>' + aResult[i].courses_dept + '</td>';
                k += '<td>' + aResult[i].courses_id + '</td>';
                k += '<td>' + aResult[i].courses_size + '</td>';
                k += '<td>' + aResult[i].courses_section + '</td>';

                if (!aResult[i].timeId || aResult[i].timeId === 99) {
                    k += "<td> </td>";
                } else if (aResult[i].timeId === 1) {
                    k += "<td>" + "MWF 8:00-9:00" + "</td>";
                } else if (aResult[i].timeId === 2) {
                    k += "<td>" + "MWF 9:00-10:00" + "</td>";
                } else if (aResult[i].timeId === 3) {
                    k += "<td>" + "MWF 10:00-11:00" + "</td>";
                } else if (aResult[i].timeId === 4) {
                    k += "<td>" + "MWF 11:00-12:00" + "</td>";
                } else if (aResult[i].timeId === 5) {
                    k += "<td>" + "MWF 12:00-1:00" + "</td>";
                } else if (aResult[i].timeId === 6) {
                    k += "<td>" + "MWF 1:00-2:00" + "</td>";
                } else if (aResult[i].timeId === 7) {
                    k += "<td>" + "MWF 2:00-3:00" + "</td>";
                } else if (aResult[i].timeId === 8) {
                    k += "<td>" + "MWF 3:00-4:00" + "</td>";
                } else if (aResult[i].timeId === 9) {
                    k += "<td>" + "MWF 4:00-5:00" + "</td>";
                } else if (aResult[i].timeId === 10) {
                    k += "<td>" + "TT 8:00-9:30" + "</td>";
                } else if (aResult[i].timeId === 11) {
                    k += "<td>" + "TT 9:30-11:00" + "</td>";
                } else if (aResult[i].timeId === 12) {
                    k += "<td>" + "TT 11:00-12:30" + "</td>";
                } else if (aResult[i].timeId === 13) {
                    k += "<td>" + "TT 12:30-2:00" + "</td>";
                } else if (aResult[i].timeId === 14) {
                    k += "<td>" + "TT 2:00-3:30" + "</td>";
                } else if (aResult[i].timeId === 15) {
                    k += "<td>" + "TT 3:30-5:00" + "</td>";
                }
                k += '</tr>';
            }
            k += '</table>';
            k += '<br>';
        }
        document.getElementById('timetableData').innerHTML = k;
    }
});