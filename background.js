
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    removedClasses: [],
    extensionEnabled: false
  });
});


chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content-script.js"]
  });
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    
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
