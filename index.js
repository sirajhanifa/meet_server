const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./db/connect.js');
const transcriptRoutes = require('./routes/transcriptRoutes.js');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
connectDB();
app.use('/api', transcriptRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store room participants
const rooms = {};

io.on('connection', socket => {
  console.log('🔌 New connection:', socket.id);

  socket.on('join-room', roomId => {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined room ${roomId}`);

    // Track participants
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);

    // Notify other participant
    const otherUser = rooms[roomId].find(id => id !== socket.id);
    if (otherUser) {
      socket.to(otherUser).emit('user-joined', socket.id);
    }
  });

  socket.on('signal', ({ signal, to }) => {
    io.to(to).emit('signal', { signal, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);

    // Remove from rooms
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }

    socket.broadcast.emit('user-left', socket.id);
  });
});

server.listen(5000, () => console.log('🚀 Server running on port 5000'));
