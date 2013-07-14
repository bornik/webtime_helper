// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var beginPeriod = moment().startOf('week');
var endPeriod = moment().endOf('week'); 
var jiraUrl = "https://jira.exadel.com"; 

function plusWeek() {
    beginPeriod = beginPeriod.add('days', 7);
    endPeriod = endPeriod.add('days', 7);
} 

function minusWeek() {
    beginPeriod = beginPeriod.add('days', -7);
    endPeriod = endPeriod.add('days', -7);
} 

function currentWeek() {
    beginPeriod = moment().startOf('week');
    endPeriod = moment().endOf('week'); 
} 

var mainObj = {

    addDomHandlers: function () {
        $('#fillWebtime').click(function (e) {
            console.log("#fillWebtime clicked");

            var dataModel = prepareModelToSend(tableModel);

            chrome.tabs.getSelected(null, function (tab) {
                chrome.tabs.sendMessage(tab.id, {channel: 'fillWebtimeButtonClicked', dataModel: dataModel}, function (response) {
                    console.log(response.farewell);
                });
            });
        }.bind(this));
    },


    doInCurrentTab: function (tabCallback) {
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabArray) {
                tabCallback(tabArray[0]);
            }
        )
    },

    actionButtonClicked: function () {
        /*
        $.ajax({
            type: 'GET',
            url: 'https://jira.exadel.com/rest/timesheet-gadget/1.0/raw-timesheet.json',
            success: function (response) {
                processTableModel(response);
                drawAndFillTable(tableModel, tableCaptions);
            },
            error: function (error) {
                console.log('error',error);
            }
        });
        */
        minusWeek();
		isAuthorized();
        var response = getTimeSheet("aartemenko", "kl43$Da", beginPeriod, endPeriod);
        if (response){
            processTableModel(response);
            drawAndFillTable(tableModel, tableCaptions);
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
function getAuthBase64(user, password) {
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
function getTimeSheet(user, password, startDate, endDate) {
	$("#loading").show();
	var url = jiraUrl + "/rest/timesheet-gadget/1.0/raw-timesheet.json";
	if (startDate != null && endDate != null) {
    	var startParam = moment(startDate).format('DD/MMM/YYYY');
		var endParam = moment(endDate).format('DD/MMM/YYYY'); 
		var completion = "?startDate="+startParam+"&endDate="+endParam;
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
		if (client.status == 200){
			console.log(client.responseText);
			$("#loading").hide();
			return client.responseText;
		} else{
			console.log("Error code: " + client.status);
		}
		//Error code: 204
	} catch(e) {
		console.log(e);
	}
	$("#loading").hide();
	return null;
}

function isAuthorized() {
	var result = false;
	var url = jiraUrl + "/rest/auth/1/session";
	var client = new XMLHttpRequest();
	client.open("GET", url, false);
	client.setRequestHeader("Content-Type", "application/json");
	try {
		client.send("");
		if (client.status != 200){
			result = true;
		}
	} catch(e){
		console.log(e);	
	}
	console.log(result);
	return result;
}

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    mainObj.addDomHandlers();
    mainObj.actionButtonClicked();
});
