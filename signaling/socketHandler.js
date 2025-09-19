module.exports = io => {
  io.on('connection', socket => {
    socket.on('join-room', roomId => {
      socket.join(roomId);
      const otherUser = [...io.sockets.adapter.rooms.get(roomId)].find(id => id !== socket.id);
      if (otherUser) {
        socket.to(otherUser).emit('user-joined', socket.id); // 👈 send peer ID
      }
    });


    socket.on('signal', ({ roomId, signal }) => {
      socket.to(roomId).emit('signal', { signal, from: socket.id });
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('user-left', socket.id);
    });
  });
};
