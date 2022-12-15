var attachedTabs = {};
var version = "1.0";

chrome.debugger.onDetach.addListener(onDetach);

chrome.browserAction.onClicked.addListener(function(tab) {
  var tabId = tab.id;
  var debuggeeId = {tabId:tabId};

  if (attachedTabs[tabId] == "screenshotting")
    return;

  if (!attachedTabs[tabId]) {
    chrome.debugger.attach(debuggeeId, version, onAttach.bind(null, debuggeeId));
  }
  else if (attachedTabs[tabId]) {
    captureScreenshot(debuggeeId);
  }
});

function onAttach(debuggeeId) {
  if (chrome.runtime.lastError) {
    alert(chrome.runtime.lastError.message);
    return;
  }

  var tabId = debuggeeId.tabId;
  attachedTabs[tabId] = "screenshotting";
  captureScreenshot(debuggeeId);
}

function captureScreenshot(debuggeeId) {
  chrome.debugger.sendCommand(
    debuggeeId, "Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false
    },
    (result) => {
      const image = new Image()
      image.src = `data:image/png;base64,${result.data}`
      chrome.debugger.detach(debuggeeId, onDetach.bind(null, debuggeeId))
    }
  );
}

function onDetach(debuggeeId) {
  var tabId = debuggeeId.tabId;
  delete attachedTabs[tabId];
}