import { postRequest, deleteRequest, fetchRequest, AcceptRequest, finalAcceptRequest, rejectRequest } from "../controllers/Request.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";

export function requestRoutes(app) {
  app.post("/api/request", isLoggedIn, postRequest);
  app.delete("/api/request/:id", isLoggedIn, deleteRequest);
  app.get("/api/fetchRequest" , fetchRequest);
  app.post("/api/acceptRequest/:requestid", isLoggedIn, AcceptRequest);
  app.put("/api/request/accept/:requestid", isLoggedIn, finalAcceptRequest);
  app.put("/api/request/reject/:requestid", isLoggedIn, rejectRequest);
}