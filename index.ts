import Server from "./src/server";

const port: string = "3000";
const filePath: string = "./db.json";

const server = new Server(filePath, port);
server.open();
