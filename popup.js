
let extensionEnabled = false;
let removedClasses = [];

const toggleSwitch = document.getElementById("toggleSwitch");
const statusText = document.getElementById("statusText");
const classNameInput = document.getElementById("className");
const removeBtn = document.getElementById("removeBtn");
const classesList = document.getElementById("classesList");
const clearAllBtn = document.getElementById("clearAllBtn");


document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});


function loadSettings() {
  chrome.storage.local.get(['removedClasses', 'extensionEnabled'], (result) => {
    removedClasses = result.removedClasses || [];
    extensionEnabled = result.extensionEnabled || false;
    
    updateUI();
    renderClassesList();
  });
}

function saveSettings() {
  chrome.storage.local.set({
    removedClasses: removedClasses,
    extensionEnabled: extensionEnabled
  });
}

function updateUI() {

  if (extensionEnabled) {
    toggleSwitch.classList.add('active');
    statusText.textContent = 'Extensao Ativa';
    statusText.className = 'status-text active';
  } else {
    toggleSwitch.classList.remove('active');
    statusText.textContent = 'Extensao Inativa';
    statusText.className = 'status-text inactive';
  }
  

  removeBtn.disabled = !extensionEnabled;
  classNameInput.disabled = !extensionEnabled;
  
  if (!extensionEnabled) {
    removeBtn.style.opacity = '0.5';
    classNameInput.style.opacity = '0.5';
  } else {
    removeBtn.style.opacity = '1';
    classNameInput.style.opacity = '1';
  }
}


function renderClassesList() {
  if (removedClasses.length === 0) {
    classesList.innerHTML = '<div style="text-align: center; color: #999; font-size: 12px;">Nenhuma classe removida</div>';
    return;
  }
  
  classesList.innerHTML = removedClasses.map((className, index) => `
    <div class="class-item">
      <span>.${className}</span>
      <button class="remove-class-btn" data-index="${index}" title="Remover esta classe">×</button>
    </div>
  `).join('');
  

  classesList.querySelectorAll('.remove-class-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeClassFromList(index);
    });
  });
}

function removeClassFromList(index) {
  removedClasses.splice(index, 1);
  saveSettings();
  renderClassesList();
}

function setupEventListeners() {

  toggleSwitch.addEventListener('click', () => {
    extensionEnabled = !extensionEnabled;
    updateUI();
    saveSettings();
  });
  

  removeBtn.addEventListener('click', () => {
    if (!extensionEnabled) return;
    
    const className = classNameInput.value.trim();
    if (!className) {
      alert('Por favor, digite o nome de uma classe CSS');
      return;
    }
    
    // Adiciona à lista se ainda não existe
    if (!removedClasses.includes(className)) {
      removedClasses.push(className);
      saveSettings();
      renderClassesList();
    }
    
    // Aplica remoção imediata na aba atual
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (cls) => {
          // Remove elementos existentes
          document.querySelectorAll("." + cls).forEach(el => el.remove());
          
          // Força atualização do content script em vez de criar novo style
          if (typeof window.updateRemoveComponentStyles === 'function') {
            window.updateRemoveComponentStyles();
          }
        },
        args: [className]
      });
    });
    
    classNameInput.value = '';
  });
  

  classNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      removeBtn.click();
    }
  });
  

  clearAllBtn.addEventListener('click', () => {
    if (removedClasses.length === 0) return;
    
    if (confirm('Tem certeza que deseja remover todas as classes da lista?')) {
      removedClasses = [];
      saveSettings();
      renderClassesList();
    }
  });
}