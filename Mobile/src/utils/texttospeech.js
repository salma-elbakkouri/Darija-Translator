import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export const speak = async (text, options = {}) => {
  const { language = 'en-US', pitch = 1.0, rate = 1 } = options;

  if (Platform.OS === 'web') {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    const speechPhrase = new SpeechSynthesisUtterance(text);
    speechPhrase.pitch = pitch;
    speechPhrase.rate = rate;
    speechPhrase.lang = language;

    const speakWithVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // trying to find a voice that matches the language
      const langPrefix = language.split('-')[0]; // get 'ar' from 'ar-SA'
      const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix));
      
      if (matchingVoice) {
        speechPhrase.voice = matchingVoice;
        console.log('🎤 Using voice:', matchingVoice.name, matchingVoice.lang);
      } else {
        console.warn('⚠️ No voice found for', language);
      }

      window.speechSynthesis.speak(speechPhrase);
    };

    window.speechSynthesis.getVoices().length > 0 
      ? speakWithVoice() 
      : window.speechSynthesis.onvoiceschanged = speakWithVoice;

  } else {
    Speech.speak(text, { language, pitch, rate });
  }
};