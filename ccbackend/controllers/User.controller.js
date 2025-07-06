import bcrypt from "bcryptjs";
import userModel from "../models/user-model.js";
import { generateToken } from "../utils/generateTokens.js";
import { hashedPassword } from "../utils/hashPassword.js";
import { deleteFile } from "../utils/deleteFile.js";

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

    const token = generateToken(user);
    res.cookie("token", token);

    res.status(200).send("User registered successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).send("Error comparing passwords");

      if (result) {
        const token = generateToken(user);
        res.cookie("token", token);
        return res.status(200).send("Login successful");
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

    user.profilepic = req.file.filename;
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