
(() => {
  let styleElement = null;

  function applyHiddenClasses(classes, isEnabled) {

    if (styleElement) {
      styleElement.remove();
      styleElement = null;
    }

    
    if (!isEnabled || !classes || classes.length === 0) {
      return;
    }

    styleElement = document.createElement('style');
    styleElement.setAttribute('data-extension', 'remove-component');
    
    const cssRules = classes.map(className => 
      `.${className} { display: none !important; }`
    ).join('\n');
    
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
  }

  function loadAndApplySettings() {
    chrome.storage.local.get(['removedClasses', 'extensionEnabled'], (result) => {
      const classes = result.removedClasses || [];
      const isEnabled = result.extensionEnabled || false;
      applyHiddenClasses(classes, isEnabled);
    });
  }

  function initializeContentScript() {
    loadAndApplySettings();
  }


  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      loadAndApplySettings();
    }
  });


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
  } else {
    initializeContentScript();
  }

 
  const observer = new MutationObserver(() => {
    loadAndApplySettings();
  });

 
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
})();