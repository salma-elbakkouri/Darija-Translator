import service from "../services/translator.service.js";
import { SUPPORTED_LANGUAGES } from "../config/prompts.config.js";

class TranslatorController {
    async translate(req, res, next) {
        try {
            const { text, sourceLang = 'en', targetLang = 'darija' } = req.body;

            const translationResult = await service.translate(text, sourceLang, targetLang);

            res.json({
                success: true,
                data: translationResult
            });
        } catch (error) {
            next(error);
        }
    }

    async getSupportedLanguages(req, res, next) {
        try {
            const languages = Object.fromEntries(
                Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => [code, { name: config.name }])
            );

            res.json({
                success: true,
                data: languages
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TranslatorController();