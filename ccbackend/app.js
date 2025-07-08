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
import { notificationRoutes } from "./routes/notification.routes.js";
import { listingRoutes } from "./routes/listing.routes.js";

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
notificationRoutes(app);
listingRoutes(app);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);
  
  socket.on("join_room", (userId) => {
    socket.join(userId);
    socket.userId = userId; // Store userId on socket
    // console.log(`User ${userId} joined room`);
  });

  socket.on("join_chat", (data) => {
    socket.currentChatWith = data.otherUserId;
    // console.log(`User ${socket.userId} is now chatting with ${data.otherUserId}`);
  });

  socket.on("leave_chat", () => {
    socket.currentChatWith = null;
    // console.log(`User ${socket.userId} left current chat`);
  });

  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        message: data.message,
        isRead: false
      });
      await newMessage.save();
      
      io.to(data.receiverId).emit("receive_message", newMessage);
      
      const receiverSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.userId === data.receiverId);
      
      if (!receiverSocket || receiverSocket.currentChatWith !== data.senderId) {
        const unreadCount = await Message.countDocuments({
          receiver: data.receiverId,
          sender: data.senderId,
          isRead: false
        });
        
        io.to(data.receiverId).emit("unread_count_update", {
          senderId: data.senderId,
          count: unreadCount
        });
      }
      
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

  socket.on("messages_read", async (data) => {
    try {
      io.to(data.readerId).emit("messages_read", data);
    } catch (err) {
      console.error("Error handling messages_read:", err.message);
    }
  });

  socket.on("disconnect", () => {
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});