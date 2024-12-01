const { Server } = require("socket.io");
require('dotenv').config();

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_SOCKET_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
    // Define socket events
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};
