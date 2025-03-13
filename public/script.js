const socket = io();
let username = "";
let room = "";
let password = "";
let typingTimeout;

// Dynamically create typing status element
const typingDiv = document.createElement("div");
typingDiv.id = "typingStatus";
typingDiv.style.fontStyle = "italic";
typingDiv.style.color = "red";
typingDiv.style.padding = "5px";

// Add typing status below messages container
document.getElementById("messages").after(typingDiv);

// ✅ Function to Join Chat Room
function joinChat() {
  username = document.getElementById("username").value.trim();
  room = document.getElementById("room").value.trim();
  password = document.getElementById("password").value.trim();

  if (username && room && password) {
    // Hide join form, show chat window
    document.getElementById("chat").style.display = "block";
    document.getElementById("joinForm").style.display = "none";

    // Emit join room event
    socket.emit("joinRoom", { username, room, password });
  } else {
    alert("Please fill all fields to join the chat.");
  }
}

// ✅ Handle updated user list
socket.on("userList", (users) => {
  const userList = document.getElementById("users");
  userList.innerHTML = users
    .map((user) => `<li>${user.username}</li>`)
    .join("");
});

// ✅ Handle receiving and displaying messages
socket.on("message", (data) => {
  const messages = document.getElementById("messages");
  const messageElement = document.createElement("div");

  // Set inner content
  messageElement.innerHTML = `<p><strong class="username">${data.username}:</strong> ${data.message}</p>`;

  // Styling based on sender
  if (data.username === "Server") {
    messageElement.classList.add("server-message");
  } else if (data.username === username) {
    messageElement.classList.add("user-message", "self"); // Self messages
  } else {
    messageElement.classList.add("user-message", "other"); // Other user messages
  }

  // Append and scroll
  messages.appendChild(messageElement);
  messageElement.scrollIntoView({ behavior: "smooth" });

  // Clear typing status when message received
  if (data.username !== username) {
    typingDiv.innerText = "";
  }
});

// ✅ Function to Send Message
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (message) {
    socket.emit("message", { username, message }); // Send message
    messageInput.value = ""; // Clear input
    socket.emit("stopTyping", { username, room }); // Stop typing event
  }
}

// ✅ Detect typing and manage typing events
document.getElementById("messageInput").addEventListener("input", () => {
  socket.emit("typing", { username, room }); // Typing start

  clearTimeout(typingTimeout); // Clear existing timeout
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", { username, room }); // Stop typing after 2 sec idle
  }, 2000);
});

// ✅ Show typing indicator for others
socket.on("typing", (data) => {
  if (data.username !== username) {
    typingDiv.innerText = `${data.username} is typing...`;
  }
});

// ✅ Clear typing indicator
socket.on("stopTyping", (data) => {
  if (data.username !== username) {
    typingDiv.innerText = "";
  }
});

// ✅ Handle sending message on Enter key press
document
  .getElementById("messageInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent newline
      sendMessage(); // Send message
    }
  });
