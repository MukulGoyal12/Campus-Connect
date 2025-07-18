import { request } from "http";
import RequestModel from "../models/request-model.js";
import UserModel from "../models/user-model.js";

export async function postRequest(req, res) {
  try {
    let user = await UserModel.findOne({ email: req.user.email }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    let { task, offer } = req.body;
    if (!task || !offer) {
      return res.status(400).send("Task and offer are required");
    }
    let post = await RequestModel.create({
      requester: user._id,
      task: task,
      offer: offer,
    });

    user.request.push(post._id);
    await user.save();
    return res.status(200).json({
      message: "Request posted successfully",
      request: post,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function deleteRequest(req, res) {
    try {
      const request = await RequestModel.findById(req.params.id);
      if (!request)
        return res.status(404).json({ message: "Request not found" });
  
      if (request.requester.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this request" });
      }
  
      await RequestModel.findByIdAndDelete(req.params.id);
  
      await UserModel.findByIdAndUpdate(req.user._id, {
        $pull: { request: req.params.id },
      });
  
      return res.status(200).json({ message: "Request deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
  
export async function fetchRequest(req,res){
  try{
    let requests = await RequestModel.find({}).populate("requester");
    if(!requests || requests.length === 0){
      return res.status(404).json({ message: "No requests found" });
    }
    return res.status(200).json({
      message:"Requests fetch successfully",
      requests: requests
    })
  }
  catch(err){
    return res.status(500).json({ message: err.message });
  }
}

export const AcceptRequest = async (req, res) => {
  try {
    const {requestid} = req.params;
    let user = await UserModel.findOne({ email: req.user.email }).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    let post= await RequestModel.findOne({ _id: requestid }).populate("requester");
    if (!post) {
      return res.status(404).send("Request not found");
    }
console.log(post.requester+" "+user);

    if (post.requester._id.toString() === user._id.toString()) {
      return res.status(400).send({message: "You cannot accept your own request" });
    }

    post.isAccepted = true;
    post.accepter = user._id;
    await post.save();

    return res.status(200).json({ message: "Request accepted successfully" }); 
  } catch (err) {
    return res.status(500).send({message: err.message});
  }
};

export const finalAcceptRequest = async (req, res) => {
  try {
    const { requestid } = req.params;
    let user = await UserModel.findOne({ email: req.user.email }).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    let post = await RequestModel.findOne({ _id: requestid }).populate("requester");
    if (!post) {
      return res.status(404).send("Request not found");
    }

    if (post.accepter && post.accepter.toString() !== user._id.toString()) {
      return res.status(403).send({ message: "You are not authorized to finalize this request" });
    }

    post.status = "completed";
    post.finalizedAt = new Date();
    await post.save();

    // Move to fulfilled requests for both users
    await UserModel.findByIdAndUpdate(post.requester._id, {
      $push: { fulfilledRequests: post._id }
    });

    await UserModel.findByIdAndUpdate(user._id, {
      $push: { fulfilledRequests: post._id }
    });

    return res.status(200).json({ message: "Request finalized successfully" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { requestid } = req.params;
    let user = await UserModel.findOne({ email: req.user.email }).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    let post = await RequestModel.findOne({ _id: requestid }).populate("requester");
    if (!post) {
      return res.status(404).send("Request not found");
    }

    if (post.accepter && post.accepter.toString() !== user._id.toString()) {
      return res.status(403).send({ message: "You are not authorized to reject this request" });
    }

    post.status = "rejected";
    post.isAccepted = false;
    post.accepter = null;
    post.rejectedAt = new Date();
    await post.save();

    return res.status(200).json({ message: "Request rejected successfully" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
