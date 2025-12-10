import { API_CONFIG, STORAGE_KEYS } from '../config/config.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

class TranslatorAPI {
  async getAuthHeader() {
    const credentials = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_CREDENTIALS);
    if (!credentials) return null;
    
    const { username, password } = JSON.parse(credentials);
    const base64 = btoa(`${username}:${password}`);
    return `Basic ${base64}`;
  }

  async login(username, password) {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSLATE}`;
    
    try {
      const base64 = btoa(`${username}:${password}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64}`,
        },
        body: JSON.stringify({ 
          text: 'test',
          sourceLang: 'en',
          targetLang: 'darija'
        }),
      });

      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid username or password',
        };
      }

      if (response.ok) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.AUTH_CREDENTIALS,
          JSON.stringify({ username, password })
        );
        
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: 'Login failed',
      };
    } catch (error) {
      console.error('Login Error:', error);
      return {
        success: false,
        error: error.message || 'Cannot connect to server',
      };
    }
  }

  async isAuthenticated() {
    try {
      const credentials = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_CREDENTIALS);
      return !!credentials;
    } catch (error) {
      return false;
    }
  }

  async logout() {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_CREDENTIALS);
  }

  async translate(text, sourceLang = 'en', targetLang = 'darija') {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSLATE}`;
    
    try {
      const authHeader = await this.getAuthHeader();
      
      if (!authHeader) {
        return {
          success: false,
          error: 'Not authenticated',
          requiresAuth: true,
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });

      const data = await response.json();

      if (response.status === 401) {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_CREDENTIALS);
        return {
          success: false,
          error: 'Session expired',
          requiresAuth: true,
        };
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Translation failed');
      }

      return {
        success: true,
        data: data.data.translated,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Cannot connect to server',
      };
    }
  }

  async getSupportedLanguages() {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LANGUAGES}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch languages');
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Cannot connect to server',
      };
    }
  }
}

export default new TranslatorAPI();