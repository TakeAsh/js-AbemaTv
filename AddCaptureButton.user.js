// ==UserScript==
// @name         AbemaTV Add Capture Button
// @namespace    http://www.TakeAsh.net/
// @version      0.1.201712270100
// @description  add capture button
// @author       TakeAsh
// @match        https://abema.tv/now-on-air/*
// @match        https://abema.tv/channels/*
// @match        https://abema.tv/video/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  var captureWidthMax = 1920;
  var captureHeightMax = 1200;
  var panelCapture = document.createElement('div');
  panelCapture.id = 'capture';
  panelCapture.style.position = 'fixed';
  panelCapture.style.top = '0';
  panelCapture.style.right = '0';
  panelCapture.style.zIndex = 256;
  panelCapture.style.background = 'rgba(255, 255, 255, 0.6)';
  setTimeout(
    function() { document.body.appendChild(panelCapture); },
    1000
  );
  var buttonCapture = document.createElement('button');
  buttonCapture.appendChild(document.createTextNode('Cap'));
  buttonCapture.addEventListener('click', capture, false);
  panelCapture.appendChild(buttonCapture);
  var canvasCapture = document.createElement('canvas');
  canvasCapture.width = captureWidthMax;
  canvasCapture.height = captureHeightMax;
  var contextCapture = canvasCapture.getContext('2d', { antialias: false, depth: false, });
  var linkDownload = document.createElement('a');
  linkDownload.href = '#';

  function capture() {
    buttonCapture.disabled = true;
    var video = null;
    var videos = document.getElementsByTagName('video');
    for (var i = 0; i < videos.length; ++i) {
      if (!!videos[i].src) {
        video = videos[i];
        break;
      }
    }
    contextCapture.drawImage(video, 0, 0);
    var imgData = contextCapture.getImageData(0, 0, captureWidthMax, captureHeightMax);
    var w = captureWidthMax;
    while (--w >= 0) {
      var pos = w * 4;
      if (imgData.data[pos] || imgData.data[pos + 1] || imgData.data[pos + 2] || imgData.data[pos + 3]) {
        break;
      }
    }
    var h = captureHeightMax;
    while (--h >= 0) {
      var pos = h * captureWidthMax * 4;
      if (imgData.data[pos] || imgData.data[pos + 1] || imgData.data[pos + 2] || imgData.data[pos + 3]) {
        break;
      }
    }
    if (w < 0 || h < 0) {
      buttonCapture.disabled = false;
      return;
    }
    canvasCapture.width = w + 1;
    canvasCapture.height = h + 1;
    contextCapture.drawImage(video, 0, 0);
    var timerId = setTimeout(
      function() { buttonCapture.disabled = false; },
      1000
    );
    var elmImg = new Image();
    elmImg.onload = function() {
      panelCapture.appendChild(elmImg);
      linkDownload.click();
      elmImg.parentNode.removeChild(elmImg);
      buttonCapture.disabled = false;
      clearTimeout(timerId);
    };
    linkDownload.download = getDateTime() + '.png';
    linkDownload.href = elmImg.src = canvasCapture.toDataURL('image/png');
  }

  function getDateTime(dateAdd) {
    var d = new Date();
    d.setTime(d.getTime() + (dateAdd || 0) * 24 * 60 * 60 * 1000);
    var year = d.getFullYear().toString();
    var month = ('0' + (d.getMonth() + 1).toString()).substr(-2);
    var day = ('0' + d.getDate().toString()).substr(-2);
    var hour = ('0' + d.getHours().toString()).substr(-2);
    var min = ('0' + d.getMinutes().toString()).substr(-2);
    var second = ('0' + d.getSeconds().toString()).substr(-2);
    return year + month + day + hour + min + second;
  }
})();
