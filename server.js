const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const db = require('./src/database/db');
require('dotenv').config();

const router = require('./router');

const PORT = process.env.PORT || 3000;

db.sync().then({});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('view engine', 'ejs');

app.use('/', router);

let users = {};

io.on('connection', (socket) => {
  const user = socket.handshake.query.user;

  if(!users[user]) users[user] = [];

  users[user].push(socket.id);

  socket.broadcast.emit('broadcast', user + ' has connected');
  io.sockets.emit("online", user);

  socket.on('chat message', (msg, user) => {
      socket.broadcast.emit('chat message', {message: msg, user: user, class: 'chat_bubble__peer'});
  });

  socket.on('typing', (user) => {
    socket.broadcast.emit('isTyping', user);
  });

  socket.on('notTyping', (user) => {
    socket.broadcast.emit('isNotTyping', user);
  });

  socket.on('disconnect', (reason) => {
    users[user], (u) => u === socket.id;
    if(users[user].length === 0) {
      io.sockets.emit("offline", user);
      delete users[user];
    }
    socket.disconnect();
  });
});

server.listen(PORT, () => {
  console.log('Server is running on http://localhost:'+PORT);
});

