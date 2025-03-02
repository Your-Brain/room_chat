const socket = io();
let username = "";
let room = "";
let password = "";

function joinChat() {
  username = document.getElementById("username").value.trim();
  room = document.getElementById("room").value.trim();
  password = document.getElementById("password").value.trim();
  if (username && room && password) {
    document.getElementById("chat").style.display = "block";
    document.getElementById("joinForm").style.display = "none";
    socket.emit("joinRoom", { username, room, password });
  }
}

// Update user list
socket.on("userList", (users) => {
  const userList = document.getElementById("users");
  userList.innerHTML = users
    .map((user) => `<li>${user.username}</li>`)
    .join("");
});

// Display messages correctly
socket.on("message", (data) => {
  const messages = document.getElementById("messages");
  const messageElement = document.createElement("div");

  // Add username and message content
  messageElement.innerHTML = `<p><strong class="username">${data.username}:</strong> ${data.message}</p>`;

  if (data.username === "Server") {
    messageElement.classList.add("server-message");
  } else if (data.username === username) {
    messageElement.classList.add("user-message", "self"); // Current user's messages
  } else {
    messageElement.classList.add("user-message", "other"); // Other users' messages
  }

  messages.appendChild(messageElement);
  messageElement.scrollIntoView({ behavior: "smooth" });
});

// Send message function
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("message", { username, message }); // Ensure username is sent
    messageInput.value = "";
  }
}

// Send message on Enter key
document
  .getElementById("messageInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
