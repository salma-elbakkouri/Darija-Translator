import express from "express";
import controller from "../controllers/translator.controller.js";
import { validateTranslation } from "../middlewares/translation.middleware.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/languages', controller.getSupportedLanguages);

const authMiddleware = new AuthMiddleware();

router.post('/translate',
    authMiddleware.authenticate,
    validateTranslation,
    controller.translate
);

export default router;