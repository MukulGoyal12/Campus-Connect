import { fetchUser, login, logout, register, uploadImage } from "../controllers/User.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";
import upload from "../utils/multerconfig.js";

export function userRoutes(app){
    app.post("/api/register", register );
    app.post("/api/login", login );
    app.get("/api/logout", isLoggedIn ,logout );
    app.get("/api/user", isLoggedIn , fetchUser);
    app.post('/api/upload',upload.single("image"),isLoggedIn, uploadImage)
}