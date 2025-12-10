import express from "express";
import cors from "cors";
import translatorRouter from "./routes/translator.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.middlewares();
        this.routes();
        this.errorHandling();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    routes() {
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: "Welcome to Darija Translator API",
                endpoints: {
                    translate: "POST /api/translate",
                    languages: "GET /api/languages"
                }
            });
        });
        this.app.use("/api", translatorRouter);
    }

    errorHandling() {
        this.app.use(errorHandler);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        })
    }

}

export default Server;