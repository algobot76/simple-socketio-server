import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as fs from "fs";

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port: string = process.env.PORT || "3000";
const dbLocation: string = "../db.json";

server.listen(port, () => {
  console.log(`Listening at port: ${port}`);
});

io.on("connection", socket => {
  socket.on("add data", data => {
    const d: string = JSON.stringify(data["message"]);

    fs.readFile(dbLocation, (err, currData) => {
      const json: any[] = JSON.parse(currData.toString());
      json.push(data);

      fs.writeFile(dbLocation, JSON.stringify(json), err => {
        if (err) {
          console.log(err);
        }

        console.log("New data added to DB");
      });
    });
  });
});
