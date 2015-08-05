var express = require('express'),
  app = express();

var server = require('http').createServer(app);
server.listen(5000);

var path = require("path");

var appsLib = path.join(__dirname, '..', "lib");
var appsTest = path.join(__dirname, '..', "tests");

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "amd", "callback", "index.html"));
});

/////////////////////////// TESTING PURPOSE //////////////////////////
app.get('/subscribe', function(req, res) {
  res.sendFile(path.join(appsTest, "subscribe.html"));
});

app.get('/amd/callback', function(req, res) {
  res.sendFile(path.join(__dirname, "amd", "callback", "index.html"));
});
app.get('/amd/callback/main.js', function(req, res) {
  res.sendFile(path.join(__dirname, "amd", "callback", "main.js"));
});


app.get('/amd/promise', function(req, res) {
  res.sendFile(path.join(__dirname, "amd", "promise", "index.html"));
});

app.get('/amd/promise/main.js', function(req, res) {
  res.sendFile(path.join(__dirname, "amd", "promise", "main.js"));
});


app.get('/inline/promise', function(req, res) {
  res.sendFile(path.join(__dirname, "inlinescript", "promise", "index.html"));
});

app.get('/inline/callback', function(req, res) {
  res.sendFile(path.join(__dirname, "inlinescript", "callback", "index.html"));
});

///////////////////////////// Lib require //////////////////////////


app.use("*socket.io-1.3.4.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "lib", "socket.io-1.3.4.js"));
});


app.use("*bluebird.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "lib", "bluebird.js"));
});

app.use("*kuzzle.js", function(req, res, next) {
  res.sendFile(appsLib + "/kuzzle.js");
});


app.use("*require.js", function(req, res, next) {
  res.sendFile(path.join(__dirname, "amd", "require.js"));
});

app.use(function(req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  console.log("not found " + req.client._httpMessage.req.originalUrl);
  res.sendStatus(404);
});

module.exports = {
  server: server
};
