import "dotenv/config.js"
import { app, server } from "./index.js"

export const getServerOn = (port) => {
    server.listen(port, () => {
        console.log(`Server is running on port no: ${port}`);
    })
};