// ==UserScript==
// @name         Google Calendar Button on Abema.tv
// @namespace    http://www.TakeAsh.net/
// @version      0.1.201605071700
// @description  Add Abema.tv program to Google Calendar
// @author       TakeAsh
// @match        https://abema.tv/channels/*/slots/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var googleCalendarButton = document.createElement('button');
    googleCalendarButton.innerHTML = 'Google Calendar';
    googleCalendarButton.style.color = '#FFFFFF';
    googleCalendarButton.style.backgroundColor = '#4040A0';
    googleCalendarButton.style.padding = '6px';
    googleCalendarButton.style.position = 'fixed';
    googleCalendarButton.style.top = '3em';
    googleCalendarButton.style.left = '1em';
    googleCalendarButton.addEventListener('click', addGoogleCalendar, false);
    document.body.appendChild(googleCalendarButton);

    function addGoogleCalendar() {
        var calendarUrl = 'https://calendar.google.com/calendar/event?';
        var spanPath = '//div[@id="main"]/div/div[3]/div/div[2]/div/section/div/div/p';
        var descriptionPath = '//div[@id="main"]/div/div[3]/div/div[2]/div/section[2]/div/p';
        var span = getStringByXpath(spanPath, document).split('~');
        var description = getStringByXpath(descriptionPath, document);
        var regDate = /(\d+)\u6708(\d+)\u65E5/;
        var regTime = /(\d+):(\d+)/;
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var date = now.getDate();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var span2 = [];
        for (var i = 0, t; (t = span[i]); ++i) {
            var m = [];
            if ((m = regDate.exec(t))) {
                month = m[1];
                date = m[2];
            }
            if ((m = regTime.exec(t))) {
                hours = m[1];
                minutes = m[2];
            }
            span2.push(packZero(year, 4) + packZero(month, 2) + packZero(date, 2) + 'T' + packZero(hours, 2) + packZero(minutes, 2) + '00');
        }
        location.pathname.match(/channels\/([^\/]+)\//);
        var channel = 'https://abema.tv/now-on-air/' + RegExp.$1;
        var params = EncodeQuery({
            action: 'TEMPLATE',
            text: document.title,
            dates: span2[0] + '/' + span2[1],
            location: channel,
            details: location.href + '\n' + description
        });
        window.open(calendarUrl + params, 'Google Calendar');

    }

    function getStringByXpath(xpath, context) {
        var sRet = "";
        var nodeTmp = document.evaluate('string(' + xpath + ')', context, null, XPathResult.STRING_TYPE, null);
        if (nodeTmp) {
            sRet = nodeTmp.stringValue;
        }
        return sRet;
    }

    function packZero(x, n) {
        var n1 = ("" + x).length;
        var n0 = (n > n1) ? n : n1;
        var z = "0";
        var d = "";
        while (n > 0) {
            if (n & 1) {
                d += z;
            }
            z += z;
            n >>= 1;
        }
        return (d + x).slice(-n0);
    }

    function EncodeQuery(data) {
        var ret = [];
        for (var d in data) {
            ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        }
        return ret.join("&");
    }
})();
