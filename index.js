const express = require('express');
const app = express();
const path = require('path');

const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);

const io = socketio(server);

io.on("connection", function(socket) {
   socket.on("send-location", function(data) {
      io.emit("receive-location", { id: socket.id, ...data });
   });
   console.log("connected");

   socket.on("disconnect", function() {
      io.emit("user-disconnected", socket.id);
   });
});

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
   res.render("index");
});

server.listen(3000, () => {
   console.log('Server is running on port 3000');
});
