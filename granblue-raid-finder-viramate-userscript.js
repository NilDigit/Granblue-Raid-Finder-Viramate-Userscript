// ==UserScript==
// @name         Granblue Raid Finder DMCAmaid API
// @namespace    https://github.com/NilDigit
// @version      1.0
// @description  Granblue Raid Finder Viramate Userscript (Tampermonkey)
// @author       NilDigit
// @include      http://gbf-raidfinder.aikats.us/
// @include      https://gbf-raidfinder.la-foret.me/
// @updateURL    https://raw.githubusercontent.com/NilDigit/Granblue-Raid-Finder-Viramate-Userscript/master/granblue-raid-finder-viramate-userscript.js
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    unsafeWindow.apiUrl = "chrome-extension://fgpokpknehglcioijejfeebigdnbnokj/content/api.html";
    unsafeWindow.isApiLoaded = false;
    unsafeWindow.apiHost = null;
    unsafeWindow.pendingRequests = {};
    unsafeWindow.nextRequestId = 1;
    unsafeWindow.modified = "modified";
    window.addEventListener("message", onMessage, false);
    tryLoadApi();
    setInterval(function () {
        var ele = document.querySelectorAll("li.gbfrf-tweet");
        if (ele) {
            for (var i = 0, len = ele.length; i < len; i++) {
                if (ele[i]) {
                    if (!ele[i].classList.contains(unsafeWindow.modified)) {
                        ele[i].addEventListener("click", function () {
                            var code = this.getAttribute("data-raidid");
                            console.log(code);
                            sendApiRequest({ type: "tryJoinRaidDirectly", raidCode: code }, function (result) {
                                console.log(result);
                                if (result != "ok") alert("Join result: " + result);
                            });
                        });
                        ele[i].classList.add(unsafeWindow.modified);
                    }
                }
            }
        }
    }, 100);

})();

function tryLoadApi() {
    console.log("Loading API");
    unsafeWindow.apiHost = document.createElement('iframe');
    unsafeWindow.apiHost.setAttribute("id", "api_host");
    unsafeWindow.apiHost.style.display = "none";
    unsafeWindow.apiHost.addEventListener("load", onApiLoaded, false);
    unsafeWindow.apiHost.src = unsafeWindow.apiUrl;
    document.body.appendChild(unsafeWindow.apiHost);
};

function onApiLoaded() {
    console.log("API loaded");
    unsafeWindow.isApiLoaded = true;
};

function onMessage(evt) {
    if (evt.data.type !== "result")
        return;

    if (evt.data.result && evt.data.result.error) {
        console.log("Request failed", evt.data.result.error);
        return;
    } else {
        console.log("Got request response", evt.data);
    }

    var callback = unsafeWindow.pendingRequests[evt.data.id];
    if (!callback)
        return;

    callback(evt.data.result);
};

function sendApiRequest(request, callback) {
    if (!unsafeWindow.isApiLoaded) {
        console.log("API not loaded");
        callback({ error: "api not loaded" });
        return;
    }

    console.log("Sending request", request);
    var id = unsafeWindow.nextRequestId++;
    request.id = id;
    unsafeWindow.pendingRequests[id] = callback;

    unsafeWindow.apiHost.contentWindow.postMessage(
        request, "*"
    );
};
