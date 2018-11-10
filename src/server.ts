import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as fs from "fs";

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port: string = process.env.PORT || "3000";
const dbLocation: string = "./db.json";

let userCount: number = 0;

server.listen(port, () => {
  console.log(`Listening at port: ${port}`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.log("Address in use, retrying...");
    setTimeout(() => {
      server.close();
      server.listen(port);
    }, 1000);
  }
});

io.on("connection", socket => {
  userCount++;
  console.log(`${userCount} users are connected`);

  socket.on("add data", data => {
    console.log(`data: ${data}`);

    if (data) {
      fs.readFile(dbLocation, (err, currData) => {
        if (err) {
          console.log(err);
        }

        const json: any[] = JSON.parse(currData.toString());
        json.push({ message: data });

        fs.writeFile(dbLocation, JSON.stringify(json), err => {
          if (err) {
            console.log(err);
          }
        });
      });
    }
  });

  socket.on("disconnect", () => {
    userCount--;
    console.log(`${userCount} users are connected`);
  });
});
