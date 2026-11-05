
import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import { randomUUID } from "crypto";
import { verifyToken } from "./middleware/auth.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Demo users
const USERS = [
  { userId: 1, name: "Ada", email: "ada@threadbase.dev", password: "password" },
  { userId: 2, name: "Linus", email: "linus@threadbase.dev", password: "password" },
];

// POST /auth/login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};

  const found = USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!found) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { userId: found.userId, name: found.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    accessToken,
    user: { userId: found.userId, name: found.name },
  });
});

// Protected HTTP route
app.get("/api/me", verifyToken, (req, res) =>
  res.json({ user: req.user })
);

// TASK 1: Create HTTP server and attach Socket.io
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// TASK 2: Authenticate sockets using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    socket.data.user = payload;

    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// TASK 3: Rooms and broadcasting
io.on("connection", (socket) => {
  console.log("User connected:", socket.data.user.name);

  // Join a chat room
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
  });

  // Receive and broadcast chat messages
  socket.on("chat:message", ({ roomId, text }) => {
    const message = {
      id: randomUUID(),
      text,
      user: socket.data.user.name,
      timestamp: Date.now(),
    };

    // Send to EVERYONE in the room, including sender
    io.to(roomId).emit("chat:message", message);
  });
});

// TASK 1: Start HTTP server (not app.listen)
const PORT = process.env.PORT ?? 3001;

httpServer.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
  console.log("POST /auth/login");
  console.log("Socket.io: ready");
});
