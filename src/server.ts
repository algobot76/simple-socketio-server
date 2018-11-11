import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as fs from "fs";
const DEFAULT_PORT: string = "3000";

export default class Server {
  private app: express.Application;
  private server: http.Server;
  private io: socketio.Server;
  private filePath: string;
  private port: string;
  private userCount: number = 0;

  constructor(filePath: string, port?: string) {
    if (port) {
      this.port = port;
    } else {
      this.port = DEFAULT_PORT;
    }
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketio(this.server);
    this.filePath = filePath;
  }

  public open(): void {
    this.server.listen(this.port, () => {
      console.log(`Listening at port: ${this.port}`);
    });

    this.server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.log("Address in use, retrying...");
        setTimeout(() => {
          this.server.close();
          this.server.listen(this.port);
        }, 1000);
      }
    });

    this.io.on("connection", socket => {
      this.userCount++;
      console.log(`${this.userCount} users are connected`);

      socket.on("add data", data => {
        console.log(`data: ${data}`);

        if (data) {
          const usrIpAddr: string = socket.handshake.address;

          fs.readFile(this.filePath, (err, currData) => {
            if (err) {
              console.log(err);
            }

            const json: any[] = JSON.parse(currData.toString());
            const entry: any = {
              usrIpAddr,
              message: data,
            };
            json.push(entry);

            fs.writeFile(this.filePath, JSON.stringify(json), err => {
              if (err) {
                console.log(err);
              }
            });

            socket.broadcast.emit("update", entry);
          });
        }
      });

      socket.on("disconnect", () => {
        this.userCount--;
        console.log(`${this.userCount} users are connected`);
      });
    });
  }

  public close(): void {
    console.log("Closing the server");
    this.io.close();
    this.server.close();
  }
}
