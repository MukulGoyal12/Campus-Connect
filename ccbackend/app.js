import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import path from "path";
import { Server } from "socket.io";
import http from "http";
import { userRoutes } from "./routes/user.routes.js";
import { requestRoutes } from "./routes/request.routes.js";
import "./db.js";
import Message from "./models/message-model.js";
import Notification from "./models/notification-model.js";
import { messageRoutes } from "./routes/message.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

userRoutes(app);
requestRoutes(app);
messageRoutes(app);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        message: data.message
      });
      await newMessage.save();
      io.to(data.receiverId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Error saving message:", err.message);
    }
  });

  socket.on("send_notification", async (data) => {
    try {
      const newNotif = new Notification({
        sender: data.senderId,
        receiver: data.receiverId,
        message: data.message
      });
      await newNotif.save();
      io.to(data.receiverId).emit("receive_notification", newNotif);
    } catch (err) {
      console.error("Error saving notification:", err.message);
    }
  });

  socket.on("disconnect", () => {
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});