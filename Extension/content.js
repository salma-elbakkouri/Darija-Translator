// Listen for text selection and send selected text to background script
document.addEventListener('mouseup', () => {
  setTimeout(() => {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length > 0) {
      // Check if chrome.runtime is available
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
          chrome.runtime.sendMessage({
            action: 'textSelected',
            text: selectedText
          });
        } catch (error) {
          console.log('Extension context invalidated:', error);
        }
      }
    }
  }, 10);
});