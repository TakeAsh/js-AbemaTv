// ==UserScript==
// @name         AbemaTV Get Media
// @namespace    http://TakeAsh.net/
// @version      0.1.201910201630
// @description  download media.json
// @author       take-ash
// @match        https://abema.tv/timetable
// @match        https://abema.tv/timetable/channels/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  var apiUrl = 'https://api.abema.io/v1/';
  var token = localStorage.getItem('abm_token');
  var channels = [];
  var dateShift = 0;
  var dateFrom = getDate(dateShift);
  var dateTo = getDate(dateShift + 14);
  var getMediaPanel = document.createElement('div');
  getMediaPanel.id = 'getMedia';
  getMediaPanel.style.position = 'fixed';
  getMediaPanel.style.top = '0.5em';
  getMediaPanel.style.right = '0';
  getMediaPanel.style.padding = '4px';
  getMediaPanel.style.zIndex = 16;
  getMediaPanel.style.background = 'rgba(255, 255, 255, 0.6)';
  var channelSelecter = document.createElement('select');
  getMediaPanel.appendChild(channelSelecter);
  var getMediaButton = document.createElement('button');
  getMediaButton.id = 'buttonGetMedia';
  getMediaButton.style.backgroundColor = '#e0e0e0';
  getMediaButton.style.padding = '2px';
  getMediaButton.appendChild(document.createTextNode('Get Media'));
  getMediaButton.addEventListener('click', makeApiCaller('media', onGetMedia), false);
  getMediaPanel.appendChild(getMediaButton);
  var downloadLink = document.createElement('a');
  downloadLink.href = '#';
  setTimeout(makeApiCaller('media', onGetChannels), 1000); // 'channels' is blocked by CORS policy

  function getDate(dateAdd) {
    dateAdd = dateAdd || 0;
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

  function onGetChannels(data) {
    data.channels.forEach(function(channel) {
      var opt = document.createElement('option');
      opt.value = channel.id;
      opt.appendChild(document.createTextNode(channel.name.replace('チャンネル', '')));
      channelSelecter.appendChild(opt);
      channels.push(channel.id);
    });
    document.body.appendChild(getMediaPanel);
  }

  function onGetMedia(data) {
    var fname = dateFrom + '.' + channels[channelSelecter.selectedIndex] + '.json';
    var blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { 'type': 'application/json; charset=utf-8', }
    );
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, fname);
    } else {
      downloadLink.download = fname;
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.click();
    }
  }

  function onError(error) {
    alert(error);
  }

  function onTimeout() {
    onError(new Error('Request timed out'));
  }

  function makeApiCaller(api, callback) {
    return function() {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          try {
            var data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
              callback(data);
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
      xhr.timeout = 8000;
      var query = {
        'dateFrom': dateFrom,
        'dateTo': dateTo,
      };
      if (this && (this.id == 'buttonGetMedia')) {
        query.channelIds = channels[channelSelecter.selectedIndex];
      }
      xhr.open('GET', apiUrl + api + '?' + encodeQueryData(query));
      xhr.setRequestHeader('Authorization', 'bearer ' + token);
      xhr.send();
    };
  }
})();