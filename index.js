// server.js (Backend with Express and Socket.io)
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
require("dotenv").config();

let users = {}; // { socket.id: { username, room } }

io.on("connection", (socket) => {
  // Handle joining a room
  socket.on("joinRoom", ({ username, room, password }) => {
    if (!username || !room || !password) return;

    socket.join(room);
    users[socket.id] = { username, room };

    // Notify the user who joined
    socket.emit("message", {
      username: "Server",
      message: `Welcome to room ${room}, ${username}!`,
    });

    // Notify others in the room
    socket.to(room).emit("message", {
      username: "Server",
      message: `${username} has joined the room`,
    });

    // Send updated user list in the room
    io.to(room).emit(
      "userList",
      Object.values(users).filter((user) => user.room === room)
    );
  });

  // Handle receiving messages
  socket.on("message", (data) => {
    const user = users[socket.id];
    if (user && data.message) {
      io.to(user.room).emit("message", {
        username: user.username,
        message: data.message,
      });
      // Stop typing for the user who sent the message
      socket.to(user.room).emit("stopTyping", { username: user.username });
    }
  });

  // Handle typing event
  socket.on("typing", ({ username, room }) => {
    socket.to(room).emit("typing", { username });
  });

  // Handle stop typing event
  socket.on("stopTyping", ({ username, room }) => {
    socket.to(room).emit("stopTyping", { username });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      // Notify others in the room
      socket.to(user.room).emit("message", {
        username: "Server",
        message: `${user.username} has left the room`,
      });

      // Remove user from list
      delete users[socket.id];

      // Update user list
      io.to(user.room).emit(
        "userList",
        Object.values(users).filter((u) => u.room === user.room)
      );
    }
  });
});

// Serve homepage
app.get("/", (req, res) => {
  res.render("index");
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
