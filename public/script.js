
const socket = io();
let username = "";
let room = "";

function joinChat() {
  username = document.getElementById("username").value.trim();
  room = document.getElementById("room").value.trim();
  if (username && room) {
    document.getElementById("chat").style.display = "block";
    document.getElementById("joinForm").style.display = "none";
    socket.emit("joinRoom", { username, room });
  }
}

socket.on("userList", (users) => {
  const userList = document.getElementById("users");
  userList.innerHTML = users
    .map((user) => `<li>${user.username}</li>`)
    .join("");
});

socket.on("message", (data) => {
  const messages = document.getElementById("messages");
  messages.innerHTML += `<p><strong>${data.username}:</strong> ${data.message}</p>`;
});

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("message", { message });
    messageInput.value = "";
  }
}
