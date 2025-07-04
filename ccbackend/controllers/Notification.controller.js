import NotificationModel from "../models/notification-model.js";

export const createNotification = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    const sender = req.user._id;

    const notification = await NotificationModel.create({
      sender,
      receiver,
      message,
    });

    if (!notification) {
      return res.status(500).json({ message: "Notification creation failed" });
    }

    return res
      .status(200)
      .json({ message: "Notification created successfully", notification });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const fetchNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.find({
      receiver: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email");

    return res
      .status(200)
      .json({ notifications, message: "Notifications fetched successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if(!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
    }
  
    return res.status(200).json({ message: "Notification marked as read", updatedNotification });
  }catch (err) {
    return res.status(500).json({ message: err.message });
  }
};