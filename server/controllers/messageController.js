const Messages = require("../models/messageModel");
const {encryptMessage,decryptMessage} = require('../service/encrypt');

module.exports.getMessages = async (req, res) => {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.users[0].toString() === from,
        message: decryptMessage(msg.message.text),
      };
    });
    res.json(projectedMessages);
};

module.exports.addMessage = async (req, res) => {
    const { from, to, message } = req.body;
    const eMessage = encryptMessage(message);
    const data = await Messages.create({
      message: { text: eMessage },
      users: [from, to],
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
};
