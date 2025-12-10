export const SUPPORTED_LANGUAGES = {
    'en': {
        name: 'English'
    },
    'ar': {
        name: 'Standard Arabic',
        instruction: 'Use Arabic script for the translation.'
    },
    'darija': {
        name: 'Moroccan Arabic dialect (Darija)',
        instruction: 'Use Arabic script for the translation.'
    },
    'fr': {
        name: 'French'
    },
    'es': {
        name: 'Spanish'
    },
    'zh': {
        name: 'Chinese',
        instruction: 'Use Chinese characters for the translation.'
    }
};

export const buildTranslationPrompt = (text, sourceLang, targetLang) => {
    const sourceLangConfig = SUPPORTED_LANGUAGES[sourceLang];
    const targetLangConfig = SUPPORTED_LANGUAGES[targetLang];
    
    const sourceLanguage = sourceLangConfig?.name || sourceLang;
    const targetLanguage = targetLangConfig?.name || targetLang;
    
    let prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.`;
    
    if (targetLangConfig?.instruction) {
        prompt += ` ${targetLangConfig.instruction}`;
    }
    
    prompt += ` Only provide the translation, nothing else.\n\nText: ${text}`;
    
    return prompt;
};

