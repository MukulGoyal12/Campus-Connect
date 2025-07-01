import jwt from "jsonwebtoken";

export function generateToken(user){
    return jwt.sign({email:user.email , id:user._id},process.env.JWT_KEY);
}