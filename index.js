import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./router/userRouter.js";
import { Server } from 'socket.io';
import http from 'http'
import path, { dirname } from 'path';
import {WebSocketServer } from 'ws';

dotenv.config();

// app config
const app = express();
const server = http.createServer(app)

const port = process.env.PORT || 8000;

// db config
mongoose.connect(process.env.MONGO_URL);

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

// listen
// app.listen(port, () => console.log(`Listening on local host ${port}`));
app.listen(port, () => console.log(`Listening on local host ${port}`));

//chat
const wss = new WebSocketServer({ server });


wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message, isBinary) {
    console.log(message.toString(), isBinary);

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocketServer.OPEN) {
        client.send(message.toString());
      }
    });
  });
});
