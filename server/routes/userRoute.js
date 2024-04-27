const Router = require('express').Router();
const {register,login,setAvatar,getAllUsers, logOut} = require('../controllers/userController')

Router.post("/register",register);
Router.post("/login",login);
Router.post("/setavatar/:id", setAvatar);
Router.get("/allusers/:id", getAllUsers);
Router.get('/logout/:id',logOut);
module.exports = Router;