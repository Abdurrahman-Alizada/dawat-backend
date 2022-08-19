import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http'
import WebSocket, {WebSocketServer} from 'ws';
import userRouter from "./router/userRouter.js";
import groupRouter from './router/groupRouter.js';
import invitationRouter from './router/invitationRouter.js';

dotenv.config();

// app config
const app = express();
const server = http.createServer(app)

const port = process.env.PORT || 8000;

// db config
mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true, //this is the code I added that solved it all
});

// for checking that database is connected or not
mongoose.connection.once("open", () => {
  console.log("Database is connected");
});

// middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// api routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

app.use("/api/account", userRouter);
app.use("/api/group", groupRouter);
app.use("/api/group/invitations", invitationRouter);
// listen
// app.listen(port, () => console.log(`Listening on local host ${port}`));
server.listen(port, () => console.log(`Listening on local host ${port}`));

//chat
const wss = new WebSocketServer({server});

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message, isBinary) {
    console.log("the message is....",message.toString(), isBinary);

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World! from dawat-backend");
});
