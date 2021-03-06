var beginPeriod = moment().startOf('week');
var endPeriod = moment().endOf('week');
var jiraUrl = "https://jira.exadel.com";

function plusWeek () {
    "use strict";
    beginPeriod = beginPeriod.add('days', 7);
    endPeriod = endPeriod.add('days', 7);
}

function minusWeek () {
    "use strict";
    beginPeriod = beginPeriod.add('days', -7);
    endPeriod = endPeriod.add('days', -7);
}

function currentWeek () {
    "use strict";
    beginPeriod = moment().startOf('week');
    endPeriod = moment().endOf('week');
}

var mainObj = {

    login: null,
    pass: null,

    addDomHandlers: function () {
        "use strict";
        var self = this;
        $('#fillWebtime').click(function (e) {
            console.log("#fillWebtime clicked");
            debugger;
            var dataModel = prepareModelToSend(self.tableModel);

            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.sendMessage(tab.id, {
                    channel: 'fillWebtimeButtonClicked',
                    data: {
                        week: dataModel,
                        projectId: localStorage['currentProject']
                    }
                }, function (response) {
                    console.log(response.farewell);
                });
            });
        });

        $('#prevWeek').click(function (e) {
            minusWeek();
            self.requestAndShow();
        });

        $('#currentWeek').click(function (e) {
            currentWeek();
            self.requestAndShow();
        });

        $('#nextWeek').click(function (e) {
            plusWeek();
            self.requestAndShow();
        });

        $('#jiraLink').click(function (e) {
            goToJira();
        });

        $('#signIn').click(function (e) {
            self.login = $('#login').val();
            self.pass = $('#pass').val();

            self.requestAndShow();

            self.login = null;
            self.pass = null;
            $('#credentials').hide();
            $('#content').show();
        });

        $('#projectsList').change(function (e) {
            console.log("#projectsList changed");
            localStorage.currentProject = e.target.value;
        });

        $('#tableContent').delegate("td.issueLink", "click", function () {
            goToIssue($(this).attr('data-key'));
        });

        $("#tableContent").delegate("td > input.daycheck", "click", function() {
            if ($(this).is(":checked")) {
                $(this).parents('tr').addClass('success');
            } else {
                $(this).parents('tr').removeClass('success');
            }
        });
    },

    setProjectsOptions: function () {
        console.log("setProjectsOptions fired");
        chrome.tabs.getSelected(null, function (tab) {
            console.log("getSelected fired");
            chrome.tabs.sendMessage(tab.id, {channel: 'getProjects'}, function (response) {
                console.log("getProjects response fired", response);
                if (response.status === 'success') {
                    var $projectsList = $('#projectsList');
                    $.each(response.data, function (index, project) {
                        var o = new Option(project.text, project.value);
                        $(o).html(project.text);
                        $projectsList.append(o);
                    });
                    if (localStorage.currentProject) {
                        $projectsList.val(localStorage.currentProject)
                    } else {
                        $projectsList.val(-1);
                    }
                }
            });
        });
    },

    requestAndShow: function () {
        "use strict";
        var response = getTimeSheet(this.login, this.pass, beginPeriod, endPeriod);
        if (response) {
            this.tableModel = new TableModel(response);
            this.tableModel.init();
            //processTableModel(response);
            drawAndFillTable(this.tableModel, tableCaptions);
        }
    },

    actionButtonClicked: function () {
        "use strict";
        if (isAuthorized()) {
            this.requestAndShow();
        } else {
            $('#content').hide();
            $('#credentials').show();
        }
    }
};

/**
 * Encode auth info to base64
 *
 * @user The user login.
 * @password The user password.
 * @return Base64 auth string.
 */
function getAuthBase64 (user, password) {
    "use strict";
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
}

/**
 * Provide jira weekly timesheet.
 *
 * @user The user login.
 * @password The user password.
 * @startDate Begin report period.
 * @endDate End report period.
 * @return Weekly timesheet at JSON format.
 */
function getTimeSheet (user, password, startDate, endDate) {
    "use strict";
    var url = jiraUrl + "/rest/timesheet-gadget/1.0/raw-timesheet.json";
    if (startDate != null && endDate != null) {
        var startParam = moment(startDate).format('DD/MMM/YYYY');
        var endParam = moment(endDate).format('DD/MMM/YYYY');
        var completion = "?startDate=" + startParam + "&endDate=" + endParam;
        if (completion != null) {
            url = url + completion;
        }
    }
    console.log(url);

    var client = new XMLHttpRequest();

    client.open("GET", url, false);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", getAuthBase64(user, password));

    try {
        client.send("");
        if (client.status == 200) {
            console.log(client.responseText);
            $("#loading").hide();
            return client.responseText;
        } else {
            console.log("Error code: " + client.status);
        }
        //Error code: 204
    } catch (e) {
        console.log(e);
    }

    return null;
}

function isAuthorized () {
    "use strict";
    var result = false;
    var url = jiraUrl + "/rest/auth/1/session";
    var client = new XMLHttpRequest();
    client.open("GET", url, false);
    client.setRequestHeader("Content-Type", "application/json");
    try {
        client.send("");
        if (client.status == 200) {
            result = true;
        }
    } catch (e) {
        console.log(e);
    }
    console.log(result);
    return result;
}

function goToIssue (issue) {
    "use strict";
    var link = jiraUrl + "/browse/" + issue;
    console.log(link);
    chrome.tabs.create({ url: link });
}

function goToJira () {
    chrome.tabs.create({ url: jiraUrl });
}

//document.addEventListener('DOMContentLoaded', function () {
//    mainObj.addDomHandlers();
//    mainObj.actionButtonClicked();
//});
$(document).ready(function () {
    "use strict";
    mainObj.addDomHandlers();
    mainObj.actionButtonClicked();
    mainObj.setProjectsOptions();
});
