const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoute')
const messageRoutes = require('./routes/messageRoutes');
const socket = require("socket.io");

const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.get('/',(req,res)=>{
  res.end("Hello World");
});
app.use("/api/auth",userRoutes)
app.use('/api/messages',messageRoutes);


mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connected to database")
}).catch((err)=>{
    console.log(err)
});

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
// https://chat-app-six-steel-75.vercel.app
// http://localhost:3000
const io = socket(server, {
  cors: {
    origin: "https://chat-app-six-steel-75.vercel.app",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  // global.chatSocket = socket;
  // console.log(socket.handshake.address)
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("reload");
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve",{from: data.from,msg:data.msg});
    }
  });

  socket.on("setType", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typeStatus",{from: data.from,typeStatus:data.isTyping});
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUserId = Array.from(onlineUsers.entries()).find(
      ([userId, socketId]) => socketId === socket.id
    );
    socket.broadcast.emit("reload");
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId[0]);
    }
  });
});

