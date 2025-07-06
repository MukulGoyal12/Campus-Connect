import MessageModel from "../models/message-model.js";

export const getMessagesBetweenUsers = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await MessageModel.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const saveMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMsg = await MessageModel.create({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    res.status(201).json({ message: "Message sent", mssg: newMsg });
  } catch (err) {
    console.error("Save message error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUnreadCounts = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const unreadCounts = await MessageModel.aggregate([
      {
        $match: {
          receiver: currentUserId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ unreadCounts });
  } catch (err) {
    console.error("Get unread counts error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const markMessagesAsRead = async (req, res) => {
  const { senderId } = req.params;
  const currentUserId = req.user._id;

  try {
    await MessageModel.updateMany(
      {
        sender: senderId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark messages as read error:", err);
    res.status(500).json({ message: err.message });
  }
};
