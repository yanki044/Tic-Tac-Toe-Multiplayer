const http = require("http");
const express = require("express");
const app = require("express")();
const path = require("path");

app.use(express.static(path.join(__dirname + "/public")));

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
// game URL: localhost:9091
app.listen(9091, () => console.log("Listening on http port 9091"));
const websocketServer = require("websocket").server;
const { client } = require("websocket");
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening on 9090"));

//hashmap
const clients = [];
const games = {};

const wsServer = new websocketServer({
  httpServer: httpServer,
});
wsServer.on("request", (request) => {
  //TCP connection (someone trying to connect)
  const connection = request.accept(null, request.origin);
  //listen to events happening to this connection
  connection.on("open", () => console.log("opened!"));
  connection.on("close", () => {});
  //receive messages from the client
  connection.on("message", (message) => {
    const result = JSON.parse(message.utf8Data);
    wsServer.broadcast(message);
  });

  //generate a new clientId
  const clientId = guid();
  //create and find new connection
  clients.push(connection);

  wsServer.broadcast = function broadcast(message) {
    console.log(`brodcast data: ${JSON.stringify(message)}`);
    clients.forEach(function (client) {
      client.send(message.utf8Data);
    });
  };

  //send response back to client
  const payLoad = {
    method: "connect",
    clientId: clientId,
  };
  connection.send(JSON.stringify(payLoad));
});


//unique id
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

const guid = () =>
  (
    S4() +
    S4() +
    "-" +
    S4() +
    "-4" +
    S4().substr(0, 3) +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  ).toLowerCase();
