const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allows connections from any origin (change for security)
    methods: ["GET", "POST"],
  },
});

// Serve static files from public directory
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  console.log(`🔗 New user connected: ${socket.id}`);

  // Joining a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Handling WebRTC Offer
  socket.on("offer", ({ offer, roomId }) => {
    console.log(`📨 Offer received from ${socket.id} for room: ${roomId}`);
    socket.to(roomId).emit("offer", { offer, roomId, sender: socket.id });
  });

  // Handling WebRTC Answer
  socket.on("answer", ({ answer, roomId }) => {
    console.log(`📨 Answer received for room: ${roomId}`);
    socket.to(roomId).emit("answer", { answer, roomId });
  });

  // Handling ICE Candidates
  socket.on("ice-candidate", ({ candidate, roomId }) => {
    console.log(`📨 ICE Candidate from ${socket.id} for room: ${roomId}`);
    socket.to(roomId).emit("ice-candidate", { candidate, roomId });
  });

  // Handle User Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    io.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on: http://localhost:${PORT}/index.html`);
});
