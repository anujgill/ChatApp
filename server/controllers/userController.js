const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const register = async(req,res) => {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const u = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    const user = {...u.toObject()};
    delete user.password;
    return res.json({ status: true, user });
}

const login = async (req,res) =>{
    const { username, password } = req.body;
    const u = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if (!u)
      return res.json({ msg: "Enter valid Username or Email", status: false });
    const isPasswordValid = await bcrypt.compare(password, u.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Password", status: false });
      const user = { ...u.toObject() };
      delete user.password;
    // console.log(user)
    return res.json({ status: true, user });
}

const setAvatar = async (req,res) =>{
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
}

const getAllUsers = async(req,res) =>{
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    // console.log(users)
    // console.log(onlineUsers)
    const responseData = {
      users: users,
      onlineUsers: Array.from(global.onlineUsers.keys()),
  };
    return res.json(responseData);
}

const logOut = (req, res) => {
  if (!req.params.id) return res.json({ msg: "User id is required " });
  onlineUsers.delete(req.params.id);
  return res.status(200).send();
}

module.exports = {
    register,
    login,
    setAvatar,
    getAllUsers,
    logOut,
}