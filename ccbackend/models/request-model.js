import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  task: {
    type: String,
    required: true,
  },
  offer: {
    type: String,
    required: true,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  accepter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RequestModel = mongoose.model("Request", RequestSchema);

export default RequestModel;
