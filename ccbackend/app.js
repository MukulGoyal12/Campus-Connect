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
import { messageRoutes } from "./routes/message.routes.js";
import { listingRoutes } from "./routes/listing.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

userRoutes(app);
requestRoutes(app);
messageRoutes(app);
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
  
  socket.on("join_room", (userId) => {
    socket.join(userId);
    socket.userId = userId;
  });

  socket.on("join_chat", (data) => {
    socket.currentChatWith = data.otherUserId;
  });

  socket.on("leave_chat", () => {
    socket.currentChatWith = null;
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

const PORT = process.env.PORT || 3000;
server.listen(3000, () => {
  console.log(`Server running at ${PORT}`);
});