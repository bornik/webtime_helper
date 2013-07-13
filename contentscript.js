/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */


//TODO if jquery is not exist load it with chrome.tabs.executeScript(null, {file: "content_script.js"});
//chrome.browserAction.onClicked.addListener(function(tab) {
//    chrome.tabs.executeScript(null, {file: "content_script.js"});
//});


//TODO options load at window load or plugin clicked


var tableFiller = {
    idsMask: {
        hours: 'Hours-',
        description: 'notes-'
    },

    process: function (dataModel){
        $.each(dataModel, function(dayIndex, day){
            var hoursSummary = 0,
                descriptionSummary = '';
            $.each(day, function(taskIndex, task){
                hoursSummary += parseInt(task.timeSpent, 10)
                descriptionSummary += task.issueKey + ' ' +task.issueName + '; '
            });

            this.setHours(dayIndex, hoursSummary);
            this.setDescription(dayIndex, descriptionSummary);
        }.bind(this));
    },

    setHours: function (index, hours){
        $('#' + this.idsMask.hours + index).val(hours);
    },

    setDescription: function (index, text){
        $('#' + this.idsMask.description + index).val(text);
    }
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.channel === 'fillWebtimeButtonClicked') {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if ($.isPlainObject(request.dataModel)) {
            tableFiller.process(request.dataModel)
            sendResponse({status: 'success'});
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.channel === 'pageActionOnClicked') {
        if (!window.jQuery) {
            chrome.tabs.executeScript(tab.id, {file: "jquery-2.0.3.js"});
        }
    }
});


