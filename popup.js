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

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    mainObj.addDomHandlers();
    mainObj.actionButtonClicked();
});
