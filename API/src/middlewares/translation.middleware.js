import { SUPPORTED_LANGUAGES } from '../config/prompts.config.js';

const MAX_TEXT_LENGTH = 5000;

export const validateTranslation = (req, res, next) => {
    const { text, sourceLang = 'en', targetLang = 'darija' } = req.body;
    
    if (!text || typeof text !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Text is required and must be a string'
        });
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Text cannot be empty'
        });
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({
            success: false,
            error: `Text is too long (max ${MAX_TEXT_LENGTH} characters)`
        });
    }

    const supportedLangCodes = Object.keys(SUPPORTED_LANGUAGES);
    
    if (!SUPPORTED_LANGUAGES[sourceLang]) {
        return res.status(400).json({
            success: false,
            error: `Unsupported source language: ${sourceLang}`,
            supportedLanguages: supportedLangCodes
        });
    }

    if (!SUPPORTED_LANGUAGES[targetLang]) {
        return res.status(400).json({
            success: false,
            error: `Unsupported target language: ${targetLang}`,
            supportedLanguages: supportedLangCodes
        });
    }

    if (sourceLang === targetLang) {
        return res.status(400).json({
            success: false,
            error: 'Source and target languages must be different'
        });
    }

    next();
};