// ==UserScript==
// @name         Copy Title Button
// @namespace    https://www.TakeAsh.net/
// @version      0.1.202304091400
// @description  add Copy Title Button
// @author       TakeAsh
// @match        https://abema.tv/video/title/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=abema.tv
// @grant        none
// ==/UserScript==

javascript:
((d) => {
  'use strict';
  const style = d.createElement('style');
  style.textContent = [
    '.buttonCopyTitle {',
    'background-color: #d0d0d0;',
    'box-shadow: 0 0.3em 0 #a0a0a0;',
    'padding: 0.1em 0.4em;',
    'border-radius: 6px;',
    'position: relative;',
    'z-index: 10;',
    '}',
    '.buttonCopyTitle:active {',
    'transform: translateY(0.2em);',
    'box-shadow: 0 0.1em 0 #a0a0a0;',
    '}',
  ].join('\n');
  d.head.appendChild(style);
  const ul = getNodesByXpath('//*[@id="main"]//main//section/ul')[0];
  getNodesByXpath('.//a', ul).forEach((a) => {
    const button = d.createElement('button');
    button.textContent = 'Copy Title';
    button.classList.add('buttonCopyTitle');
    button.addEventListener(
      'click',
      (event) => {
        copyToClipboard(a.textContent);
        console.log(a.textContent);
      }
    );
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