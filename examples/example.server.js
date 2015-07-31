var express = require('express'),
  app = express();

var server = require('http').createServer(app);
server.listen(5000);

var path = require("path");

var appsLib = path.join(__dirname, '..', "lib");

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "amd", "callback", "index.html"));
});

app.get('/promise', function(req, res) {
  res.sendFile(path.join(__dirname, "amd", "promise", "index.html"));
});

app.get('/inline', function(req, res) {
  res.sendFile(path.join(__dirname, "inlinescript", "index.html"));
});

app.use("/main.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "amd", "callback", "main.js"));
});

app.use("/promise/main.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "amd", "promise", "main.js"));
});

app.use("/promise/promise.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "amd", "promise", "main.js"));
});

app.use("/promise/bluebird.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "amd", "promise", "bluebird.js"));
});

app.use("/inline/main.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "inlinescript", "main.js"));
});

app.use("*kuzzle.js", function(req, res, next) {
  res.sendFile(appsLib + "/kuzzle.js");
});

app.use("*socket.io-1.3.4.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "lib", "socket.io-1.3.4.js"));
});

app.use("*require.js", function(req, res, next) {
  res.sendFile(path.join(__dirname,  "amd", "require.js"));
});

app.use(function(req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  console.log("not found " + req.client._httpMessage.req.originalUrl);
  res.sendStatus(404);
});
