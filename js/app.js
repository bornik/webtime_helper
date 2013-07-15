/**
 * Created with JetBrains WebStorm.
 * User: mchapliuk
 * Date: 7/13/13
 * Time: 1:41 PM
 * To change this template use File | Settings | File Templates.
 */

var tableModel = {};

var weekHeader = {
    startDate: '',
    endDate: '',
    startDayOfWeek: '',
    startDay: '',
    startMonth: '',
    startYear: '',

    endDayOfWeek: '',
    endDay: '',
    endMonth: '',
    endYear: '',

    init: function () {
        'use strict';
        this.startDayOfWeek = this.startDate.getDay();
        this.startDay = this.startDate.getDate();
        this.startMonth = this.startDate.getMonth();
        this.startYear = this.startDate.getFullYear();

        this.endDayOfWeek = this.endDate.getDay();
        this.endDay = this.endDate.getDate();
        this.endMonth = this.endDate.getMonth();
        this.endYear = this.endDate.getFullYear();
    },


    getShortNameOfMonth: function (monthIndex) {
        'use strict';
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
    },

    getCaption: function () {
        return getShortNameOfDay(this.startDayOfWeek) +
            ', ' + this.startDay + ' ' + this.getShortNameOfMonth(this.startMonth) + ' ' + this.startYear +
            ' - ' + getShortNameOfDay(this.endDayOfWeek) + ', ' + this.endDay + ' ' + this.getShortNameOfMonth(this.endMonth) +
            ' ' + this.endYear;
    }
};

// Delete this var
var tableCaptions = ['DoW', 'Issue', 'Time log', 'Select'];

/**
 * Builds a table model with Issues from JIRA
 * @param data table model
 */
function processTableModel (data) {

    data = JSON.parse(data);

    if (!(data && data.worklog)) {
        return;
    }

    tableModel = {};

    weekHeader.startDate = new Date(+data.startDate);
    weekHeader.endDate = new Date(+data.endDate);

    weekHeader.init();

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

    var modelItem;

    $.each(tmpItems, function (index) {
        modelItem = {};
        modelItem.issueKey = tmpItems[index].issueKey;
        modelItem.issueName = tmpItems[index].issueName;
        modelItem.timeSpent = tmpItems[index].timeSpent;

        if (typeof tableModel[tmpItems[index].key] !== 'object') {
            tableModel[tmpItems[index].key] = [];
        }

        tableModel[tmpItems[index].key].push(modelItem);
    });

    tableModel.totalHours = totalHours;

}

/**
 * draws and fills table with data from model
 * @param tm - table model
 * @param tc - array of table captions
 */
function drawAndFillTable (tm, tc) {

    var tableContent = $('#tableContent');

    if (document.getElementById('jiraLog')) {
        tableContent.empty();
    }

    var table = $('<table/>').addClass('table no-margin-bottom table-hover table-condensed').attr('id', 'jiraLog');

    var tableCaption = $('<caption/>').append(weekHeader.getCaption());

    table.append(tableCaption);

    var tableHeader = $('<thead/>'),
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
        dataRow;

    // Fill table with data
    for (key in tm) {
        if (tm.hasOwnProperty(key)) {
            dayIndex = key;
            dow = getShortNameOfDay(dayIndex);
            rowSpan = tm[key].length;

            $.each(tm[key], function (i) {
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

    var tableFooter = $('<tfoot/>').append('<td></td><td></td><td class="bold-cell middle-cell">' + tm.totalHours + ' h</td><td></td>');
    table.append(tableFooter);


    tableContent.append(table);
}


/**
 * deletes unchecked days from model
 * @param tm - table model
 * @returns {{new table model without unchecked days}}
 */
function prepareModelToSend (tm) {
    var modelToSend = {};
    var checkedDays = $("input[name='sel']:checked");

    $.each(checkedDays, function () {
        modelToSend[$(this).val()] = tm[$(this).val()];
    });

    return modelToSend;
}

function getShortNameOfDay (dayIndex) {
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

