javascript: (function () {
  var basePath = '//main/div/div/div[2]/div/div/';
  var title = getStringByXpath(basePath + 'h2', document);
  var span = getStringByXpath(basePath + 'p[3]', document);
  location.pathname.match(/channels\/([^\/]+)\//);
  var channel = 'https://abema.tv/now-on-air/' + RegExp.$1;
  var summary = title + '\n' + span + '\n' + channel + '\n' + location.href;
  prompt(summary, summary);

  function getStringByXpath(xpath, context) {
    var sRet = "";
    var nodeTmp = document.evaluate('string(' + xpath + ')', context, null, XPathResult.STRING_TYPE, null);
    if (nodeTmp) {
      sRet = nodeTmp.stringValue;
    }
    return sRet;
  }
})();
