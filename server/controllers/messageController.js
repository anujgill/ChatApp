const Messages = require("../models/messageModel");
const {encryptMessage,decryptMessage} = require('../service/encrypt');
const mongoose = require("mongoose");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const page = req.body.page ? parseInt(req.body.page) : null;
    const limit = req.body.limit ? parseInt(req.body.limit) : null;

    // Mark messages from 'to' (contact) to 'from' (current user) as read
    await Messages.updateMany(
      {
        $or: [
          {
            "users.0": to.toString(),
            "users.1": from.toString(),
          },
          {
            "users.0": new mongoose.Types.ObjectId(to),
            "users.1": new mongoose.Types.ObjectId(from),
          },
        ],
        isRead: { $ne: true },
      },
      {
        $set: { isRead: true },
      }
    );

    if (page && limit) {
      const skip = (page - 1) * limit;
      const totalMessages = await Messages.countDocuments({
        users: {
          $all: [from, to],
        },
      });

      const messages = await Messages.find({
        users: {
          $all: [from, to],
        },
      })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const projectedMessages = messages.map((msg) => {
        return {
          _id: msg._id,
          fromSelf: msg.users[0].toString() === from,
          message: decryptMessage(msg.message.text),
        };
      });

      projectedMessages.reverse();

      return res.json({
        messages: projectedMessages,
        hasMore: skip + messages.length < totalMessages,
      });
    } else {
      const messages = await Messages.find({
        users: {
          $all: [from, to],
        },
      }).sort({ updatedAt: 1 });

      const projectedMessages = messages.map((msg) => {
        return {
          _id: msg._id,
          fromSelf: msg.users[0].toString() === from,
          message: decryptMessage(msg.message.text),
        };
      });
      return res.json(projectedMessages);
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

module.exports.markAsRead = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    await Messages.updateMany(
      {
        $or: [
          {
            "users.0": from.toString(),
            "users.1": to.toString(),
          },
          {
            "users.0": new mongoose.Types.ObjectId(from),
            "users.1": new mongoose.Types.ObjectId(to),
          },
        ],
        isRead: { $ne: true },
      },
      {
        $set: { isRead: true },
      }
    );
    return res.json({ status: true });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const eMessage = encryptMessage(message);
    const data = await Messages.create({
      message: { text: eMessage },
      users: [from, to],
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};
