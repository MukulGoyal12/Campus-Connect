import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { userRoutes } from "./routes/user.routes.js";
import "./db.js";
import { requestRoutes } from "./routes/request.routes.js";
import path from "path";

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

app.get("/", (req, res, next) => {
  try {
    res.send("Server running...");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRoutes(app);
requestRoutes(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Running at ${PORT}`);
});
