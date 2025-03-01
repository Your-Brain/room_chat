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

let users = {};

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("joinRoom", ({ username, room }) => {
    if (!username || !room) return;

    socket.join(room);
    users[socket.id] = { username, room };

    // Notify user about joining
    socket.emit("message", {
      username: "Server",
      message: `Welcome to room ${room}, ${username}!`,
    });

    // Notify others in the room
    socket
      .to(room)
      .emit("message", {
        username: "Server",
        message: `${username} has joined the room`,
      });

    // Send updated user list in the room
    io.to(room).emit(
      "userList",
      Object.values(users).filter((user) => user.room === room)
    );
  });

  socket.on("message", (data) => {
    const user = users[socket.id];
    if (user && data.message) {
      io.to(user.room).emit("message", {
        username: user.username,
        message: data.message,
      });
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      socket
        .to(user.room)
        .emit("message", {
          username: "Server",
          message: `${user.username} has left the room`,
        });
      delete users[socket.id];

      // Update user list
      io.to(user.room).emit(
        "userList",
        Object.values(users).filter((u) => u.room === user.room)
      );
    }
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
