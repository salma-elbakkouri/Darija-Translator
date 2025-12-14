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
const speakBtn = document.getElementById('speakBtn');
const togglePassword = document.getElementById('togglePassword');

let lastTimestamp = 0;

// Check for selected text periodically
function checkForSelectedText() {
  chrome.storage.local.get(['selectedText', 'timestamp'], (data) => {
    if (data.selectedText && data.timestamp > lastTimestamp) {
      lastTimestamp = data.timestamp;
      inputText.value = data.selectedText;
      updateCharCount();
      hideResult();
      
      // Clear the stored text after using it
      chrome.storage.local.remove(['selectedText']);
    }
  });
}

setInterval(checkForSelectedText, CONFIG.POLL_INTERVAL);

// Check login status
chrome.storage.local.get(['username', 'password'], (data) => {
  if (data.username && data.password) {
    showTranslatorScreen();
  }
});

// Login
loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!username || !password) {
    showError('loginError', 'Please enter username and password');
    return;
  }
  
  setLoading('login', true);
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      },
      body: JSON.stringify({ text: 'test', sourceLang: 'en', targetLang: 'darija' })
    });
    
    if (response.ok || response.status === 400) {
      chrome.storage.local.set({ username, password }, showTranslatorScreen);
    } else if (response.status === 401) {
      showError('loginError', 'Invalid username or password');
    } else {
      showError('loginError', 'Login failed');
    }
  } catch (error) {
    showError('loginError', 'Cannot connect to server');
  }
  
  setLoading('login', false);
});

// Logout
logoutBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['username', 'password'], () => {
    loginScreen.classList.remove('hidden');
    translatorScreen.classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  });
});

// Toggle password visibility
togglePassword.addEventListener('click', () => {
  const passwordInput = document.getElementById('password');
  const eyeIcon = togglePassword.querySelector('.eye-icon');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = 'icons/eye-open.png';
    eyeIcon.alt = 'Hide password';
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = 'icons/eye-closed.png';
    eyeIcon.alt = 'Show password';
  }
});

// Translate
translateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const source = sourceLang.value;
  const target = targetLang.value;
  
  if (!text) {
    showError('translateError', 'Please enter some text');
    return;
  }
  
  if (!source || !target) {
    showError('translateError', 'Please select languages');
    return;
  }
  
  if (source === target) {
    showError('translateError', 'Languages must be different');
    return;
  }
  
  setLoading('translate', true);
  hideError('translateError');
  
  chrome.storage.local.get(['username', 'password'], async (data) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(data.username + ':' + data.password)
        },
        body: JSON.stringify({ text, sourceLang: source, targetLang: target })
      });
      
      if (response.ok) {
        const result = await response.json();
        showResult(result.data.translated, target);
      } else if (response.status === 401) {
        showError('translateError', 'Session expired. Please login again.');
        setTimeout(() => logoutBtn.click(), 2000);
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

// Clear
clearBtn.addEventListener('click', () => {
  inputText.value = '';
  updateCharCount();
  hideResult();
  hideError('translateError');
});

// Input changes
inputText.addEventListener('input', updateCharCount);

sourceLang.addEventListener('change', hideResult);
targetLang.addEventListener('change', hideResult);

// Text-to-speech
speakBtn.addEventListener('click', () => {
  const text = resultText.textContent;
  
  if (!text) return;
  
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speakBtn.classList.remove('speaking');
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  const langMap = {
    'en': 'en-US',
    'ar': 'ar-SA',
    'darija': 'ar-MA',
    'fr': 'fr-FR',
    'es': 'es-ES'
  };
  
  utterance.lang = langMap[targetLang.value] || 'en-US';
  utterance.rate = 0.9;
  
  utterance.onstart = () => speakBtn.classList.add('speaking');
  utterance.onend = () => speakBtn.classList.remove('speaking');
  utterance.onerror = () => speakBtn.classList.remove('speaking');
  
  window.speechSynthesis.speak(utterance);
});

// Helper functions
function updateCharCount() {
  const length = inputText.value.length;
  charCount.textContent = length;
  clearBtn.classList.toggle('hidden', length === 0);
  charCount.parentElement.classList.toggle('char-counter-warning', length > 450);
}

function showTranslatorScreen() {
  loginScreen.classList.add('hidden');
  translatorScreen.classList.remove('hidden');
  sourceLang.value = 'en';
  targetLang.value = 'darija';
}

function showResult(translation, lang) {
  resultText.textContent = translation;
  
  if (lang === 'ar' || lang === 'darija') {
    resultText.setAttribute('dir', 'rtl');
  } else {
    resultText.removeAttribute('dir');
  }
  
  resultCard.classList.remove('hidden');
  resultPlaceholder.classList.add('hidden');
}

function hideResult() {
  resultCard.classList.add('hidden');
  resultPlaceholder.classList.remove('hidden');
}

function showError(errorId, message) {
  const errorContainer = document.getElementById(errorId);
  errorContainer.querySelector('.error-text').textContent = message;
  errorContainer.classList.remove('hidden');
}

function hideError(errorId) {
  document.getElementById(errorId).classList.add('hidden');
}

function setLoading(type, isLoading) {
  const btn = type === 'login' ? loginBtn : translateBtn;
  const text = document.getElementById(`${type}BtnText`);
  const spinner = document.getElementById(`${type}Spinner`);
  
  btn.disabled = isLoading;
  text.classList.toggle('hidden', isLoading);
  spinner.classList.toggle('hidden', !isLoading);
}

