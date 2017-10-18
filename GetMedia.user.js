// ==UserScript==
// @name         AbemaTV Get Media
// @namespace    http://TakeAsh.net/
// @version      0.1.201710190530
// @description  download media.json
// @author       take-ash
// @match        https://abema.tv/timetable
// @match        https://abema.tv/timetable/channels/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  var channels = [
    'anime24', 'midnight-anime', 'oldtime-anime', 'family-anime', 'new-anime',
    'drama', 'abema-special',
  ];
  var getMediaPanel = document.createElement('div');
  getMediaPanel.id = 'getMedia';
  getMediaPanel.style.position = 'fixed';
  getMediaPanel.style.top = '0.5em';
  getMediaPanel.style.right = '0';
  getMediaPanel.style.padding = '4px';
  getMediaPanel.style.zIndex = 16;
  getMediaPanel.style.background = 'rgba(255, 255, 255, 0.6)';
  setTimeout(
    function() { document.body.appendChild(getMediaPanel); },
    4000
  );
  var channelSelecter = document.createElement('select');
  for (var i = 0, chennel; (chennel = channels[i]); ++i) {
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode(chennel));
    channelSelecter.appendChild(opt);
  }
  getMediaPanel.appendChild(channelSelecter);
  var getMediaButton = document.createElement('button');
  getMediaButton.appendChild(document.createTextNode('Get Media'));
  getMediaButton.addEventListener('click', getMedia, false);
  getMediaPanel.appendChild(getMediaButton);

  function getDate(dateAdd) {
    var d = new Date();
    d.setTime(d.getTime() + dateAdd * 24 * 60 * 60 * 1000);
    var year = d.getFullYear().toString();
    var month = ('0' + (d.getMonth() + 1).toString()).substr(-2);
    var day = ('0' + d.getDate().toString()).substr(-2);
    return year + month + day;
  }

  function encodeQueryData(data) {
    let ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
    return ret.join('&');
  }

  function onSuccess(data) {
    var docNew = window.open('', '_blank').document;
    docNew.open('text/html; charset="UTF-8"');
    docNew.write('<html><body><pre>\n' + data + '</pre></body></html>');
    docNew.close();
  }

  function onError(error) {
    alert(error);
  }

  function onTimeout() {
    onError(new Error('Request timed out'));
  }

  function getMedia() {
    var apiUrl = 'https://api.abema.io/v1/media?';
    var token = localStorage.getItem('abm_token');
    var result = { data: null, error: null };
    var dateFrom = getDate(0);
    var dateTo = getDate(14);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            onSuccess(JSON.stringify(data, null, 2));
          } else {
            onError(data.message);
          }
        } catch (e) {
          onError(e);
        }
      }
    };
    xhr.onerror = onError;
    xhr.ontimeout = onTimeout;
    xhr.open('GET', apiUrl + encodeQueryData({
      'dateFrom': dateFrom,
      'dateTo': dateTo,
      'channelIds': channels[channelSelecter.selectedIndex],
    }));
    xhr.timeout = 8000;
    xhr.setRequestHeader('Authorization', 'bearer ' + token);
    xhr.send();
  }
})();