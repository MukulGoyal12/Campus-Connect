import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    rollno: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    hosteller: {
      type: String,
      enum: ["hostel", "day"],
      required: true,
    },
    profilepic: { type: String, default: "default.jpeg" },
    request: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
    fulfilledRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
    ],
    verified: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
