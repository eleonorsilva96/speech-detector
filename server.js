const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {formatMessage} = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

    const botName = 'Speech Detector';


// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, perfil }) => {
    const user = userJoin(socket.id, username, perfil);

    socket.join(user);

    // Send to current user
    socket.emit('welcomeMessage', formatMessage(botName, `Bem-vindo(a) <span class="user">${user.username}</span>, o que o(a) traz cá hoje?`));
    socket.emit('profile', user.perfil);

    // Send message to all, but not you
    socket.broadcast    //imprime para todos menos o utilizador
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send message to all
    io.emit('Users', {
      //room: user.room,
      users: getUsers()
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.emit('Users', {
        //room: user.room,
        users: getUsers()
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
