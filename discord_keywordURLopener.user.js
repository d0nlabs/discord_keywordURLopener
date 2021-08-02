// ==UserScript==
// @name         discord keyword URL opener
// @namespace    http://tampermonkey.net/
// @version      0.1
// @license      GNU AGPLv3
// @author       d0nb1t#2670 (discord). Additional code and revision by libre#9269 (discord). Based on original code from "Discord Keyword Notification" script by jcunews.
// @description  Displays a browser notification whenever a user mentions specific textual word(s) in a channel. The script must be manually edited to configure the keywords.
// @match        *://discordapp.com/*
// @match        *://discord.com/*
// @grant        none
// ==/UserScript==
var back = 0;
(function() {

  //=== CONFIGURATION BEGIN ===

  //maximum duration to display notification
  var notificationDuration = 5000; //in milliseconds. 1000ms = 1 second. 0 or less = disable auto-dismiss notification.

  //keywords are specified as regular expression. note: the "g" flag is required.
  //quick tutorial: https://www.codeproject.com/Articles/199382/Simple-and-Useful-JavaScript-Regular-Expression-Tu
  //full tutorial: https://www.regular-expressions.info/tutorial.html

  //var keywordsRegexp = /3060\ ?ti|3070|3080|3090/gi;
  var keywordsRegexp = /6700X?T?|6800X?T?|6900X?T?|3060|3070|3080|3090/gi;

  //=== CONFIGURATION END ===

  var observer, observing, selector = '[class^="scrollerInner-"]', matches = [];
  function notify(keywords, nt) {
    nt = new Notification("Keyword Notification", {
      body: keywords.shift() + " mentions: " + keywords.join(", ")
    });
    setTimeout(function() {
      matches.shift();
    }, 250);

    if (notificationDuration > 0) {
      setTimeout(function() {
        nt.close();
      }, notificationDuration);
    }
  }

  function getMatches(s, r, m) {
    r = [];
    while (m = keywordsRegexp.exec(s)) r.push(m[0]);
    return r;
  }

  function check(records) {
    records.forEach(function(record) {
      record.addedNodes.forEach(function(node, m, s) {
        if (node &&
            node && (!node.previousElementSibling || !(/hasMore/).test(node.previousElementSibling.className)) &&
          // User not typing and message is an external link
          !node.querySelector('[class*="isSending-"]') && (node = node.querySelector('[class^="anchor-"]')) &&
          // Match class=anchor content
          ((m = getMatches(node.textContent)).length)
        ) {
            //m.unshift(Array.from(node.querySelectorAll("h2 span:first-child")).map(e => e.textContent.trim()).join(" "));
            m.unshift(Array.from(node.querySelectorAll('[class^="container-1ov-mD"]')).map(e => e.textContent.trim()).join(" "));
            if (!matches.includes(s = m.join("\uffff"))) {
                matches.push(s);
                node.click();
                notify(m);
          }
        }
      });
    });
  }

  function init(observerInit) {

    var scriptDesc = 'scriptDesc';
    const banner = document.createElement("div");
    banner.style.position = "fixed"; banner.style.bottom = "0px"; banner.style.zIndex = 100;
    banner.style.width = "100%"; banner.style.padding = "6px"; banner.style.alignItems = "center";
    banner.style.backgroundImage = "linear-gradient(to right, gray, black, gray)";
    banner.style.fontFamily = "Verdana"; banner.style.fontSize = "12px";
    banner.style.display = "flex"; banner.style.flexDirection = "row"; banner.style.justifyContent = "space-between";

    const statusInfo = document.createElement("div");
    statusInfo.style.textAlign = "left"; statusInfo.style.paddingLeft = "10px";
    statusInfo.style.order = 0; statusInfo.style.flexBasis = "50%";
    statusInfo.innerText = 'Monitoring Channel';;
    var i = 0;
    const a = '••';
    const b = '···';
    var status = [];
    const status_size = 16;
    for (let i = 0; i < status_size; i++) {
      status.push(a);
    }
    const activityInfo = document.createElement("div");
    activityInfo.style.textAlign = "right"; activityInfo.style.paddingRight = "10px";
    activityInfo.style.order = 1; activityInfo.style.flexBasis = "50%";
    activityInfo.innerText = '';
    document.body.append(banner);
    banner.appendChild(statusInfo);
    banner.appendChild(activityInfo);

    observerInit = {childList: true, subtree: true};
    var currentPage = location.href;
    setInterval(function(ele) {
        // listen for changes
        if (currentPage != location.href) {
            // page has changed, set new page as 'current'
            currentPage = location.href;
            console.log("re-initializing..");
            observer.disconnect();
            observing = false;
        }

        if (location.pathname.substr(0, 10) === "/channels/") {
          if (!observing && (ele = document.querySelector(selector))) {
              observing = true;
              if (!observer) observer = new MutationObserver(check);
              observer.observe(ele, observerInit);
          }
        } else if (observing) {
            observer.disconnect();
            observing = false;
        }

        if (status[status.length - 1] == a && !back) {
            status[i] = b;
            i++;
            if (status[status.length - 1] == b) {
                back = 1;
                i = 0;
            }
        }
        if (status[status.length - 1] == b && back) {
            status[i] = a;
            i++;
            if (status[status.length - 1] == a) {
                back = 0;
                i = 0;
            }
        }
        activityInfo.innerHTML = status.join('');

    }, 25);
  }

  if (window.Notification) {
    Notification.requestPermission().then(function() {
      if (Notification.permission === "granted") {
        init();
      } else alert("Access to Browser Notification feature is not granted by user.\nKeyword notification can not be displayed.");
    });
  } else alert("Browser Notification feature is disabled or not supported.");

})();


String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}