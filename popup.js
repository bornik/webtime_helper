// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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
 * @return Weekly timesheet at JSON format.
 */
function getTimeSheet(user, password) {
	var url = "https://jira.exadel.com/rest/timesheet-gadget/1.0/raw-timesheet.json";
	var client = new XMLHttpRequest();
	
	client.open("GET", url, false);
	client.setRequestHeader("Content-Type", "application/json");	
	client.setRequestHeader("Authorization", "Basic " + getAuthBase64(user, password));		
	try {
		client.send("");
		if (client.status == 200){
			console.log(client.responseText);
			return client.responseText;
		} else{
			console.log("Error code: " + client.status);
		}
	} catch(e) {
		console.log(e);
	}
	return null;
}


$(document).ajaxStart(function() {
    $("#loading").show();
});

$(document).ajaxStop(function() {
    $("#loading").hide();
});

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    mainObj.addDomHandlers();
    mainObj.actionButtonClicked();
});
