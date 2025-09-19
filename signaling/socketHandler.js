module.exports = io => {
  io.on('connection', socket => {
    socket.on('join-room', roomId => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('signal', ({ roomId, signal }) => {
      socket.to(roomId).emit('signal', { signal, from: socket.id });
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('user-left', socket.id);
    });
  });
};
