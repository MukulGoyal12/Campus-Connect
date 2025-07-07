import { fetchListItems, listItem } from "../controllers/Listing.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";
import upload from "../utils/multerconfig.js";

export function listingRoutes(app){
    app.post("/api/listings",upload.single("image") , isLoggedIn, listItem);
    app.get("/api/allListings", isLoggedIn, fetchListItems);
}