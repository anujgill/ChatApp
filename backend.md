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
├── index.js               # App entry point: Express setup, DB connect + migrations, Socket.IO
├── package.json           # Dependencies & scripts
├── vercel.json            # Vercel deployment config
├── .env                   # Environment variables (NOT committed)
├── controllers/
│   ├── userController.js  # Auth (register, verify OTP, login, setAvatar, search, contacts)
│   ├── messageController.js # addMessage, getMessages (supports pagination), markAsRead
│   └── requestController.js # sendRequest, respondRequest, getRequests
├── models/
│   ├── userModel.js       # Mongoose User schema (isVerified, OTP details)
│   ├── messageModel.js    # Mongoose Message schema (isRead)
│   └── messageRequestModel.js # Mongoose MessageRequest schema (connection requests)
├── routes/
│   ├── userRoute.js       # /api/auth/* routes
│   └── messageRoutes.js   # /api/messages/* routes
└── service/
    ├── encrypt.js         # IV-based AES-256-CBC encrypt/decrypt helpers with fallback
    └── mailer.js          # Nodemailer SMTP transporter for sending verification codes
```

---

## 3. Environment Variables (`.env`)

```env
MONGO_URL = <MongoDB Atlas Connection String>
PORT = 4000
SECRET_KEY = <AES-256-CBC Key>
EMAIL = <SMTP Gmail Address>
PASS_KEY = <SMTP App Password Key>
MAIL_SERVICE = gmail
MAIL_HOST = smtp.gmail.com
MAIL_PORT = 587
```

> [!IMPORTANT]
> **Vercel Deployments / Production Environment Variables:**
> When deploying to Vercel, you must define the variables above in your Vercel Dashboard project settings under **Project Settings > Environment Variables**.
>
> **MongoDB Network Access Whitelist:**
> Because Vercel serverless functions run on dynamic IP addresses, you **MUST** configure the MongoDB Atlas IP Access List to allow access from anywhere (`0.0.0.0/0`). If this is not done, MongoDB Atlas will reject connection attempts from the Vercel serverless functions, leading to query buffer timeouts and `Internal Server Error` messages.

---

## 4. Entry Point — `index.js`

### Implementation Detail

The entry point configures the Express middleware (JSON parsing, CORS), registers auth and message routes, connects to MongoDB, performs a legacy user database migration, and boots the real-time Socket.IO server.

- **Legacy User Migration**: When the database connects, a startup script runs `User.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: true } })` to set verification status for users registered before the OTP feature.
- **Socket.IO Event Handlers & Payloads**:
  - `add-user` (Inbound): Receives `{ userId }` from the client. Maps the user ID to the socket's unique ID in the `onlineUsers` map and broadcasts the `reload` event to all other clients to update contact list displays.
  - `send-msg` (Inbound): Receives `{ to, from, msg }` containing the recipient's user ID, sender's user ID, and the raw text message. Server checks if the recipient's socket ID is registered in `onlineUsers` and forwards a `msg-recieve` event with `{ from, msg }`.
  - `setType` (Inbound): Receives `{ isTyping, from, to }`. Relays typing state updates via the `typeStatus` event containing `{ typeStatus: isTyping, from }` to the recipient if they are online.
  - `send-request` (Inbound): Receives `{ from, to, request }`. Relays the inbound message request to the recipient socket using the `request` event containing `{ request, from }`.
  - `request-response` (Inbound): Receives `{ from, to, status }`. Relays the request approval/rejection state to the sender socket using the `request-response` event containing `{ status, from }`.
  - `disconnect` (Event): Fires automatically when a socket closes. Cleanly deletes the associated socket mapping from the `onlineUsers` map and alerts other sockets.

---

## 5. Database Models

### 5.1 User Model — `models/userModel.js`

Stores user account data including password hash, avatar details, verification flags, and temporary OTPs.

- `username`: String (3-20 characters, alphanumeric + underscores, unique).
- `email`: String (max 50, unique).
- `password`: String (bcrypt hashed).
- `isAvatarImageSet`: Boolean (default `false`).
- `isVerified`: Boolean (default `false` for new users, legacy users migrated to `true`).
- `avatarImage`: String (base64 SVG string).
- `otp`: String (6-digit OTP code, temporary).
- `otpExpiry`: Date (OTP expiration timestamp).

### 5.2 Message Model — `models/messageModel.js`

Stores chat message records.

- `message.text`: String (AES-256-CBC encrypted ciphertext).
- `users`: Array of Strings `[senderId, receiverId]`.
- `isRead`: Boolean (default `false`, marks if the recipient viewed the message).
- `timestamps`: Enabled (`createdAt`, `updatedAt`).

### 5.3 Message Request Model — `models/messageRequestModel.js`

Stores connection requests for messaging authorization.

- `from`: ObjectId (Ref: `Users`).
- `to`: ObjectId (Ref: `Users`).
- `status`: String (enum: `["pending", "accepted", "rejected"]`, default: `"pending"`).
- `timestamps`: Enabled (`createdAt`, `updatedAt`).

---

## 6. API Routing Table

### 6.1 Authentication/User Routing — `/api/auth`

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `register` | Initiate registration, send email OTP code |
| POST | `/api/auth/verify-register` | `verifyRegister` | Verify OTP code and verify user account |
| POST | `/api/auth/login` | `login` | Authenticate username/email & password |
| POST | `/api/auth/setavatar/:id` | `setAvatar` | Upload/select user profile avatar image |
| GET | `/api/auth/allusers/:id` | `getAllUsers` | Fetch user listing (excludes self) |
| GET | `/api/auth/logout/:id` | `logOut` | Clear user active online socket session |
| POST | `/api/auth/send-otp` | `sendOTP` | Generate and email recovery OTP code |
| POST | `/api/auth/verify-otp` | `verifyOTP` | Validate recovery OTP code match |
| POST | `/api/auth/reset-password-otp`| `resetPasswordOTP` | Reset password using verified OTP code |
| GET | `/api/auth/contacts/:id` | `getContacts` | Fetch connected chat contacts + unread counts |
| GET | `/api/auth/search/:query` | `searchUsers` | Search users by query & check request status |
| POST | `/api/auth/request` | `sendRequest` | Create connection message request |
| POST | `/api/auth/request/respond` | `respondRequest` | Accept or reject pending message request |
| GET | `/api/auth/requests/:id` | `getRequests` | Get pending inbound requests for user |

### 6.2 Messages Routing — `/api/messages`

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| POST | `/api/messages/addmsg/` | `addMessage` | Encrypt and store chat message |
| POST | `/api/messages/getmsg/` | `getMessages` | Retrieve, mark read, and decrypt chat history in stable chronological order (sorted by `createdAt`). Optionally accepts `page` and `limit` in request body for paginated results (returns `{ messages, hasMore }`), falling back to full history if parameters are missing. |
| POST | `/api/messages/markread/` | `markAsRead` | Explicitly mark messages as read |

---

## 7. Encryption Helper — `service/encrypt.js`

Secures chat messages stored in MongoDB using **AES-256-CBC**.

- **Encryption**: Hashes the secret key using SHA-256, generates a random 16-byte initialization vector (IV), encrypts the message, and returns the format `iv:ciphertext` encoded in hex.
- **Decryption**:
  - Tries to split the message string by `:`. If present, parses the IV and decrypts the ciphertext using `crypto.createDecipheriv`.
  - Fallback: If split is not present or decryption fails, falls back to legacy `crypto.createDecipher` using the plain secret key to maintain backward compatibility with old database records.

---

## 8. Error Handling & Troubleshooting

To assist with troubleshooting in production environments (like Vercel serverless functions where viewing logs is not always immediate), the catch blocks in the controllers return the detailed error message in the JSON payload under the `error` property:

- **Example Error Response format:**
  ```json
  {
    "status": false,
    "msg": "Failed to initiate registration verification. Please check your details.",
    "error": "Error message description (e.g. SMTP timeout / Mongoose buffering timeout)"
  }
  ```

This detailed error behavior is implemented for the following routes:
- `/api/auth/register` (registration initiation & email OTP verification)
- `/api/auth/verify-register` (final verification of OTP code)
- `/api/auth/login` (user login credentials verification)
- `/api/auth/send-otp` (recovery OTP code delivery)
