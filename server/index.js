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
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
