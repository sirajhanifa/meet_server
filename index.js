// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Track rooms
const rooms = {};

io.on('connection', socket => {
  console.log('🔌 New connection:', socket.id);

  // Join a room
  socket.on('join-room', roomId => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    // Notify all other participants
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // WebRTC signaling
  socket.on('signal', ({ roomId, signal, to }) => {
    if (to) {
      io.to(to).emit('signal', { signal, from: socket.id, roomId });
    } else {
      socket.to(roomId).emit('signal', { signal, from: socket.id });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      socket.to(roomId).emit('user-left', socket.id);

      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
);
