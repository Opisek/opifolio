// Constants

const fs = require("fs");
const path = require("path");
const http = require("http");
require('dotenv').config();

const config = JSON.parse(fs.readFileSync("config.json"));

// Web Server
const express = require("express");
//const bodyParser = require('body-parser')
const server = express();
server.use(express.json());
server.use(express.urlencoded({extended:false}));
server.set("view engine", "ejs");

//const urlParser = require("parseurl");
//const cookieParser = require("cookie-parser");

// File System
const serverPath = __dirname;
const publicPath = path.join(serverPath + '/public');
server.set("views", path.join(publicPath + '/ejs'))
server.set("/partials", path.join(publicPath + '/partials'))
server.use("/css", express.static(path.join(publicPath + '/css')));
server.use("/js", express.static(path.join(publicPath + '/js')));
server.use("/images", express.static(path.join(publicPath + '/images')));

// Proxy
server.set("trust proxy", "loopback, linklocal, uniquelocal")

server.get("/", (req, res) => {
    //if (authenticate(req, res)) return;

    //res.render(`index`, {host: `https://${host}`});
    res.render("index");
    res.end();
});

for (const redirect of config.redirects) for (const page of redirect.pages) {
    console.log("hi");
    server.get(`/${page}/:sub1?/:sub2?/`, (req, res) => res.redirect(`${redirect.url}${req.params.sub1 == undefined ? '' : `/${req.params.sub1}${req.params.sub2 == undefined ? '' : `/${req.params.sub2}`}`}`));
}

server.get("*", (req, res) => {
    res.status(404);
    res.render("404", { host: `${req.protocol}://${req.hostname}/` });
    res.end();
});

/*(require('socket.io')(server)).on("connection", function(socket) {
    socket.on("authenticate", function(token) {
  
    });

    socket.emit("init", "hi");
});*/

const httpServer = http.createServer(server);
httpServer.listen(process.env.PORT);
console.log("listening on " + process.env.PORT);
