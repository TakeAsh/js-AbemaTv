﻿// ==UserScript==
// @name         AbemaTV Get Media
// @namespace    http://TakeAsh.net/
// @version      0.1.202304102130
// @description  download media.json
// @author       take-ash
// @match        https://abema.tv/timetable
// @match        https://abema.tv/timetable/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=abema.tv
// @grant        none
// ==/UserScript==

(async (d) => {
  'use strict';

  await sleep(3000);
  const keyFavoriteChannels = 'GetMedia_FavoriteChannels';
  const favoriteChannels = loadFavoriteChannels();
  const style = d.createElement('style');
  style.textContent = [
    '#getMedia {',
    'position: fixed;',
    'top: 0.5em;',
    'right: 0;',
    'padding: 4px;',
    'z-index: 16;',
    'background-color: rgba(255, 255, 255, 0.6);',
    '}',
    '#buttonGetMedia {',
    'background-color: #e0e0e0;',
    'box-shadow: 0 0.3em 0 #808080;',
    'padding: 2px;',
    'margin: 0.3em;',
    '}',
    '#buttonGetMedia:active {',
    'transform: translateY(0.2em);',
    'box-shadow: 0 0.1em 0 #808080;',
    '}',
  ].join('\n');
  d.head.appendChild(style);
  const apiUrl = 'https://api.abema.io/v1';
  const token = localStorage.getItem('abm_token');
  const dateShift = 0;
  const getMediaPanel = d.createElement('div');
  getMediaPanel.id = 'getMedia';
  const divButton = d.createElement('div');
  divButton.style.textAlign = 'right';
  getMediaPanel.appendChild(divButton);
  const getMediaButton = d.createElement('button');
  getMediaButton.id = 'buttonGetMedia';
  getMediaButton.textContent = 'Get Media';
  getMediaButton.addEventListener('click', getMedia);
  divButton.appendChild(getMediaButton);
  const divSelect = d.createElement('div');
  getMediaPanel.appendChild(divSelect);
  const channelSelecter = d.createElement('select');
  channelSelecter.multiple = true;
  channelSelecter.size = 8;
  channelSelecter.addEventListener('change', saveFavoriteChannels);
  divSelect.appendChild(channelSelecter);
  const downloadLink = d.createElement('a');
  downloadLink.href = '#';
  d.body.appendChild(getMediaPanel);
  onGetChannels(await callApi('media'));

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function loadFavoriteChannels() {
    const savedFavoriteChannels = localStorage.getItem(keyFavoriteChannels) || '';
    console.log(`saved FavoriteChannels:\n${savedFavoriteChannels}`);
    return (savedFavoriteChannels)
      .split(/\s+/)
      .reduce(
        (acc, cur) => {
          acc[cur] = true;
          return acc
        },
        {}
      );
  }

  function saveFavoriteChannels(event) {
    Array.from(channelSelecter.options)
      .forEach((opt) => {
        if (opt.selected) {
          favoriteChannels[opt.value] = true;
        } else {
          delete favoriteChannels[opt.value];
        }
      });
    localStorage.setItem(
      keyFavoriteChannels,
      Object.keys(favoriteChannels).sort().join('\n')
    );
  }

  function getDate(dateAdd) {
    dateAdd = dateAdd || 0;
    const date1 = new Date();
    date1.setTime(date1.getTime() + dateAdd * 24 * 60 * 60 * 1000);
    return [
      String(date1.getFullYear()),
      String(date1.getMonth() + 1).padStart(2, '0'),
      String(date1.getDate()).padStart(2, '0'),
    ].join('');
  }

  function getTime() {
    const now = new Date();
    return [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
    ].join('');
  }

  async function getMedia(event) {
    const selectedChannels = Array.from(channelSelecter.selectedOptions)
      .map((opt) => opt.value)
      .join(',');
    onGetMedia(await callApi(
      'media',
      { channelIds: selectedChannels }
    ));
  }

  function encodeQueryData(data) {
    return Object.keys(data)
      .sort()
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  }

  async function callApi(api, query) {
    query = query || {};
    query.dateFrom = getDate(dateShift);
    query.dateTo = getDate(dateShift + 14);
    const response = await fetch(
      `${apiUrl}/${api}?${encodeQueryData(query)}`,
      {
        method: 'GET',
        headers: new Headers({
          'Authorization': `bearer ${token}`,
        }),
        //mode: 'cors',
      }
    );
    return await response.json();
  }

  function onGetChannels(data) {
    data.channels
      .map((channel) => {
        channel.name = channel.name.replace('チャンネル', '').trim();
        return channel;
      }).sort((a, b) => a.name.localeCompare(b.name))
      .forEach((channel) => {
        const opt = d.createElement('option');
        opt.value = channel.id;
        opt.selected = !!favoriteChannels[channel.id];
        opt.textContent = channel.name;
        channelSelecter.appendChild(opt);
      });
  }

  function onGetMedia(data) {
    const fname = `${getDate(dateShift)}-${getTime()}.json`;
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { 'type': 'application/json; charset=utf-8', }
    );
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, fname);
    } else {
      downloadLink.download = fname;
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.click();
      window.URL.revokeObjectURL(downloadLink.href);
    }
  }
})(document);