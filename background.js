
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    removedClasses: [],
    extensionEnabled: false
  });
});

chrome.action.onClicked.addListener((tab) => {
  // Verifica se a URL é válida antes de injetar script
  if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('moz-extension://')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-script.js"]
    }).catch(err => {
      console.log('Script injection failed:', err);
    });
  }
});

// Remove listener desnecessário que estava vazio
// chrome.tabs.onUpdated.addListener() removido para economizar recursos

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['removedClasses', 'extensionEnabled'], (result) => {
      sendResponse(result);
    });
    return true; 
  }
});
