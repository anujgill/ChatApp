const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  securityQuestion: {
    type: String,
    required: false,
  },
  securityAnswer: {
    type: String,
    required: false,
  },
  otp: {
    type: String,
    required: false,
  },
  otpExpiry: {
    type: Date,
    required: false,
  },
});

module.exports = mongoose.model("Users", userSchema);
