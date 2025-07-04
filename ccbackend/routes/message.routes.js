import { getMessagesBetweenUsers, saveMessage } from "../controllers/Message.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";

export function messageRoutes(app) {
  app.get("/api/messages/:senderId/:receiverId",isLoggedIn ,getMessagesBetweenUsers);
  app.post("/api/messages", isLoggedIn,saveMessage);
}
