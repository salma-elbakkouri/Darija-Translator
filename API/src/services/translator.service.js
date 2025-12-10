import { getGeminiModel } from "../config/gemini.config.js";
import { buildTranslationPrompt } from "../config/prompts.config.js";

class TranslatorService {
    async translate(text, sourceLang, targetLang) {
        try {
            const model = getGeminiModel();
            const prompt = buildTranslationPrompt(text, sourceLang, targetLang);
            
            const result = await model.generateContent(prompt);
            const translatedText = result.response.text().trim();

            return {
                original: text,
                translated: translatedText,
                sourceLang,
                targetLang
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Translation service not available');
        }
    }
}

export default new TranslatorService();