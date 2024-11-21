import http from "http";
import app from "./index";
import dotenv from "dotenv";
import { mongoConnect } from "./config/DB-config";

dotenv.config();

const PORT = process.env.PORT || 8050;
const server = http.createServer(app);

/**
 * Starts the server and initializes the necessary configurations.
 *
 * @return {Promise<void>} A promise that resolves when the server is successfully started.
 */
async function startServer(): Promise<void> {
    try {
        await mongoConnect();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection error: ", error);
    }
}

startServer();