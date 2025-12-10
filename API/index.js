import "./src/config/env.js";
import Server from "./src/server.js";

function main() {
    const server = new Server();
    server.start();
}

main();