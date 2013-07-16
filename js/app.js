/**
 * Created with JetBrains WebStorm.
 * User: mchapliuk
 * Date: 7/13/13
 * Time: 1:41 PM
 * To change this template use File | Settings | File Templates.
 */

function getShortNameOfDay (dayIndex) {
    'use strict';

    switch (+dayIndex) {
        case 0:
            return 'Sun';
        case 1:
            return 'Mon';
        case 2:
            return 'Tue';
        case 3:
            return 'Wed';
        case 4:
            return 'Thu';
        case 5:
            return 'Fri';
        case 6:
            return 'Sat';
        default :
            return 'Unk';
    }
}

function TableModel (data) {
    "use strict";

    this._getShortNameOfMonth = function (monthIndex) {
        switch (+monthIndex) {
            case 0:
                return 'Jan';
            case 1:
                return 'Feb';
            case 2:
                return 'Mar';
            case 3:
                return 'Apr';
            case 4:
                return 'May';
            case 5:
                return 'Jun';
            case 6:
                return 'Jul';
            case 7:
                return 'Aug';
            case 8:
                return 'Sep';
            case 9:
                return 'Oct';
            case 10:
                return 'Nov';
            case 11:
                return 'Dec';
            default :
                return 'Unk';
        }
    };

    this._datesInit = function () {
        this.startDayOfWeek = this.startDate.getDay();
        this.startDay = this.startDate.getDate();
        this.startMonth = this.startDate.getMonth();
        this.startYear = this.startDate.getFullYear();

        this.endDayOfWeek = this.endDate.getDay();
        this.endDay = this.endDate.getDate();
        this.endMonth = this.endDate.getMonth();
        this.endYear = this.endDate.getFullYear();
    };

    this.getCaption = function () {
        return getShortNameOfDay(this.startDayOfWeek) +
            ', ' + this.startDay + ' ' + this._getShortNameOfMonth(this.startMonth) + ' ' + this.startYear +
            ' - ' + getShortNameOfDay(this.endDayOfWeek) + ', ' + this.endDay + ' ' + this._getShortNameOfMonth(this.endMonth) +
            ' ' + this.endYear;
    };

    this.init = function () {
        data = JSON.parse(data);

        if (!(data && data.worklog)) {
            return;
        }

        this.startDate = new Date(+data.startDate);
        this.endDate = new Date(+data.endDate);

        this._datesInit();

        var tmpItems = [],
            totalHours = 0,
            key, issueKey, issueName, innerKey,
            logDate, timeSpent, item,
            workLog = data.worklog,
            workLogEntries;

        for (key in workLog) {
            if (workLog.hasOwnProperty(key)) {
                issueKey = workLog[key].key;
                issueName = workLog[key].summary;
                workLogEntries = workLog[key].entries;

                for (innerKey in workLogEntries) {
                    if (workLogEntries.hasOwnProperty(innerKey)) {
                        logDate = new Date(+workLogEntries[innerKey].startDate);
                        timeSpent = workLogEntries[innerKey].timeSpent / 3600; // time in hours

                        item = {};
                        item.key = logDate.getDay();
                        item.issueKey = issueKey;
                        item.issueName = issueName;
                        item.timeSpent = timeSpent;

                        totalHours += timeSpent;

                        tmpItems.push(item);
                    }
                }
            }
        }

        var modelItem,
            self = this;

        $.each(tmpItems, function (index) {
            modelItem = {};
            modelItem.issueKey = tmpItems[index].issueKey;
            modelItem.issueName = tmpItems[index].issueName;
            modelItem.timeSpent = tmpItems[index].timeSpent;

            if (!self.days) {
                self.days = {};
            }

            if (typeof self.days[tmpItems[index].key] !== 'object') {
                self.days[tmpItems[index].key] = [];
            }

            self.days[tmpItems[index].key].push(modelItem);
        });

        this.totalHours = totalHours;
    }
}


// Delete this var
var tableCaptions = ['DoW', 'Issue', 'Time log', 'Select'];

/**
 * draws and fills table with data from model
 * @param tm - table model
 * @param tc - array of table captions
 */
function drawAndFillTable (tm, tc) {
    'use strict';

    var tableContent = $('#tableContent'),
        table,
        tableCaption,
        tableHeader,
        tableHeaderRow,
        tableFooter;

    if (document.getElementById('jiraLog')) {
        tableContent.empty();
    }

    table = $('<table/>').addClass('table no-margin-bottom table-hover table-condensed').attr('id', 'jiraLog');

    tableCaption = $('<caption/>').append(tm.getCaption());

    table.append(tableCaption);

    tableHeader = $('<thead/>');
    tableHeaderRow = $('<tr/>');

    $.each(tc, function (i) {
        tableHeaderRow.append('<th>' + tc[i] + '</th>');
    });

    tableHeader.append(tableHeaderRow);
    table.append(tableHeader);

    var tableBody = $('<tbody/>'),
        key,
        dayIndex,
        dow,
        rowSpan,
        row,
        dataRow,
        days = tm.days;

    // Fill table with data
    for (key in days) {
        if (days.hasOwnProperty(key)) {
            dayIndex = key;
            dow = getShortNameOfDay(dayIndex);
            rowSpan = days[key].length;

            $.each(days[key], function (i) {
                dataRow = $('<tr/>');
                if (i === 0) {
                    row = $('<td rowspan="' + rowSpan + '" class="middle-cell">' + dow + '</td><td class="issueLink" data-key="' + this.issueKey + '">' + this.issueKey + ' - ' + this.issueName + '</td><td class="middle-cell">' + this.timeSpent + ' h</td><td rowspan="' + rowSpan + '" class="middle-cell"><input type="checkbox" name="sel" value="' + dayIndex + '" checked/></td>');
                } else {
                    row = $('<td class="issueLink" data-key="' + this.issueKey + '">' + this.issueKey + ' - ' + this.issueName + '</td><td class="middle-cell">' + this.timeSpent + ' h</td>');
                }
                dataRow.append(row);
                tableBody.append(dataRow);
            });
        }
    }

    table.append(tableBody);

    tableFooter = $('<tfoot/>').append('<td></td><td></td><td class="bold-cell middle-cell">' + tm.totalHours + ' h</td><td></td>');
    table.append(tableFooter);


    tableContent.append(table);
}


/**
 * deletes unchecked days from model
 * @param tm - table model
 * @returns {{new table model without unchecked days}}
 */
function prepareModelToSend (tm) {
    'use strict';

    var modelToSend = {};
    var checkedDays = $("input[name='sel']:checked");

    $.each(checkedDays, function () {
        modelToSend[$(this).val()] = tm.days[$(this).val()];
    });

    return modelToSend;
}


