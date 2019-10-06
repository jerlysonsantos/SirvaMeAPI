const Chat = require('../models/chatModel.js');

module.exports = (io) => {
  io.of('/chat')
    .on('connection', (socket) => {
      const chatRoom = socket.handshake.query.room;

      socket.join(`room-${chatRoom}`);

      socket.on('mensage', async (data) => {
        socket.to(`room-${chatRoom}`).emit('mensage', data);
        const chat = await Chat.find({ room: chatRoom });
        chat.messages.append(data);
        chat.save();
      });

      socket.on('disconnect', () => {
        socket.leave(`room-${chatRoom}`);
      });
    });
};
