import { createNotification, fetchNotifications, markAsRead } from "../controllers/Notification.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";

export function notificationRoutes(app) {
  app.post("/api/notifications/create", isLoggedIn, createNotification);
  app.get("/api/notifications/myNotifications", isLoggedIn, fetchNotifications);
  app.patch("/api/notifications/markAsRead/:id", isLoggedIn, markAsRead);
}
