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

  /**
   * Constructor for the server class
   *
   * @param filePath - The file path of the json file to be written to.
   * @param port - The port used by the server.
   */
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

  /**
   * Opens the server
   */
  public open(): void {
    this.server.listen(this.port, () => {
      console.log(`Listening at port: ${this.port}`);
    });

    // Try to re-setup the server after 1000ms
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

            socket.emit("status", {
              status: 200,
              message: "Data has been successfully added",
            });
            socket.broadcast.emit("update", entry);
          });
        } else {
          // Data should not be empty
          socket.emit("status", { status: 400, message: "Invalid request" });
        }
      });

      socket.on("disconnect", () => {
        this.userCount--;
        console.log(`${this.userCount} users are connected`);
      });
    });
  }

  /**
   * Closes the server
   */
  public close(): void {
    console.log("Closing the server");
    this.io.close();
    this.server.close();
  }
}
