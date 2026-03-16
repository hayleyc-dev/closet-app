// HC Closet — background service worker

chrome.runtime.onInstalled.addListener(() => {
  // Open the side panel when the user clicks the extension icon
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});

// Route captureVisibleTab through background so it works regardless of
// which extension page calls it.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAPTURE_TAB") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ dataUrl });
      }
    });
    return true; // keep channel open for async sendResponse
  }
});
