const User = require('../models/userModel')
const MessageRequest = require('../models/messageRequestModel')
const Messages = require('../models/messageModel')
const bcrypt = require('bcrypt')
const { sendOTPEmail } = require('../service/mailer')
const mongoose = require('mongoose')

const register = async(req,res,next) => {
  try {
    const { username, email, password } = req.body;
    if (username.length < 3 || username.length > 20) {
      return res.json({ msg: "Username must be between 3 and 20 characters.", status: false });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.json({ msg: "Username can only contain alphanumeric characters and underscores.", status: false });
    }
    const usernameCheck = await User.findOne({ username, isVerified: true });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email, isVerified: true });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });

    // Clean up any prior unverified registration attempts with same username/email
    await User.deleteMany({ username, isVerified: false });
    await User.deleteMany({ email, isVerified: false });

    // Generate 6-digit OTP verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const hashedPassword = await bcrypt.hash(password, 10);

    // Send OTP email FIRST — only save the user record if email succeeds.
    // This prevents orphaned unverified records when email delivery fails.
    await sendOTPEmail(email, otp, "registration");

    await User.create({
      email,
      username,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
    });

    return res.json({ status: true, msg: "Verification code sent to your email. Please verify." });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Failed to send verification email. Please check your email address and try again.", error: error.message });
  }
}

const verifyRegister = async (req, res, next) => {
  try {
    const { username, otp } = req.body;
    const user = await User.findOne({ username, isVerified: false });
    if (!user) {
      return res.json({ status: false, msg: "Registration session not found. Please register again." });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.json({ status: false, msg: "No active verification session" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.json({ status: false, msg: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const verifiedUser = { ...user.toObject() };
    delete verifiedUser.password;
    delete verifiedUser.securityAnswer;
    delete verifiedUser.otp;
    delete verifiedUser.otpExpiry;

    return res.json({ status: true, user: verifiedUser });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error", error: error.message });
  }
}

const login = async (req,res,next) =>{
  try {
    const { username, password } = req.body;
    const u = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if (!u)
      return res.json({ msg: "Enter valid Username or Email", status: false });
    if (u.isVerified === false) {
      return res.json({ msg: "Please verify your email first before logging in.", status: false });
    }
    const isPasswordValid = await bcrypt.compare(password, u.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Password", status: false });
    const user = { ...u.toObject() };
    delete user.password;
    delete user.securityAnswer;
    return res.json({ status: true, user });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error", error: error.message });
  }
}

const setAvatar = async (req,res,next) =>{
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
}

const getAllUsers = async(req,res,next) =>{
  try {
    const users = await User.find({ _id: { $ne: req.params.id }, isVerified: true }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    const responseData = {
      users: users,
      onlineUsers: Array.from(global.onlineUsers.keys()),
    };
    return res.json(responseData);
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
}

const logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

const sendOTP = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if (!user) {
      return res.json({ status: false, msg: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp, "reset");

    const maskEmail = (email) => {
      const [local, domain] = email.split("@");
      if (local.length <= 2) return `${local[0]}***@${domain}`;
      return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
    };

    return res.json({
      status: true,
      msg: `OTP sent successfully to ${maskEmail(user.email)}`,
      email: maskEmail(user.email),
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Failed to send verification code. Please check your credentials.", error: error.message });
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { username, otp } = req.body;
    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if (!user) {
      return res.json({ status: false, msg: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.json({ status: false, msg: "No active verification session" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.json({ status: false, msg: "Invalid or expired OTP code" });
    }

    return res.json({ status: true, msg: "Verification successful!" });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

const resetPasswordOTP = async (req, res, next) => {
  try {
    const { username, otp, newPassword } = req.body;
    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if (!user) {
      return res.json({ status: false, msg: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.json({ status: false, msg: "No active verification session" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.json({ status: false, msg: "Invalid or expired OTP code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ status: true, msg: "Password reset successful!" });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

const getContacts = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const acceptedRequests = await MessageRequest.find({
      status: "accepted",
      $or: [{ from: userId }, { to: userId }],
    });

    const requestUserIds = acceptedRequests.map((req) =>
      req.from.toString() === userId ? req.to.toString() : req.from.toString()
    );

    const messages = await Messages.find({ users: userId }).select("users");
    const messageUserIds = [];
    messages.forEach((msg) => {
      msg.users.forEach((uId) => {
        const uIdStr = uId.toString();
        if (uIdStr !== userId && !messageUserIds.includes(uIdStr)) {
          messageUserIds.push(uIdStr);
        }
      });
    });

    const combinedIds = Array.from(new Set([...requestUserIds, ...messageUserIds]));

    const users = await User.find({ _id: { $in: combinedIds }, isVerified: true }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    const usersWithUnread = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Messages.countDocuments({
          $or: [
            {
              "users.0": user._id.toString(),
              "users.1": userId.toString(),
            },
            {
              "users.0": user._id,
              "users.1": new mongoose.Types.ObjectId(userId),
            },
          ],
          isRead: { $ne: true },
        });
        return {
          ...user.toObject(),
          unreadCount,
        };
      })
    );

    return res.json({
      status: true,
      users: usersWithUnread,
      onlineUsers: Array.from(global.onlineUsers.keys()),
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.params;
    const currentUserId = req.query.currentUserId;

    if (!query) {
      return res.json({ status: true, users: [] });
    }

    const users = await User.find({
      username: { $regex: query, $options: "i" },
      _id: { $ne: currentUserId },
      isVerified: true,
    }).select(["username", "avatarImage", "_id", "email"]);

    const userListWithStatus = await Promise.all(
      users.map(async (u) => {
        const request = await MessageRequest.findOne({
          $or: [
            { from: currentUserId, to: u._id },
            { from: u._id, to: currentUserId },
          ],
        });

        return {
          _id: u._id,
          username: u.username,
          avatarImage: u.avatarImage,
          email: u.email,
          requestStatus: request ? request.status : "none",
          requestSender: request ? request.from.toString() : null,
          requestId: request ? request._id : null,
        };
      })
    );

    return res.json({ status: true, users: userListWithStatus });
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: "Internal Server Error" });
  }
};

module.exports = {
    register,
    verifyRegister,
    login,
    setAvatar,
    getAllUsers,
    logOut,
    sendOTP,
    verifyOTP,
    resetPasswordOTP,
    getContacts,
    searchUsers,
}