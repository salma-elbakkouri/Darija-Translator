const API_BASE_URL = 'http://localhost:3000/api';

const loginScreen = document.getElementById('loginScreen');
const translatorScreen = document.getElementById('translatorScreen');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const resultCard = document.getElementById('resultCard');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const resultText = document.getElementById('resultText');

chrome.storage.local.get(['username', 'password'], (data) => {
  if (data.username && data.password) {
    showTranslatorScreen();
  }
});

loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!username || !password) {
    showError('loginError', 'Please enter username and password');
    return;
  }
  
  setLoading('login', true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      },
      body: JSON.stringify({
        text: 'test',
        sourceLang: 'en',
        targetLang: 'darija'
      })
    });
    
    if (response.ok || response.status === 400) {
      chrome.storage.local.set({ username, password }, () => {
        showTranslatorScreen();
      });
    } else if (response.status === 401) {
      showError('loginError', 'Invalid username or password');
    } else {
      showError('loginError', 'Login failed. Please try again.');
    }
  } catch (error) {
    showError('loginError', 'Cannot connect to server. Make sure API is running.');
  }
  
  setLoading('login', false);
});

logoutBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['username', 'password'], () => {
    loginScreen.classList.remove('hidden');
    translatorScreen.classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  });
});

translateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const source = sourceLang.value;
  const target = targetLang.value;
  
  if (!text) {
    showError('translateError', 'Please enter some text');
    return;
  }
  
  if (!source || !target) {
    showError('translateError', 'Please select source and target languages');
    return;
  }
  
  if (source === target) {
    showError('translateError', 'Source and target languages must be different');
    return;
  }
  
  setLoading('translate', true);
  hideError('translateError');
  
  chrome.storage.local.get(['username', 'password'], async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(data.username + ':' + data.password)
        },
        body: JSON.stringify({
          text,
          sourceLang: source,
          targetLang: target
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        showResult(result.data.translated, target);
      } else if (response.status === 401) {
        showError('translateError', 'Session expired. Please login again.');
        setTimeout(() => {
          logoutBtn.click();
        }, 2000);
      } else {
        const error = await response.json();
        showError('translateError', error.message || 'Translation failed');
      }
    } catch (error) {
      showError('translateError', 'Cannot connect to server');
    }
    
    setLoading('translate', false);
  });
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  charCount.textContent = '0';
  clearBtn.classList.add('hidden');
  hideError('translateError');
  resultCard.classList.add('hidden');
  resultPlaceholder.classList.remove('hidden');
});

inputText.addEventListener('input', () => {
  const length = inputText.value.length;
  charCount.textContent = length;
  
  if (length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  
  if (length > 450) {
    charCount.parentElement.classList.add('char-counter-warning');
  } else {
    charCount.parentElement.classList.remove('char-counter-warning');
  }
});

sourceLang.addEventListener('change', () => {
  resultCard.classList.add('hidden');
  resultPlaceholder.classList.remove('hidden');
});

targetLang.addEventListener('change', () => {
  resultCard.classList.add('hidden');
  resultPlaceholder.classList.remove('hidden');
});

function showTranslatorScreen() {
  loginScreen.classList.add('hidden');
  translatorScreen.classList.remove('hidden');
  sourceLang.value = 'en';
  targetLang.value = 'darija';
}

function showResult(translation, lang) {
  resultText.textContent = translation;
  
  // Set RTL for Arabic/Darija
  if (lang === 'ar' || lang === 'darija') {
    resultText.setAttribute('dir', 'rtl');
  } else {
    resultText.removeAttribute('dir');
  }
  
  resultCard.classList.remove('hidden');
  resultPlaceholder.classList.add('hidden');
}

function showError(errorId, message) {
  const errorContainer = document.getElementById(errorId);
  const errorText = errorContainer.querySelector('.error-text');
  errorText.textContent = message;
  errorContainer.classList.remove('hidden');
}

function hideError(errorId) {
  document.getElementById(errorId).classList.add('hidden');
}

function setLoading(type, isLoading) {
  if (type === 'login') {
    const btn = loginBtn;
    const text = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    
    btn.disabled = isLoading;
    text.classList.toggle('hidden', isLoading);
    spinner.classList.toggle('hidden', !isLoading);
  } else if (type === 'translate') {
    const btn = translateBtn;
    const text = document.getElementById('translateBtnText');
    const spinner = document.getElementById('translateSpinner');
    
    btn.disabled = isLoading;
    text.classList.toggle('hidden', isLoading);
    spinner.classList.toggle('hidden', !isLoading);
  }
}