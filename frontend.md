# WhispR — Frontend Complete Reference

> **Single source of truth for the client.** Every file, component, page, hook, state, prop, style, and route is documented here in full detail.

---

## 1. Overview

| Item | Value |
|---|---|
| **App name** | WhispR (also styled as "Whispr") |
| **Framework** | React 18 (Create React App) |
| **Styling** | styled-components 6.x |
| **Routing** | React Router DOM 6.x |
| **HTTP client** | Axios 1.x |
| **Real-time** | Socket.IO client 4.x |
| **Notifications** | react-toastify 10.x |
| **Emoji picker** | emoji-picker-react 4.x |
| **Icons** | react-icons 5.x |
| **Dev server port** | `3000` |
| **Entry point** | `client/src/index.js` |
| **Start command** | `npm start` (react-scripts start) |

---

## 2. Directory Structure

```
client/
├── package.json
├── public/
│   ├── index.html         # HTML shell — title: "Whispr"
│   ├── Designer.png       # Favicon / brand icon
│   ├── manifest.json
│   ├── robots.txt
│   ├── favicon.ico
│   ├── logo192.png
│   └── logo512.png
└── src/
    ├── index.js           # ReactDOM.createRoot entry
    ├── index.css          # Global reset + font stacks
    ├── App.js             # BrowserRouter + all Routes
    ├── assets/
    │   ├── Designer.png   # Brand logo (used in header)
    │   ├── giphy.gif      # Animated GIF on Welcome screen
    │   └── loader.gif     # Loading spinner for SetAvatar
    ├── utils/
    │   └── Api.js         # All API URL constants
    ├── pages/
    │   ├── Register.jsx   # /register route
    │   ├── Login.jsx      # /login route
    │   └── Chat.jsx       # / route (main chat page)
    └── components/
        ├── Contacts.jsx   # Left sidebar: contact list + search
        ├── ChatContainer.jsx # Right panel: messages + header
        ├── ChatInput.jsx  # Message input bar + emoji picker
        ├── SetAvatar.jsx  # /setAvatar route (avatar picker)
        ├── Welcome.jsx    # Shown when no chat is selected
        └── Logout.jsx     # Logout button (used in multiple places)
```

---

## 3. Environment Variables

The frontend reads from `process.env` via CRA's convention (prefixed with `REACT_APP_`).

| Variable | Used in | Purpose |
|---|---|---|
| `REACT_APP_CURRENT_USER` | All pages/components | Key used to store/retrieve the logged-in user from `sessionStorage` |

> ⚠️ There is **no `.env` file committed** for the client (it's in `.gitignore`). The variable `REACT_APP_CURRENT_USER` must exist in a `client/.env` file locally. Its exact value (e.g., `"chat-app-user"`) determines the sessionStorage key.

---

## 4. Global Styles — `index.css`

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}
```

Minimal — all component-level styling is done with `styled-components`.

---

## 5. App Entry — `index.js`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Standard CRA entry. Mounts into `<div id="root">` in `public/index.html`.

---

## 6. Routing — `App.js`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import SetAvatar from './components/SetAvatar';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register/>} />
        <Route path="/login"    element={<Login/>} />
        <Route path="/"         element={<Chat/>} />
        <Route path="/setAvatar" element={<SetAvatar/>} />
      </Routes>
    </Router>
  );
}
```

### Route Table

| Path | Component | Auth Guard |
|---|---|---|
| `/register` | `Register` | Redirects to `/` if already logged in |
| `/login` | `Login` | Redirects to `/` if already logged in |
| `/` | `Chat` | Redirects to `/login` if not logged in |
| `/setAvatar` | `SetAvatar` | Redirects to `/login` if not logged in |

> Auth guards are implemented inside each component's `useEffect` by checking `sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)`.

---

## 7. API Utilities — `utils/Api.js`

```js
export const HOST = "http://localhost:4000";
// Alternate (Render deploy): "https://chatapp-2-vvio.onrender.com"

export const registerRoute    = `${HOST}/api/auth/register`;
export const loginRoute       = `${HOST}/api/auth/login`;
export const setAvatarRoute   = `${HOST}/api/auth/setavatar`;
export const allUsersRoute    = `${HOST}/api/auth/allusers`;
export const logoutRoute      = `${HOST}/api/auth/logout`;
export const sendMessageRoute = `${HOST}/api/messages/addmsg`;
export const recieveMessageRoute = `${HOST}/api/messages/getmsg`;
```

`HOST` is also used directly in `Chat.jsx` for the Socket.IO connection: `io(HOST)`.

---

## 8. Pages

### 8.1 Register — `pages/Register.jsx`

**Route:** `/register`

#### State
```js
const [values, setValues] = useState({
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
});
```

#### Auth Guard (`useEffect`)
- If `sessionStorage` has `REACT_APP_CURRENT_USER` → `navigate("/")`

#### Validation (`handleValidation`)

| Check | Error Message |
|---|---|
| `password !== confirmPassword` | "Password and confirm password should be same." |
| `username.length < 3` | "Username should be greater than 3 characters." |
| `password.length < 8` | "Password should be equal or greater than 8 characters." |
| `email === ""` | "Email is required." |

#### Submit (`handleSubmit`)
1. Run `handleValidation()`
2. `POST /api/auth/register` with `{ username, email, password }`
3. On failure (`data.status === false`): `toast.error(data.msg)`
4. On success (`data.status === true`):
   - Store `data.user` in `sessionStorage`
   - `navigate("/setAvatar")`

#### Toast Config
```js
{ position: "bottom-right", autoClose: 3000, pauseOnHover: true, draggable: true, theme: "dark" }
```

#### Styled Component (`FormContainer`)
- Full-viewport centered flex container
- Background: `#f2f2f2` (light grey)
- Form card: white, `border-radius: 1rem`, `box-shadow`
- Brand color: `#4e0eff` (vivid purple/blue)
- Inputs: focus border `#4e0eff`, transition 0.3s
- Button: `#4e0eff` → `#3a08b5` on hover

---

### 8.2 Login — `pages/Login.jsx`

**Route:** `/login`

#### State
```js
const [values, setValues] = useState({ username: "", password: "" });
```

#### Auth Guard (`useEffect`)
- Same as Register: redirects to `/` if already logged in.

#### Validation (`validateForm`)
| Check | Error Message |
|---|---|
| `username === ""` | "Email or Username is required." |
| `password === ""` | "Password is required." |

#### Submit (`handleSubmit`)
1. Run `validateForm()`
2. `POST /api/auth/login` with `{ username, password }`
   - Note: `username` field accepts either username or email (backend handles `$or` query)
3. On failure: `toast.error(data.msg)`
4. On success:
   - Store `data.user` in `sessionStorage`
   - `navigate("/")`

#### Styled Component
- Identical design to Register (`FormContainer`)

---

### 8.3 Chat — `pages/Chat.jsx`

**Route:** `/`

This is the **main application page**. It orchestrates the contact list, socket connection, and the chat panel.

#### State & Refs

| Name | Type | Purpose |
|---|---|---|
| `socket` | `useRef` | Socket.IO client instance (persistent across renders) |
| `currChat` | `useRef` | Ref to `currentChat` (used inside socket callbacks to avoid stale closure) |
| `contacts` | `useState([])` | Array of all other users, each augmented with `unreadCount: number` |
| `currentChat` | `useState(undefined)` | Currently selected contact object |
| `currentUser` | `useState(undefined)` | The logged-in user object from sessionStorage |
| `onlineUsers` | `useState([])` | Array of `userId` strings currently online |
| `reload` | `useState(true)` | Boolean toggled to trigger contacts re-fetch |

#### Effects

**Effect 1 — Load current user from sessionStorage:**
```js
useEffect(() => {
  if (!sessionStorage.getItem(REACT_APP_CURRENT_USER)) navigate("/login");
  else setCurrentUser(JSON.parse(sessionStorage.getItem(REACT_APP_CURRENT_USER)));
}, [navigate]);
```

**Effect 2 — Connect Socket.IO after user is loaded:**
```js
useEffect(() => {
  if (currentUser) {
    socket.current = io(HOST);
    socket.current.emit("add-user", currentUser._id);
  }
}, [currentUser]);
```

**Effect 3 — Fetch contacts (re-runs on user load or `reload` toggle):**
```js
useEffect(() => {
  if (currentUser) {
    if (currentUser.isAvatarImageSet) {
      // GET /api/auth/allusers/:id
      const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
      setOnlineUsers(data.onlineUsers);
      setContacts(data.users.map(user => ({ ...user, unreadCount: 0 })));
    } else {
      navigate("/setAvatar");
    }
  }
}, [currentUser, navigate, reload]);
```

**`reload` listener (outside useEffect — runs every render):**
```js
if (socket.current) {
  socket.current.on('reload', () => {
    setReload(prev => !prev);  // toggle to trigger Effect 3
  });
}
```

**Effect 4 — Track unread messages when a new message arrives:**
```js
useEffect(() => {
  if (socket.current) {
    currChat.current = currentChat;
    socket.current.on("msg-recieve", (data) => {
      if (data.from !== currChat.current?._id) {
        // Increment unreadCount for the sender contact
        setContacts(prev => prev.map(c =>
          c._id === data.from ? { ...c, unreadCount: c.unreadCount + 1 } : c
        ));
      }
    });
  }
}, [currentChat, contacts]);
```

**Effect 5 — Clear unreadCount when opening a chat:**
```js
useEffect(() => {
  const updatedContacts = contacts.map(contact =>
    contact._id === currChat.current._id ? { ...contact, unreadCount: 0 } : contact
  );
  setContacts(updatedContacts);
}, [currentChat]);
```

#### Render Structure
```jsx
<Container>
  <div className="container">   {/* 85vh × 85vw, grid 25% / 75% */}
    <Contacts currentUser={currentUser} onlineUsers={onlineUsers}
              contacts={contacts} changeChat={handleChatChange} />
    {currentChat === undefined
      ? <Welcome socket={socket} />
      : <ChatContainer currentUser={currentUser} onlineUsers={onlineUsers}
                       currentChat={currentChat} socket={socket} />
    }
  </div>
</Container>
```

#### Styled Component (`Container`)
- Background: `#4f5731` (olive green)
- Inner `.container`: `background-color: rgba(0,0,0,0.6)`, `border-radius: 50px`
- Grid: `25% 75%` (tablet: `35% 65%`)

---

## 9. Components

### 9.1 Contacts — `components/Contacts.jsx`

**Props:**

| Prop | Type | Description |
|---|---|---|
| `contacts` | `Array` | All users with `unreadCount` field |
| `changeChat` | `Function` | Callback to set `currentChat` in parent |
| `currentUser` | `Object` | Logged-in user |
| `onlineUsers` | `Array<string>` | List of online userId strings |

#### State
```js
const [currentSelected, setCurrentSelected] = useState(undefined); // selected contact index
const [searchQuery, setSearchQuery] = useState("");
```

#### Search Filter
```js
const filteredContacts = contacts.filter(contact =>
  contact.username.toLowerCase().includes(searchQuery.toLowerCase())
);
```

#### Render Sections
1. **Brand header**: Logo (`Designer.png`) + "WhispR" title + search bar
2. **Contacts list**: Filtered contacts, each card shows:
   - Avatar (base64 SVG: `data:image/svg+xml;base64,${avatarImage}`)
   - Green online dot if `onlineUsers.includes(contact._id)`
   - Username
   - `unreadCount` shown in green `<h2>` (shows 0 when no unreads — could filter to hide zeros)
   - Selected state: `background-color: #9a86f3`
3. **Current user panel** (bottom): Shows logged-in user's avatar and username

#### Styled Component Color Scheme
| Element | Color |
|---|---|
| Sidebar background | `#8d9668` (olive/sage) |
| Contact card | `#573132` (dark maroon) |
| Selected contact | `#9a86f3` (lavender) |
| Search bar | `#1b1b32` (dark navy) |
| Current user bar | `#701316` (dark red) |
| Online dot | `green` |

---

### 9.2 ChatContainer — `components/ChatContainer.jsx`

**Props:**

| Prop | Type | Description |
|---|---|---|
| `currentUser` | `Object` | Logged-in user object |
| `currentChat` | `Object` | Selected contact/chat partner |
| `socket` | `Ref` | Socket.IO instance ref |
| `onlineUsers` | `Array<string>` | Online user IDs |

#### State & Refs

| Name | Type | Purpose |
|---|---|---|
| `messages` | `useState([])` | Chat history: `[{ fromSelf: bool, message: string }]` |
| `scrollRef` | `useRef` | Attached to last message div for auto-scroll |
| `currChat` | `useRef` | Stale-closure fix for `currentChat` inside socket listener |
| `arrivalMessage` | `useState(null)` | New incoming message object |
| `isTyping` | `useState(false)` | Whether current user is typing |
| `typeStatus` | `useState(false)` | Whether chat partner is typing |

#### Effects

**Fetch messages on chat change:**
```js
useEffect(() => {
  // POST /api/messages/getmsg with { from: currentUser._id, to: currentChat._id }
  setMessages(response.data);
}, [currentChat]);
```

**Emit typing status:**
```js
useEffect(() => {
  socket.current.emit("setType", {
    isTyping, from: currentUser._id, to: currentChat._id
  });
}, [isTyping]);
```

**Receive incoming message:**
```js
socket.current.on("msg-recieve", (data) => {
  if (data.from !== currChat.current._id) return; // ignore if not from current chat
  setArrivalMessage({ fromSelf: false, message: data.msg });
});
```

**Receive typing status:**
```js
socket.current.on("typeStatus", (data) => {
  if (data.from !== currChat.current._id) return;
  setTypeStatus(data.typeStatus);
});
```

**Append arrival message:**
```js
useEffect(() => {
  arrivalMessage && setMessages(prev => [...prev, arrivalMessage]);
}, [arrivalMessage]);
```

**Auto-scroll to latest message:**
```js
useEffect(() => {
  scrollRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```

#### `handleSendMsg(msg)`
1. Emit `"send-msg"` to socket: `{ to: currentChat._id, from: currentUser._id, msg }`
2. `POST /api/messages/addmsg` with `{ from, to, message: msg }`
3. Append `{ fromSelf: true, message: msg }` to local `messages` state

#### Header Features
- Avatar image (base64 SVG)
- Username
- Online indicator: `"online"` text (green) — if also typing: `"typing..."` text
- `<Logout>` button in top-right

#### Message Bubble Styling
| Class | Alignment | Background |
|---|---|---|
| `.sended` | `flex-end` (right) | `#4f04ff21` (purple tint) |
| `.recieved` | `flex-start` (left) | `#9900ff20` (purple tint) |

- `white-space: pre-wrap` on `<p>` preserves newlines

#### Styled Component Grid
```css
grid-template-rows: 10% 80% 10%; /* header / messages / input */
```

---

### 9.3 ChatInput — `components/ChatInput.jsx`

**Props:**

| Prop | Type | Description |
|---|---|---|
| `handleSendMsg` | `Function` | Called with the message string on submit |
| `handleTypeState` | `Function` | Called with `true`/`false` to signal typing |

#### State & Refs
```js
const [msg, setMsg] = useState("");
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const typingTimeoutRef = useRef(null);
```

#### Typing Detection
```js
const handleTyping = (e) => {
  setMsg(e.target.value);
  handleTypeState(true);
  // After 1000ms of no typing, signal stopped
  typingTimeoutRef.current = setTimeout(() => handleTypeState(false), 1000);
};
```

> ⚠️ `clearTimeout` is missing — multiple timeouts can accumulate. Should call `clearTimeout(typingTimeoutRef.current)` before setting a new one.

#### Emoji Picker
- Library: `emoji-picker-react` (v4)
- Toggled by `BsEmojiSmileFill` icon click
- `handleEmojiClick(emojiObject)`: appends `emojiObject.emoji` to `msg`

#### Send Logic (`sendChat`)
- Validates `msg.length > 0`
- Calls `handleSendMsg(msg)`
- Resets `msg` to `""`

#### UI Structure
```jsx
<Container>
  <div className="button-container">
    <div className="emoji">
      <BsEmojiSmileFill onClick={toggle} />
      {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
    </div>
  </div>
  <form className="input-container" onSubmit={sendChat}>
    <textarea placeholder="type your message here" onChange={handleTyping} value={msg} />
    <button type="submit"><IoMdSend /></button>
  </form>
</Container>
```

#### Styling Notes
- Background: `#080420` (very dark navy)
- Send button: `#9a86f3` (lavender)
- Emoji icon: `#ffff00c8` (yellow)
- Emoji picker positioned absolutely at `top: -350px`

---

### 9.4 SetAvatar — `components/SetAvatar.jsx`

**Route:** `/setAvatar`

> This component is used as both a route component AND in App.js as `<SetAvatar/>`.

#### State
```js
const [avatars, setAvatars] = useState([]);          // 4 base64 SVG strings
const [isLoading, setIsLoading] = useState(true);    // shows loader.gif while fetching
const [selectedAvatar, setSelectedAvatar] = useState(undefined); // index 0-3
```

#### Avatar Fetching
- API: `https://api.multiavatar.com/apikey=bAnJru6QS2xqBW`
- Fetches 4 random avatars: `GET ${api}/${Math.round(Math.random() * 1000)}`
- Converts response to base64 using `Buffer.from(response.data).toString("base64")`
- Stores in `avatars[]`

#### Set Avatar (`setProfilePicture`)
1. Validate that an avatar is selected
2. `POST /api/auth/setavatar/:userId` with `{ image: avatars[selectedAvatar] }`
3. On success: update sessionStorage user object, set `isAvatarImageSet: true`, `navigate("/")`
4. On failure: `toast.error("Error setting avatar. Please try again.")`

#### Rendering
- Shows `loader.gif` while fetching
- Once loaded: displays 4 avatar options (bordered, click to select)
- Selected avatar gets `border: 0.4rem solid #4e0eff`
- "Set as Profile Picture" button

#### Styling
- Background: `#131324` (very dark navy)
- Button: `#4e0eff` purple

---

### 9.5 Welcome — `components/Welcome.jsx`

**Props:**

| Prop | Type | Description |
|---|---|---|
| `socket` | `Ref` | Passed through to `<Logout>` |

#### State
```js
const [userName, setUserName] = useState("");
```

#### Effect
- Reads username from sessionStorage on mount

#### Render
```jsx
<Container>
  <Logout socket={socket} />     {/* top-right logout button */}
  <img src={giphy.gif} alt="" /> {/* animated GIF */}
  <h1>Welcome, <span>{userName}!</span></h1>
  <h3>Please select a chat to Start messaging.</h3>
</Container>
```

#### Styling
- White text, centered column
- Username `<span>` in `#4e0eff` purple

---

### 9.6 Logout — `components/Logout.jsx`

**Props:**

| Prop | Type | Description |
|---|---|---|
| `socket` | `Ref` | Socket.IO instance ref |

#### `handleClick` logic
1. Parse user `_id` from sessionStorage
2. `GET /api/auth/logout/:id`
3. On HTTP 200: `sessionStorage.clear()`, `socket.current.disconnect()`, `navigate("/login")`

#### Render
```jsx
<Button onClick={handleClick}>
  <BiPowerOff />   {/* power icon from react-icons */}
</Button>
```

#### Styling
- Button background: `#9a86f3` (lavender)
- Icon color: `#ebe7ff` (light purple)

---

## 10. Session Storage

The app uses **`sessionStorage`** (not `localStorage`) to persist the logged-in user.

| Key | Value |
|---|---|
| `process.env.REACT_APP_CURRENT_USER` | `JSON.stringify(userObject)` |

The `userObject` shape:
```json
{
  "_id": "MongoDB ObjectId string",
  "username": "string",
  "email": "string",
  "isAvatarImageSet": true,
  "avatarImage": "base64SVGstring"
}
```

- Set on **login** and **register** (without `password`)
- Updated on **setAvatar** (adds `isAvatarImageSet: true` and `avatarImage`)
- Cleared on **logout**

---

## 11. Socket.IO Client Usage

Socket is created once in `Chat.jsx` using `useRef` so the same instance persists:

```js
socket.current = io(HOST);   // HOST = "http://localhost:4000"
socket.current.emit("add-user", currentUser._id);
```

### Events Emitted by Client

| Event | Payload | Where |
|---|---|---|
| `add-user` | `userId` | `Chat.jsx` — on user load |
| `send-msg` | `{ to, from, msg }` | `ChatContainer.jsx` — on message send |
| `setType` | `{ isTyping, from, to }` | `ChatContainer.jsx` — on typing state change |

### Events Listened by Client

| Event | Payload | Where | Action |
|---|---|---|---|
| `reload` | — | `Chat.jsx` | Toggle `reload` state → re-fetch contacts |
| `msg-recieve` | `{ from, msg }` | `Chat.jsx` (unread) & `ChatContainer.jsx` (display) | Update unread count or append to messages |
| `typeStatus` | `{ from, typeStatus }` | `ChatContainer.jsx` | Show "typing..." in chat header |

> **Stale closure pattern:** Both `Chat.jsx` and `ChatContainer.jsx` use `currChat` `useRef` to capture the latest `currentChat` inside socket event handlers, avoiding stale closures.

---

## 12. Dependencies (`package.json`)

```json
{
  "name": "whispr",
  "version": "0.1.0",
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.8",
    "buffer": "^6.0.3",
    "emoji-picker-react": "^4.9.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^5.1.0",
    "react-router-dom": "^6.22.3",
    "react-scripts": "5.0.1",
    "react-toastify": "^10.0.5",
    "socket.io-client": "^4.7.5",
    "styled-components": "^6.1.8",
    "uuid": "^9.0.1",
    "web-vitals": "^2.1.4"
  }
}
```

| Package | Purpose |
|---|---|
| `react` / `react-dom` | Core React |
| `react-router-dom` | Client-side routing (v6) |
| `axios` | HTTP requests to backend API |
| `socket.io-client` | WebSocket client matching server's Socket.IO |
| `styled-components` | CSS-in-JS component styling |
| `react-toastify` | Toast notification system |
| `emoji-picker-react` | Emoji picker dropdown |
| `react-icons` | Icon components (BsEmojiSmileFill, IoMdSend, BiPowerOff) |
| `buffer` | Node.js Buffer polyfill (for base64 conversion in SetAvatar) |
| `uuid` | UUID generation (imported but currently unused/commented) |

---

## 13. Assets

| File | Location | Used In | Purpose |
|---|---|---|---|
| `Designer.png` | `src/assets/` & `public/` | Register, Login, Contacts | Brand logo in headers |
| `giphy.gif` | `src/assets/` | Welcome | Animated GIF on welcome screen |
| `loader.gif` | `src/assets/` | SetAvatar | Loading spinner while fetching avatars |

---

## 14. Icons Used (react-icons)

| Icon Component | Library | Used In |
|---|---|---|
| `BsEmojiSmileFill` | `react-icons/bs` | ChatInput — emoji picker toggle |
| `IoMdSend` | `react-icons/io` | ChatInput — send button |
| `BiPowerOff` | `react-icons/bi` | Logout — logout button |

---

## 15. Color Palette Summary

| Color | Hex | Used In |
|---|---|---|
| Primary purple | `#4e0eff` | Buttons, focus borders, accents (Register/Login/SetAvatar) |
| Dark primary | `#3a08b5` | Button hover |
| Lavender | `#9a86f3` | Selected contact, send button, logout button |
| Olive green | `#4f5731` | Chat page background |
| Olive sidebar | `#8d9668` | Contacts sidebar |
| Dark maroon | `#573132` | Contact cards |
| Dark red | `#701316` | Current user panel |
| Dark navy | `#080420` | Chat input bar |
| Very dark navy | `#131324` | SetAvatar background |
| Dark search bg | `#1b1b32` | Search bar in contacts |
| Green (online) | `green` | Online dot, unread count, status text |
| Yellow emoji | `#ffff00c8` | Emoji icon |
| Light bg | `#f2f2f2` | Register/Login page background |
| White form | `#ffffff` | Register/Login form card |

---

## 16. Data Flow Summary

```
User Action
    │
    ▼
Page/Component (React state)
    │
    ├─── REST (axios) ──────────────────────► Express API → MongoDB
    │         ◄─────────────────────────────
    │
    └─── Socket.IO (real-time) ─────────────► Socket.IO Server
              ◄─────────────────────────────
```

### Auth Flow
```
Register ──► POST /register ──► sessionStorage ──► /setAvatar ──► /
Login    ──► POST /login    ──► sessionStorage ──► /
```

### Message Flow
```
Send:    ChatInput ──► handleSendMsg ──► socket.emit("send-msg") + POST /addmsg
Receive: socket.on("msg-recieve")   ──► arrivalMessage state ──► messages[]
```

### Online Status Flow
```
Connect:    socket.emit("add-user") ──► server Map ──► broadcast "reload"
Disconnect: server removes from Map ──► broadcast "reload"
Reload:     All clients re-fetch /allusers ──► fresh onlineUsers[]
```

---

## 17. Known Issues & Notes

1. **`clearTimeout` missing in `ChatInput`** — typing timeout refs accumulate since `clearTimeout(typingTimeoutRef.current)` is never called before setting a new timeout.
2. **`uuid` imported but unused** — the `uuid` package is installed but not actively used (originally used for message keys, now replaced by array index).
3. **Effect 5 in `Chat.jsx` runs on mount** — the `useEffect` that clears unread count runs when `currentChat` changes, but `currChat.current` may be undefined initially, causing a minor issue.
4. **Duplicate `msg-recieve` listeners** — `Chat.jsx` and `ChatContainer.jsx` both listen to `"msg-recieve"` on the same socket. Chat.jsx handles unread counts; ChatContainer.jsx handles live message display. The filter `data.from !== currChat.current?._id` separates the concerns.
5. **No protected routes** — protection is done inside each component, not via a router wrapper. Adding a `<PrivateRoute>` HOC would be cleaner.
6. **multiavatar API key** — hardcoded as `apikey=bAnJru6QS2xqBW` in SetAvatar. Should be moved to an environment variable.
7. **Unread count display** — shows `0` for all contacts (including those with 0 unreads). Should conditionally render only when `unreadCount > 0`.
