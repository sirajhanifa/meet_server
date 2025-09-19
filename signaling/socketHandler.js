// socketHandler.js
module.exports = io => {
  // Store participants in rooms
  const rooms = {};

  io.on('connection', socket => {
    console.log('🔌 New connection:', socket.id);

    // User joins a room
    socket.on('join-room', roomId => {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);

      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(socket.id);

      // Notify all other participants in the room
      socket.to(roomId).emit('user-joined', socket.id);
    });

    // WebRTC signaling
    socket.on('signal', ({ roomId, signal, to }) => {
      if (to) {
        // Direct signal to specific peer
        io.to(to).emit('signal', { signal, from: socket.id, roomId });
      } else {
        // Broadcast to all others in the room
        socket.to(roomId).emit('signal', { signal, from: socket.id });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Disconnected:', socket.id);

      for (const roomId in rooms) {
        if (rooms[roomId].includes(socket.id)) {
          // Remove from room
          rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

          // Notify remaining participants in the room
          socket.to(roomId).emit('user-left', socket.id);

          // Delete room if empty
          if (rooms[roomId].length === 0) delete rooms[roomId];
        }
      }
    });
  });
};
