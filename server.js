const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const db = require('./src/database/db');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;

const { createUser, signinUser } = require('./src/controller/UserController');
const { JsonWebTokenError } = require('jsonwebtoken');

try {
  db.authenticate();
  console.log('Connection has been extablished successfully.');
  db.sync().then({});
} catch(error) {
  console.error('Unable ot connect to the database:', error);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/auth/signin', (req, res) => {
  res.sendFile(__dirname + '/public/pages/login.html');
});
app.post('/auth/signin', (req, res) => {
  signinUser(req.body.username, req.body.password)
  .then(response => {
    jwt.verify(response, process.env.JWT_SECRET_ACCESS_TOKEN, (err, user) => {
      res.status(200)
      .cookie("token", response, {
        httpOnly: true,
        user: user,
      })
      .json({
        success: true,
      });
    });
  })
  .catch(error => {
    res.status(401).json({
      success: false,
      message: error.message
    });
  });
});
app.get('/chat', tokenCheck, (req, res) => {
  res.sendFile(__dirname + '/public/pages/chat.html');
});
app.get('/auth/register', (req, res) => {
  res.sendFile(__dirname + '/public/pages/register.html');
});
app.post('/auth/register', (req, res) => {
  createUser(req.body.username, req.body.password)
  .then(result => {
    console.log(result);
    res.json({
      success: true,
      id: result
    }).status(201)
  })
  .catch(error => {
      console.error(error);
      res.json({
        success: false,
        message: 'something went wrong'
      }).status(500)
    });
});


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
  console.log('listening on *:'+PORT);
});


function tokenCheck(req, res, next) {
  if(req.headers['cookie'].includes('token')) {
    token = req.headers['cookie'].split('=')[1];
    jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN, (err, user) => {
      if(err) return res.sendStatus(403);
      req.user = user;
      // console.log(req.user);
      next();
    });
  } else {
    return res.sendStatus(401);
  }

}
