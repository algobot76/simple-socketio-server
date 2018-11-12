import Server from "./server";
import * as io from "socket.io-client";

const filePath: string = "./db.json";
const port: string = "3000";

let server: Server;
let client: SocketIOClient.Socket;

beforeAll(done => {
  server = new Server(filePath, port);
  server.open();
  done();
});

afterAll(done => {
  server.close();
  done();
});

beforeEach(done => {
  client = io.connect(
    "http://localhost:3000/",
    { forceNew: true, transports: ["websocket"] },
  );
  client.on("connect", () => {
    done();
  });
});

afterEach(done => {
  if (client.connected) {
    client.disconnect();
  }
  done();
});

describe("server test", () => {
  test("Client can add data to the server", () => {
    const data: string = "hello";
    client.once("update", (message: string) => {
      expect(message).toBe(data);
    });
    client.send("add data", data);
  });
});
