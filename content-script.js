
(() => {
  let styleElement = null;
  let observer = null;
  let isExtensionEnabled = false;
  let currentClasses = [];
  let debounceTimer = null;

  function applyHiddenClasses(classes, isEnabled) {
    // Remove estilo anterior
    if (styleElement) {
      styleElement.remove();
      styleElement = null;
    }
    
    // Remove styles temporários de outras execuções
    const tempStyles = document.querySelectorAll('style[data-extension="remove-component-temp"]');
    tempStyles.forEach(style => style.remove());

    if (!isEnabled || !classes || classes.length === 0) {
      currentClasses = [];
      isExtensionEnabled = false;
      stopObserving();
      return;
    }

    currentClasses = [...classes];
    isExtensionEnabled = true;

    styleElement = document.createElement('style');
    styleElement.setAttribute('data-extension', 'remove-component');
    
    const cssRules = classes.map(className => 
      `.${className} { display: none !important; }`
    ).join('\n');
    
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
    
    // Só inicia observação se necessário
    startObserving();
  }

  function loadAndApplySettings() {
    chrome.storage.local.get(['removedClasses', 'extensionEnabled'], (result) => {
      const classes = result.removedClasses || [];
      const enabled = result.extensionEnabled || false;
      applyHiddenClasses(classes, enabled);
    });
  }

  function startObserving() {
    if (observer || !isExtensionEnabled || currentClasses.length === 0) return;
    
    observer = new MutationObserver(debounce(() => {
      if (isExtensionEnabled && currentClasses.length > 0) {
        // Só reaplica se encontrar elementos que deveriam estar ocultos
        const visibleElements = currentClasses.some(className => 
          document.querySelector(`.${className}:not([style*="display: none"])`)
        );
        if (visibleElements && styleElement) {
          // Reforça apenas as regras CSS, sem recarregar storage
          const cssRules = currentClasses.map(className => 
            `.${className} { display: none !important; }`
          ).join('\n');
          styleElement.textContent = cssRules;
        }
      }
    }, 100));

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function debounce(func, wait) {
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(debounceTimer);
        func(...args);
      };
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(later, wait);
    };
  }

  // Storage listener - só atualiza quando há mudanças relevantes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.removedClasses || changes.extensionEnabled)) {
      loadAndApplySettings();
    }
  });

  // Inicialização otimizada
  function initialize() {
    loadAndApplySettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }

  // Cleanup quando a página é descarregada
  window.addEventListener('beforeunload', () => {
    stopObserving();
    clearTimeout(debounceTimer);
  }, { once: true });
})();