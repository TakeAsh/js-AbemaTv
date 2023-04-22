// ==UserScript==
// @name         Copy Title Button bookmarklet
// @namespace    https://www.TakeAsh.net/
// @version      0.1.202304221820
// @description  add Copy Title Button
// @author       TakeAsh
// @match        https://abema.tv/video/title/*
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/PrepareElement.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=abema.tv
// @grant        none
// ==/UserScript==

javascript:
(async (d) => {
  'use strict';
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = d.createElement('script');
    script.onload = resolve;
    script.onerror = reject;
    script.src = src;
    d.head.appendChild(script);
  });
  await loadScript('https://www.takeash.net/js/modules/PrepareElement.js');
  addStyle({
    '.buttonCopyTitle': {
      backgroundColor: '#d0d0d0',
      boxShadow: '0 0.3em 0 #a0a0a0',
      padding: '0.1em 0.4em',
      borderRadius: '6px',
      position: 'relative',
      zIndex: '10',
    },
    '.buttonCopyTitle:active': {
      transform: 'translateY(0.2em)',
      boxShadow: '0 0.1em 0 #a0a0a0',
    },
  });
  const ul = getNodesByXpath('//*[@id="main"]//main//section/ul')[0];
  getNodesByXpath('.//a', ul).forEach((a) => {
    const button = prepareElement({
      tag: 'button',
      textContent: 'Copy Title',
      classes: ['buttonCopyTitle'],
      events: {
        'click': (event) => {
          copyToClipboard(a.textContent);
          console.log(a.textContent);
        },
      },
    });
    a.parentNode.insertBefore(button, a);
  });

  function getNodesByXpath(xpath, context) {
    const itr = d.evaluate(
      xpath,
      context || d,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    const nodes = [];
    let node = null;
    while (node = itr.iterateNext()) {
      nodes.push(node);
    }
    return nodes;
  }

  function copyToClipboard(text) {
    if (!d.execCommand) { return false; } /* execCommand is deprecated */
    const textarea = d.createElement('textarea');
    textarea.textContent = text;
    d.body.appendChild(textarea);
    textarea.select();
    d.execCommand('copy');
    d.body.removeChild(textarea);
    return true;
  }
})(document);