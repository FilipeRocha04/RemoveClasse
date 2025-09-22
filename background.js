
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    removedClasses: [],
    extensionEnabled: false
  });
});

chrome.action.onClicked.addListener((tab) => {

  if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('moz-extension://')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-script.js"]
    }).catch(err => {
      console.log('Script injection failed:', err);
    });
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['removedClasses', 'extensionEnabled'], (result) => {
      sendResponse(result);
    });
    return true; 
  }
});
