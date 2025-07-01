import bcrypt from "bcryptjs";

export async function hashedPassword(password){
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}