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

io.on('connection', socket => {
  console.log('🔌 New connection:', socket.id);

  socket.on('join-room', roomId => {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('signal', ({ roomId, signal }) => {
    socket.to(roomId).emit('signal', { signal, from: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
    socket.broadcast.emit('user-left', socket.id);
  });
});

server.listen(5000, () => console.log('🚀 Server running on port 5000'));
