// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var mainObj = {

    addDomHandlers: function () {
        $('body').click('#fillWebtime', function (e) {
            console.log("#fillWebtime clicked");

//            //var dataModel = [
//                {
//                    issueKey: 'THTML-45',
//                    issueName: 'Fix all bugs',
//                    timeSpent: 8
//                }
//            ];

            $.ajax({
                type: 'GET',
                url: 'https://jira.exadel.com/rest/timesheet-gadget/1.0/raw-timesheet.json',
                success: function (response) {
                    var dataModel = {"2": [
                        {"issueKey": "PRBSTBDFPS-45", "issueName": "PART2 : Partner Detail form for view mode", "timeSpent": 8}
                    ], "4": [
                        {"issueKey": "PRBSTBDFPS-20", "issueName": "PART2 : Implement partner invitation table", "timeSpent": 8}
                    ], "5": [
                        {"issueKey": "PRBSTBDFPS-59", "issueName": "PART2: Check logic for working with empty objects (fields = null)", "timeSpent": 8}
                    ]};
                    chrome.tabs.getSelected(null, function (tab) {
                        chrome.tabs.sendMessage(tab.id, {channel: 'fillWebtimeButtonClicked', dataModel: dataModel}, function (response) {
                            console.log(response.farewell);
                        });
                    });
                },
                error: function (error) {
                    console.log('error',error);
                }
            });

//            this.doInCurrentTab(function () {
////                console.log("filldoINCurTab scope");
//                chrome.tabs.sendMessage(null, {test: 'test'}, function(){});
//            })
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
        chrome.tabs.getSelected(null, function (tab) {
            console.log(tab);
//            chrome.tabs.sendMessage(tab.id, {channel: 'pageActionOnClicked'}, function (response) {
//                console.log(response.farewell);
//            });
        });
    }

};

var QUERY = 'kittens';

var kittenGenerator = {
    /**
     * Flickr URL that will give us lots and lots of whatever we're looking for.
     *
     * See http://www.flickr.com/services/api/flickr.photos.search.html for
     * details about the construction of this URL.
     *
     * @type {string}
     * @private
     */
    searchOnFlickr_: 'https://secure.flickr.com/services/rest/?' +
        'method=flickr.photos.search&' +
        'api_key=90485e931f687a9b9c2a66bf58a3861a&' +
        'text=' + encodeURIComponent(QUERY) + '&' +
        'safe_search=1&' +
        'content_type=1&' +
        'sort=interestingness-desc&' +
        'per_page=20',

    /**
     * Sends an XHR GET request to grab photos of lots and lots of kittens. The
     * XHR's 'onload' event is hooks up to the 'showPhotos_' method.
     *
     * @public
     */
    requestKittens: function () {
        var req = new XMLHttpRequest();
        req.open("GET", this.searchOnFlickr_, true);
        req.onload = this.showPhotos_.bind(this);
        req.send(null);
    },

    /**
     * Handle the 'onload' event of our kitten XHR request, generated in
     * 'requestKittens', by generating 'img' elements, and stuffing them into
     * the document for display.
     *
     * @param {ProgressEvent} e The XHR ProgressEvent.
     * @private
     */
    showPhotos_: function (e) {
        var kittens = e.target.responseXML.querySelectorAll('photo');
        for (var i = 0; i < kittens.length; i++) {
            var img = document.createElement('img');
            img.src = this.constructKittenURL_(kittens[i]);
            img.setAttribute('alt', kittens[i].getAttribute('title'));
            document.body.appendChild(img);
        }
    },

    /**
     * Given a photo, construct a URL using the method outlined at
     * http://www.flickr.com/services/api/misc.urlKittenl
     *
     * @param {DOMElement} A kitten.
     * @return {string} The kitten's URL.
     * @private
     */
    constructKittenURL_: function (photo) {
        return "http://farm" + photo.getAttribute("farm") +
            ".static.flickr.com/" + photo.getAttribute("server") +
            "/" + photo.getAttribute("id") +
            "_" + photo.getAttribute("secret") +
            "_s.jpg";
    }
};

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    mainObj.addDomHandlers();
    mainObj.actionButtonClicked();
});
