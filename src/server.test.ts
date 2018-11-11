import Server from "./server";
import * as io from "socket.io-client";

const filePath: string = "./db.json";
const port: string = "3000";

let server: Server;

beforeAll(done => {
  server = new Server(filePath, port);
  done();
});

afterAll(done => {
  server.close();
  done();
});

test("Client can add data to the server", () => {
  const data: string = "hello";
  const client: SocketIOClient.Socket = io("http://localhost:3000/");
  client.connect();
  const observer: SocketIOClient.Socket = io("http://localhost:3000/");
  observer.connect();
  observer.on("update", (res: string) => {
    expect(res).toBe(data);
  });
  client.send("add data", data);
});
