chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  injectContentScript();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    injectContentScript(tabId);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'textSelected') {
    chrome.storage.local.set({ 
      selectedText: request.text,
      timestamp: Date.now()
    });
  }
  
  if (request.action === 'getSelectedText') {
    chrome.storage.local.get(['selectedText', 'timestamp'], (data) => {
      sendResponse({ 
        text: data.selectedText || '',
        timestamp: data.timestamp || 0
      });
    });
    return true;
  }
});

// Helper function to inject content script
function injectContentScript(tabId = null) {
  const injectIntoTab = (tab) => {
    if (!tab.url) return;
    
    const invalidProtocols = ['chrome:', 'chrome-extension:', 'about:', 'edge:', 'devtools:'];
    const isInvalidUrl = invalidProtocols.some(protocol => tab.url.startsWith(protocol));
    
    if (isInvalidUrl) return;
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).catch((error) => {
      console.log(`Could not inject into tab ${tab.id}:`, error.message);
    });
  };

  if (tabId) {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.log('Tab not found:', chrome.runtime.lastError);
        return;
      }
      injectIntoTab(tab);
    });
  } else {
    chrome.tabs.query({}, (tabs) => tabs.forEach(injectIntoTab));
  }
}