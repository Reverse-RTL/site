class TextReverserPro {
  constructor() {
    this.initElements();
    this.initEventListeners();
    this.loadHistory();
    this.updateWordCount();
  }

  initElements() {
    // Core elements
    this.inputBox = document.getElementById('input-box');
    this.outputBox = document.getElementById('output-box');
    this.reverseButton = document.getElementById('reverse-button');
    this.copyButton = document.getElementById('copy-button');
    this.saveButton = document.getElementById('save-button');
    this.exportInput = document.getElementById('export-input');
    this.exportOutput = document.getElementById('export-output');
    this.wordCount = document.getElementById('word-count');
    this.themeToggle = document.getElementById('theme-toggle');
    
    // History elements
    this.historyLink = document.getElementById('history-link');
    this.historyPage = document.getElementById('history-page');
    this.mainContent = document.getElementById('main-content');
    this.backButton = document.getElementById('back-button');
    this.historyList = document.getElementById('history-list');
    this.historySearch = document.getElementById('history-search');
    this.clearHistory = document.getElementById('clear-history');
  }

  initEventListeners() {
    // Core functionality
    this.inputBox.addEventListener('input', () => this.handleInput());
    this.reverseButton.addEventListener('click', () => this.reverseText());
    this.copyButton.addEventListener('click', () => this.copyToClipboard());
    this.saveButton.addEventListener('click', () => this.saveToHistory());
    this.exportInput.addEventListener('click', () => this.exportText(this.inputBox.value, 'original'));
    this.exportOutput.addEventListener('click', () => this.exportText(this.outputBox.textContent, 'reversed'));
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // History functionality
    this.historyLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.showHistoryPage();
    });
    this.backButton.addEventListener('click', () => this.showMainPage());
    this.historySearch.addEventListener('input', () => this.filterHistory());
    this.clearHistory.addEventListener('click', () => this.clearAllHistory());
  }

  handleInput() {
    this.reverseText();
    this.updateWordCount();
  }

  reverseText() {
    const reversed = this.inputBox.value
      .split('\n')
      .map(line => [...line].reverse().join(''))
      .join('\n');
    this.outputBox.textContent = reversed;
  }

  updateWordCount() {
    const text = this.inputBox.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    this.wordCount.textContent = `Words: ${count}`;
  }

  copyToClipboard() {
    if (!this.outputBox.textContent) return;
    
    navigator.clipboard.writeText(this.outputBox.textContent)
      .then(() => {
        this.copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          this.copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
      })
      .catch(err => console.error('Copy failed:', err));
  }

  saveToHistory() {
    if (!this.inputBox.value.trim() || !this.outputBox.textContent.trim()) return;
    
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      original: this.inputBox.value,
      reversed: this.outputBox.textContent
    };
    
    let history = JSON.parse(localStorage.getItem('reverserHistory') || [];
    history.unshift(historyItem);
    localStorage.setItem('reverserHistory', JSON.stringify(history));
    
    this.showToast('Saved to history!');
    this.renderHistoryItem(historyItem);
  }

  loadHistory() {
    const history = JSON.parse(localStorage.getItem('reverserHistory') || '[]');
    this.historyList.innerHTML = '';
    history.forEach(item => this.renderHistoryItem(item));
  }

  renderHistoryItem(item) {
    const date = new Date(item.timestamp);
    const timeString = date.toLocaleString();
    
    const itemElement = document.createElement('div');
    itemElement.className = 'history-item';
    itemElement.dataset.id = item.id;
    itemElement.innerHTML = `
      <div class="history-item-header">
        <div class="history-time">${timeString}</div>
        <button class="delete-item" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div class="history-content">
        <div class="history-original">
          <div class="history-label">Original Text</div>
          <div class="history-text">${item.original}</div>
        </div>
        <div class="history-reversed">
          <div class="history-label">Reversed Text</div>
          <div class="history-text">${item.reversed}</div>
        </div>
      </div>
    `;
    
    this.historyList.prepend(itemElement);
    
    // Add event listener to delete button
    itemElement.querySelector('.delete-item').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteHistoryItem(item.id);
    });
  }

  deleteHistoryItem(id) {
    let history = JSON.parse(localStorage.getItem('reverserHistory') || '[]');
    history = history.filter(item => item.id !== id);
    localStorage.setItem('reverserHistory', JSON.stringify(history));
    
    document.querySelector(`.history-item[data-id="${id}"]`)?.remove();
    this.showToast('Item deleted');
  }

  clearAllHistory() {
    if (!confirm('Are you sure you want to clear all history?')) return;
    
    localStorage.removeItem('reverserHistory');
    this.historyList.innerHTML = '';
    this.showToast('History cleared');
  }

  filterHistory() {
    const searchTerm = this.historySearch.value.toLowerCase();
    const items = this.historyList.querySelectorAll('.history-item');
    
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  }

  exportText(text, type) {
    if (!text.trim()) return;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reversed_text_${type}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast(`Exported ${type} text`);
  }

  showHistoryPage() {
    this.mainContent.style.display = 'none';
    this.historyPage.style.display = 'block';
  }

  showMainPage() {
    this.historyPage.style.display = 'none';
    this.mainContent.style.display = 'block';
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new TextReverserPro();
  
  // Check for saved theme
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // Focus input box on load
  app.inputBox.focus();
});

const feedbackLink = document.getElementById('feedback-link');
const feedbackPage = document.getElementById('feedback-page');
const closeFeedback = document.getElementById('close-feedback');
const feedbackForm = document.getElementById('feedback-form');

// Open feedback page
feedbackLink.addEventListener('click', (e) => {
  e.preventDefault();
  feedbackPage.style.display = 'flex';
});

// Close feedback page
closeFeedback.addEventListener('click', () => {
  feedbackPage.style.display = 'none';
});

// Form submission (basic version)
feedbackForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    type: document.getElementById('feedback-type').value,
    email: document.getElementById('user-email').value,
    text: document.getElementById('feedback-text').value
  };
  
  // For now, just show a thank you message
  alert("Thank you for your feedback! I'll review it personally.");
  feedbackPage.style.display = 'none';
  feedbackForm.reset();
  
  // In a real app, you would send this to a server
  // Example: sendToServer(formData);
});