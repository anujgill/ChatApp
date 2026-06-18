# WhispR — Backend Complete Reference

> **Single source of truth for the server.** Every file, route, model, event, and environment variable is documented here in full detail.

---

## 1. Overview

| Item | Value |
|---|---|
| **App name** | WhispR |
| **Runtime** | Node.js |
| **Framework** | Express.js 4.x |
| **Real-time** | Socket.IO 4.x |
| **Database** | MongoDB (via Mongoose 8.x) |
| **Port** | `4000` (from `.env`) |
| **Entry point** | `server/index.js` |
| **Start command** | `nodemon index.js` (dev) / `node index.js` (prod) |
| **Deployment** | Vercel (`vercel.json`) |

---

## 2. Directory Structure

```
server/
├── index.js               # App entry point: Express setup, DB connect, Socket.IO
├── package.json           # Dependencies & scripts
├── vercel.json            # Vercel deployment config
├── .env                   # Environment variables (NOT committed)
├── controllers/
│   ├── userController.js  # register, login, setAvatar, getAllUsers, logOut
│   └── messageController.js # getMessages, addMessage
├── models/
│   ├── userModel.js       # Mongoose User schema
│   └── messageModel.js    # Mongoose Message schema
├── routes/
│   ├── userRoute.js       # /api/auth/* routes
│   └── messageRoutes.js   # /api/messages/* routes
└── service/
    └── encrypt.js         # AES-256-CBC encrypt/decrypt helpers
```

---

## 3. Environment Variables (`.env`)

```env
MONGO_URL = mongodb+srv://anujshergill:double000@cluster0.t9arheh.mongodb.net/chatApp?retryWrites=true&w=majority&appName=Cluster0
PORT = 4000
SECRET_KEY = five@five@2024
```

| Variable | Purpose |
|---|---|
| `MONGO_URL` | MongoDB Atlas connection string |
| `PORT` | HTTP server listening port |
| `SECRET_KEY` | AES-256-CBC encryption key for messages |

> ⚠️ `.env` is in `.gitignore` and must **never** be committed.

---

## 4. Entry Point — `index.js`

### Full Source (74 lines)

```js
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

// CORS origins for Socket.IO:
// prod: https://chat-app-six-steel-75.vercel.app
// dev:  http://localhost:3000
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();   // userId -> socket.id

io.on("connection", (socket) => {

  // Client registers itself; broadcast reload so others refresh contact list
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("reload");
  });

  // Relay a chat message to the intended recipient (if online)
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", { from: data.from, msg: data.msg });
    }
  });

  // Relay typing status
  socket.on("setType", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typeStatus", { from: data.from, typeStatus: data.isTyping });
    }
  });

  // On disconnect: remove from map and broadcast reload
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
```

### Key Design Decisions

- `global.onlineUsers` is a **plain in-memory `Map`** — maps `userId (string)` → `socket.id (string)`. Not persistent across server restarts.
- On every `add-user` or `disconnect`, a `"reload"` event is broadcast so all connected clients re-fetch the contacts list (to update online status).
- The Socket.IO server shares the same HTTP `server` instance as Express.
- CORS is currently hardcoded to `http://localhost:3000` for Socket.IO; update for production.

---

## 5. Dependencies (`package.json`)

```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "nodemon index.js",
    "server": "node index.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.3.2",
    "nodemon": "^3.1.0",
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11"
  }
}
```

| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `cors` | Cross-Origin Resource Sharing middleware |
| `mongoose` | MongoDB ODM |
| `bcrypt` | Password hashing (salt rounds = 10) |
| `dotenv` | Load `.env` into `process.env` |
| `nodemon` | Auto-restart on file change (dev) |
| `socket.io` | WebSocket server for real-time messaging |

---

## 6. Database Models

### 6.1 User Model — `models/userModel.js`

**Collection name:** `Users`

```js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, min: 3, max: 20, unique: true },
  email:    { type: String, required: true, unique: true, max: 50 },
  password: { type: String, required: true, min: 8 },       // bcrypt hash
  isAvatarImageSet: { type: Boolean, default: false },
  avatarImage:      { type: String,  default: "" },          // base64 SVG string
});
module.exports = mongoose.model("Users", userSchema);
```

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `username` | String | required, unique, min 3, max 20 | Used for login |
| `email` | String | required, unique, max 50 | Also accepted at login |
| `password` | String | required, min 8 | Stored as bcrypt hash |
| `isAvatarImageSet` | Boolean | default `false` | Guards avatar selection redirect |
| `avatarImage` | String | default `""` | base64-encoded SVG from multiavatar API |

> **Note:** The `password` field is **deleted** before the user object is returned in any API response.

---

### 6.2 Message Model — `models/messageModel.js`

**Collection name:** `Messages`

```js
const MessageSchema = new mongoose.Schema(
  {
    message: { text: { type: String, required: true } },  // AES-encrypted ciphertext
    users: Array,   // [senderId, receiverId] — both as strings
  },
  { timestamps: true }   // adds createdAt, updatedAt
);
module.exports = mongoose.model("Messages", MessageSchema);
```

| Field | Type | Notes |
|---|---|---|
| `message.text` | String | AES-256-CBC encrypted ciphertext (hex) |
| `users` | Array | `[fromUserId, toUserId]` — unordered pair |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) — used for sort order |

> Messages are queried using `$all` on the `users` array, so order doesn't matter for retrieval. Sort by `updatedAt: 1` (ascending = oldest first).

---

## 7. Routes

### 7.1 User Routes — `routes/userRoute.js`

**Prefix:** `/api/auth`

```
POST   /api/auth/register        → register
POST   /api/auth/login           → login
POST   /api/auth/setavatar/:id   → setAvatar
GET    /api/auth/allusers/:id    → getAllUsers
GET    /api/auth/logout/:id      → logOut
```

### 7.2 Message Routes — `routes/messageRoutes.js`

**Prefix:** `/api/messages`

```
POST   /api/messages/addmsg/     → addMessage
POST   /api/messages/getmsg/     → getMessages
```

---

## 8. Controllers

### 8.1 User Controller — `controllers/userController.js`

#### `register` — `POST /api/auth/register`

**Request body:**
```json
{ "username": "string", "email": "string", "password": "string" }
```

**Logic:**
1. Check if username already exists → `{ msg: "Username already used", status: false }`
2. Check if email already exists → `{ msg: "Email already used", status: false }`
3. Hash password with `bcrypt.hash(password, 10)`
4. Create user in DB
5. Delete `password` from returned object
6. Return `{ status: true, user: { _id, username, email, isAvatarImageSet, avatarImage } }`

**Success response:**
```json
{ "status": true, "user": { "_id": "...", "username": "...", "email": "...", "isAvatarImageSet": false, "avatarImage": "" } }
```

---

#### `login` — `POST /api/auth/login`

**Request body:**
```json
{ "username": "string", "password": "string" }
```
> The `username` field also accepts an email — the query uses `$or: [{ username }, { email: username }]`.

**Logic:**
1. Find user by username OR email
2. If not found → `{ msg: "Enter valid Username or Email", status: false }`
3. Compare password with bcrypt → if wrong → `{ msg: "Incorrect Password", status: false }`
4. Delete `password` from returned object
5. Return `{ status: true, user }`

---

#### `setAvatar` — `POST /api/auth/setavatar/:id`

**URL param:** `:id` = user's MongoDB `_id`

**Request body:**
```json
{ "image": "base64EncodedSVGstring" }
```

**Logic:**
- `findByIdAndUpdate` with `{ isAvatarImageSet: true, avatarImage }`, `{ new: true }`
- Returns `{ isSet: true, image: "base64..." }`

---

#### `getAllUsers` — `GET /api/auth/allusers/:id`

**URL param:** `:id` = current user's `_id` (excluded from results)

**Logic:**
- Find all users **except** the requesting user
- Select only: `email`, `username`, `avatarImage`, `_id`
- Also reads `global.onlineUsers` and returns keys as array

**Response:**
```json
{
  "users": [{ "_id": "...", "username": "...", "email": "...", "avatarImage": "..." }],
  "onlineUsers": ["userId1", "userId2"]
}
```

---

#### `logOut` — `GET /api/auth/logout/:id`

**URL param:** `:id` = user's `_id`

**Logic:**
- If no `id` → `{ msg: "User id is required" }`
- Deletes user from `global.onlineUsers` Map
- Returns HTTP 200 with empty body

---

### 8.2 Message Controller — `controllers/messageController.js`

#### `getMessages` — `POST /api/messages/getmsg/`

**Request body:**
```json
{ "from": "userId", "to": "userId" }
```

**Logic:**
1. Query `Messages.find({ users: { $all: [from, to] } }).sort({ updatedAt: 1 })`
2. For each message, decrypt `msg.message.text` and determine `fromSelf` by checking `msg.users[0].toString() === from`
3. Return array of `{ fromSelf: boolean, message: string }`

**Response:**
```json
[
  { "fromSelf": true, "message": "Hello!" },
  { "fromSelf": false, "message": "Hi there!" }
]
```

---

#### `addMessage` — `POST /api/messages/addmsg/`

**Request body:**
```json
{ "from": "userId", "to": "userId", "message": "plaintext string" }
```

**Logic:**
1. Encrypt `message` → `eMessage` (AES-256-CBC hex string)
2. `Messages.create({ message: { text: eMessage }, users: [from, to] })`
3. Returns `{ msg: "Message added successfully." }` on success

---

## 9. Encryption Service — `service/encrypt.js`

```js
const crypto = require('crypto');

function encryptMessage(message) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.SECRET_KEY);
    let encryptedMessage = cipher.update(message, 'utf8', 'hex');
    encryptedMessage += cipher.final('hex');
    return encryptedMessage;
}

function decryptMessage(encryptedMessage) {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.SECRET_KEY);
    let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
    decryptedMessage += decipher.final('utf8');
    return decryptedMessage;
}

module.exports = { encryptMessage, decryptMessage };
```

| Detail | Value |
|---|---|
| Algorithm | AES-256-CBC |
| Key | `process.env.SECRET_KEY` = `five@five@2024` |
| Input encoding | UTF-8 plaintext → hex ciphertext |
| Node API | `crypto.createCipher` / `crypto.createDecipher` (legacy — no IV) |

> ⚠️ `createCipher`/`createDecipher` are **deprecated** in newer Node versions (no explicit IV). Consider migrating to `createCipheriv`/`createDecipheriv` with a random IV stored alongside the message.

---

## 10. Socket.IO Events Reference

### Client → Server Events

| Event | Payload | Action |
|---|---|---|
| `add-user` | `userId: string` | Maps `userId → socket.id` in `onlineUsers`; broadcasts `"reload"` to all others |
| `send-msg` | `{ to: userId, from: userId, msg: string }` | Emits `"msg-recieve"` to target's socket if online |
| `setType` | `{ to: userId, from: userId, isTyping: boolean }` | Emits `"typeStatus"` to target's socket if online |
| *(disconnect)* | — | Removes user from `onlineUsers`; broadcasts `"reload"` |

### Server → Client Events

| Event | Payload | Triggered by |
|---|---|---|
| `reload` | — | Any user connect or disconnect |
| `msg-recieve` | `{ from: userId, msg: string }` | `send-msg` event from sender |
| `typeStatus` | `{ from: userId, typeStatus: boolean }` | `setType` event from sender |

---

## 11. Deployment — `vercel.json`

```json
{
  "version": 2,
  "builds": [{ "src": "*.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/" }]
}
```

- All JS files at root are built with `@vercel/node`
- All routes are rewritten to `/` (index.js)
- Known limitation: Vercel is serverless, so **`global.onlineUsers` (in-memory Map) will reset on each cold start**. Socket.IO also has known issues in serverless environments. For production, consider a persistent store (Redis) or a platform that supports long-lived processes (Railway, Render, etc.).

---

## 12. API Quick Reference Card

### Base URL
- **Development:** `http://localhost:4000`
- **Production (Render):** `https://chatapp-2-vvio.onrender.com`

### Auth Endpoints

| Method | URL | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{username, email, password}` | Register new user |
| POST | `/api/auth/login` | `{username, password}` | Login (username or email) |
| POST | `/api/auth/setavatar/:id` | `{image}` | Set avatar image |
| GET | `/api/auth/allusers/:id` | — | Get all users + online list |
| GET | `/api/auth/logout/:id` | — | Logout user |

### Message Endpoints

| Method | URL | Body | Description |
|---|---|---|---|
| POST | `/api/messages/addmsg/` | `{from, to, message}` | Store encrypted message |
| POST | `/api/messages/getmsg/` | `{from, to}` | Retrieve & decrypt messages |

---

## 13. Known Issues & Notes

1. **No authentication middleware** — all routes are publicly accessible without any JWT or session token. The `id` in URL params is trusted as-is.
2. **No error handling middleware** — if a DB operation throws, the request will hang or crash (no try/catch in most controllers).
3. **`global.onlineUsers` is per-process** — not shared across multiple server instances (not horizontally scalable without Redis).
4. **Deprecated crypto API** — `createCipher`/`createDecipher` without IV is deprecated and may be removed in future Node versions.
5. **CORS wildcard** — `app.use(cors())` with no options allows all origins. Socket.IO CORS is restricted to `localhost:3000`.
6. **`vercel.json` compatibility** — Socket.IO requires persistent connections; Vercel's serverless model is not ideal for this.
