import Server from "./server";

const filePath: string = "./db.json";
const port: string = "3000";

let server: Server;

beforeAll(done => {
  server = new Server(filePath, port);
  done();
});
