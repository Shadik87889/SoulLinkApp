const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin (change for security)
    methods: ["GET", "POST"],
  },
});

app.use(express.static(__dirname)); // Serve the HTML file

io.on("connection", (socket) => {
  console.log(`🔗 New user connected: ${socket.id}`);

  // Joining a Room
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

server.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
