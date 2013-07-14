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
        description: 'notes-',
        project: 'PID-'
    },

    process: function (data){
        console.log(data)
        $.each(data.week, function(dayIndex, day){
            var hoursSummary = 0,
                descriptionSummary = '';
            $.each(day, function(taskIndex, task){
                hoursSummary += parseInt(task.timeSpent, 10)
                descriptionSummary += task.issueKey + ' ' +task.issueName + '; '
            });

            this.setHours(dayIndex, hoursSummary);
            this.setDescription(dayIndex, descriptionSummary);
            data.projectId ? this.setProject(dayIndex, data.projectId) : null;
        }.bind(this));
    },

    setHours: function (index, hours){
        $('#' + this.idsMask.hours + index).val(hours);
    },

    setDescription: function (index, text){
        $('#' + this.idsMask.description + index).val(text);
    },

    setProject: function (index, id){
        var $temp = $('#' + this.idsMask.project + index).val(id);
//        $('#' + this.idsMask.project + index).change();
//        $temp
    }
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.channel) {
        case 'fillWebtimeButtonClicked':
            console.log("fillWebtimeButtonClicked", request);
            if ($.isPlainObject(request.data)) {
                tableFiller.process(request.data)
                sendResponse({status: 'success'});
            }
            break;
        case 'pageActionOnClicked':
            if (!window.jQuery) {
                chrome.tabs.executeScript(tab.id, {file: "jquery-2.0.3.js"});
            }
            break;
        case 'getProjects':
            var projectsData = [];
            $('#PID-8').find('option').each(function(index, option){
                projectsData.push({value: $(option).val(), text: $(option).text()})
            });
            sendResponse({status: 'success', data: projectsData});

    }
});


