import jwt from "jsonwebtoken";
import UserModel from "../models/user-model.js";

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token || req.headers['Authorization']?.split(" ")[1] || req.headers['authorization']?.split(" ")[1];
  console.log(req.url+" "+req.originalUrl+" "+token);
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const user = await UserModel.findOne({ email: decoded.email }).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized access", error: err.message });
  }
};

export default isLoggedIn;
