// Constants

const fs = require("fs");
const path = require("path");
const http = require("http");
require('dotenv').config();

const httpProtocol = process.env.HTTPS == "true" ? "https" : "http";
const socketProtocol = process.env.HTTPS == "true" ? "wss" : "ws";

// Web Server
const express = require("express");
//const bodyParser = require('body-parser')
const server = express();
server.use(express.json());
server.use(express.urlencoded({extended:false}));
server.set("view engine", "ejs");

//const urlParser = require("parseurl");
//const cookieParser = require("cookie-parser");

const serverPath = __dirname;
const publicPath = path.join(serverPath + '/public');
server.set("views", path.join(publicPath + '/ejs'))
server.set("/partials", path.join(publicPath + '/partials'))
server.use("/css", express.static(path.join(publicPath + '/css')));
server.use("/js", express.static(path.join(publicPath + '/js')));
server.use("/images", express.static(path.join(publicPath + '/images')));

server.get("/", function(req, res) {
    //if (authenticate(req, res)) return;

    //res.render(`index`, {host: `https://${host}`});
    res.render("index");
    res.end();
});

/*(require('socket.io')(server)).on("connection", function(socket) {
    socket.on("authenticate", function(token) {
  
    });

    socket.emit("init", "hi");
});*/

const httpServer = http.createServer(server);
httpServer.listen(process.env.PORT_LOCAL);
console.log("listening on " + process.env.PORT_LOCAL);
