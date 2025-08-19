import jwt from "jsonwebtoken";

export function generateToken({email,id}){
    return  jwt.sign({email,id},process.env.JWT_KEY);
}