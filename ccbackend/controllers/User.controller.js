import bcrypt from "bcryptjs";
import userModel from "../models/user-model.js";
import { generateToken } from "../utils/generateTokens.js";
import { hashedPassword } from "../utils/hashPassword.js";
import jwt from 'jsonwebtoken'
import { deleteFile } from "../utils/deleteFile.js";
import cloudinary from "../utils/cloudinary.js";
import sendMail from "../utils/sendMail.js";

function capitalizeFirstAndLastWord(str) {
  if (!str) return "";

  const words = str.split(" ");
  if (words.length === 1) {
    return words[0][0].toUpperCase() + words[0].slice(1);
  }

  words[0] = words[0][0].toUpperCase() + words[0].slice(1);

  const lastIndex = words.length - 1;
  words[lastIndex] =
    words[lastIndex][0].toUpperCase() + words[lastIndex].slice(1);

  return words.join(" ");
}

export async function register(req, res) {
  try {
    const { name, email, password, rollno, year, hosteller } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(500).send("User already exists");
    }

    const mailToken= generateToken({email});
    const mailSent = await sendMail({ mailToken, email });

    if (!mailSent) {
      return res.status(500).json({ message: "Please provide valid E-Mail" });
    }

    const hash = await hashedPassword(password);

    const formattedName = capitalizeFirstAndLastWord(name);

    const user = await userModel.create({
      name: formattedName,
      email,
      rollno,
      year,
      hosteller,
      password: hash,
      profilepic: "default.jpeg",
    });

    const token = generateToken({email:user.email, id:user._id});

    res.cookie("token", token);

    res.status(200).json({"message":"User registered successfully" , "user":user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    const decoded = jwt.verify(token,process.env.JWT_KEY)
    if (!decoded || decoded.email !== email) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
} 

export async function login(req, res) {
  userModel.deleteMany();
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(404).send("User not found");
    }
    if(!user.verified) {
      return res.status(401).json({message:"Please verify your email before logging in."});
    }


    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).send("Error comparing passwords");
      if (result) {
        const token =  generateToken({email:user.email, id:user._id});
        console.log("inside login route",token);
        
        return res.status(200).json({message:"Login Succesful",token:token});
      } else {
        return res.status(401).send("Invalid credentials");
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).send("Logout successful");
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function fetchUser(req, res) {
  try {
   
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate("request");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function uploadImage(req, res) {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    

    if (user.profilepic && user.profilepic !== "default.jpeg") {
      deleteFile(user.profilepic);
    }

    const response = await cloudinary.uploader.upload(req.file.path);
    if (!response) {
      return res.status(500).json({ message: "Failed to upload image" });
    }
    console.log(response);
    

    user.profilepic=response.secure_url;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilepic: user.profilepic,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUserById(req, res) {
  try {
    let { id } = req.params;
    // console.log("Received id:", id); // check console me aa raha?

    let user = await userModel.findById(id)
    .select("-password")
    .populate("request")
    .populate("fulfilledRequests");
      if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const users = await userModel.find({ _id: { $ne: currentUserId } })
      .select("-password")
      .select("name email profilepic _id");
    
    return res.status(200).json({
      message: "Users fetched successfully",
      users: users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}