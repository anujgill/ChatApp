// Routes for user authentication and management
const Router = require('express').Router();
const {
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
} = require('../controllers/userController');
const {
  sendRequest,
  respondRequest,
  getRequests,
} = require('../controllers/requestController');

Router.post("/register",register);
Router.post("/verify-register", verifyRegister);
Router.post("/login",login);
Router.post("/setavatar/:id", setAvatar);
Router.get("/allusers/:id", getAllUsers);
Router.get('/logout/:id',logOut);
Router.post("/send-otp", sendOTP);
Router.post("/verify-otp", verifyOTP);
Router.post("/reset-password-otp", resetPasswordOTP);
Router.get("/contacts/:id", getContacts);
Router.get("/search/:query", searchUsers);
Router.post("/request", sendRequest);
Router.post("/request/respond", respondRequest);
Router.get("/requests/:id", getRequests);

module.exports = Router;