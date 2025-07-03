import { postRequest, deleteRequest, fetchRequest, AcceptRequest } from "../controllers/Request.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";

export function requestRoutes(app) {
  app.post("/api/request", isLoggedIn, postRequest);
  app.delete("/api/request/:id", isLoggedIn, deleteRequest);
  app.get("/api/fetchRequest", isLoggedIn , fetchRequest);
  app.post("/api/acceptRequest/:requestid", isLoggedIn, AcceptRequest);
}