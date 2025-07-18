import { postRequest, deleteRequest, fetchRequest, AcceptRequest, finalAcceptRequest, rejectRequest } from "../controllers/Request.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";

export function requestRoutes(app) {
  app.post("/api/request", postRequest);
  app.delete("/api/request/:id", deleteRequest);
  app.get("/api/fetchRequest" , fetchRequest);
  app.post("/api/acceptRequest/:requestid", AcceptRequest);
  app.put("/api/request/accept/:requestid", finalAcceptRequest);
  app.put("/api/request/reject/:requestid", rejectRequest);
}