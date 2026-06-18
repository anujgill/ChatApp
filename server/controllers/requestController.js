const MessageRequest = require("../models/messageRequestModel");
const Messages = require("../models/messageModel");
const User = require("../models/userModel");

const sendRequest = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    if (from === to) {
      return res.json({ status: false, msg: "Cannot send request to yourself" });
    }

    // Check if a request already exists between these users (either direction)
    let existingRequest = await MessageRequest.findOne({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        return res.json({ status: false, msg: "Already connected" });
      }
      if (existingRequest.status === "pending") {
        if (existingRequest.from.toString() === from) {
          return res.json({ status: false, msg: "Request is already pending" });
        } else {
          // The other person had sent a request, so accept it!
          existingRequest.status = "accepted";
          await existingRequest.save();
          const populated = await MessageRequest.findById(existingRequest._id)
            .populate("from", "username email avatarImage")
            .populate("to", "username email avatarImage");
          return res.json({ status: true, request: populated, msg: "Request accepted!" });
        }
      }
      if (existingRequest.status === "rejected") {
        // Reset and re-send
        existingRequest.from = from;
        existingRequest.to = to;
        existingRequest.status = "pending";
        await existingRequest.save();
        const populated = await MessageRequest.findById(existingRequest._id)
          .populate("from", "username email avatarImage")
          .populate("to", "username email avatarImage");
        return res.json({ status: true, request: populated, msg: "Request sent!" });
      }
    }

    const newRequest = await MessageRequest.create({
      from,
      to,
      status: "pending",
    });

    const populated = await MessageRequest.findById(newRequest._id)
      .populate("from", "username email avatarImage")
      .populate("to", "username email avatarImage");

    return res.json({ status: true, request: populated, msg: "Request sent successfully!" });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

const respondRequest = async (req, res, next) => {
  try {
    const { requestId, status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.json({ status: false, msg: "Invalid status response" });
    }

    const request = await MessageRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    )
      .populate("from", "username email avatarImage")
      .populate("to", "username email avatarImage");

    if (!request) {
      return res.json({ status: false, msg: "Request not found" });
    }

    return res.json({ status: true, request, msg: `Request ${status} successfully` });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

const getRequests = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const requests = await MessageRequest.find({ to: userId, status: "pending" })
      .populate("from", "username email avatarImage");
    return res.json({ status: true, requests });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

module.exports = {
  sendRequest,
  respondRequest,
  getRequests,
};
