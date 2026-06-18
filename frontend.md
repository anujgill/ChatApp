# WhispR — Frontend Complete Reference

> **Single source of truth for the client.** Every file, component, page, hook, state, prop, style, and route is documented here in full detail.

---

## 1. Overview

| Item | Value |
|---|---|
| **App name** | WhispR |
| **Framework** | React 18 |
| **Styling** | styled-components 6.x / Vanilla CSS |
| **Routing** | React Router DOM 6.x |
| **HTTP client** | Axios 1.x |
| **Real-time** | Socket.IO client 4.x |
| **Notifications** | react-toastify 10.x |
| **Emoji picker** | emoji-picker-react 4.x |
| **Icons** | react-icons 5.x |
| **Dev server port** | `3000` |
| **Entry point** | `client/src/index.js` |
| **Start command** | `npm start` |

---

## 2. Directory Structure

```
client/
├── package.json
├── public/
│   ├── index.html         # HTML shell — title: "Whispr"
│   ├── Designer.png       # Favicon / brand icon
└── src/
    ├── index.js           # ReactDOM.createRoot entry
    ├── index.css          # Global resetting and font styling
    ├── App.js             # BrowserRouter + Routes mapping
    ├── assets/
    │   ├── Designer.png   # Brand logo
    │   ├── giphy.gif      # Animated Welcome graphic
    │   └── loader.gif     # Avatar loading spinner
    ├── utils/
    │   └── Api.js         # API endpoint routes mapping
    ├── pages/
    │   ├── Register.jsx   # /register (2-step details & email OTP verification)
    │   ├── Login.jsx      # /login (dark glassmorphic form)
    │   ├── ForgotPassword.jsx # /forgot-password (3-step OTP password recovery)
    │   └── Chat.jsx       # / (main dashboard orchestration container)
    └── components/
        ├── Contacts.jsx   # Sidebar: contacts, user search, requests panel
        ├── ChatContainer.jsx # Main chat history window & messages list
        ├── ChatInput.jsx  # Rich textarea + emoji sheet controller
        ├── SetAvatar.jsx  # /setAvatar (avatar selection interface)
        ├── Welcome.jsx    # Default landing screen details
        └── Logout.jsx     # Power button component (hover reveal + logout modal)
```

---

## 3. Global Styles — `index.css`

Includes global font imports (`Plus Jakarta Sans` from Google Fonts) and standard dark backdrop resets:
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

body {
  margin: 0;
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  background-color: #0f0c1b;
  color: #f7fafc;
}
```

---

## 4. Client Routes — `App.js`

Configures client routes inside React Router's `<BrowserRouter>`:
- `/register`: `Register` component.
- `/login`: `Login` component.
- `/forgot-password`: `ForgotPassword` component.
- `/`: `Chat` main container.
- `/setAvatar`: `SetAvatar` profile selector.

---

## 5. API Endpoints — `utils/Api.js`

Provides unified endpoints pointing to `HOST` (e.g. `http://localhost:4000` or production Render address):
- `registerRoute`: `/api/auth/register`
- `verifyRegisterRoute`: `/api/auth/verify-register`
- `loginRoute`: `/api/auth/login`
- `setAvatarRoute`: `/api/auth/setavatar`
- `getContactsRoute`: `/api/auth/contacts`
- `searchUsersRoute`: `/api/auth/search`
- `sendOtpRoute`: `/api/auth/send-otp`
- `verifyOtpRoute`: `/api/auth/verify-otp`
- `resetPasswordOtpRoute`: `/api/auth/reset-password-otp`
- `sendRequestRoute`: `/api/auth/request`
- `respondRequestRoute`: `/api/auth/request/respond`
- `getRequestsRoute`: `/api/auth/requests`
- `sendMessageRoute`: `/api/messages/addmsg`
- `recieveMessageRoute`: `/api/messages/getmsg`
- `markAsReadRoute`: `/api/messages/markread`

---

## 6. Page Specifications

### 6.1 Register (`Register.jsx`)
- **Step 1 (User Info)**: Username (validated for 3-20 chars, alphanumeric + underscores), Email, Password, Confirm Password. Submitting triggers an OTP to the user's email and goes to Step 2.
- **Step 2 (Verification)**: Asks for the 6-digit OTP code sent to the email. Succeeding logs in the user and routes to `/setAvatar`.
- **Styling**: Center-aligned card styled with dark glass backdrop (`rgba(12, 12, 22, 0.5)`), glowing backdrop gradients (`#6366f1` / `#a855f7`), and premium input transitions.

### 6.2 Login (`Login.jsx`)
- Collects Username or Email and Password. Supports show/hide password toggle.
- Form card matches the same glassmorphism design parameters as Register.

### 6.3 Forgot Password (`ForgotPassword.jsx`)
- **Step 1**: User inputs username or email to trigger OTP code.
- **Step 2**: User enters the 6-digit code validated against the server.
- **Step 3**: User enters their new password with toggle visibility icons.
- **Styling**: Structured with the same dark glassmorphic styling (matching the rest of the login/register layouts).

### 6.4 Chat Dashboard (`Chat.jsx`)
- Orchestrates contacts list, pending search results, and active messaging socket.
- Automatically handles background socket event listeners for connection requests, dynamic messaging reloads, and incoming notifications.

---

## 7. Component Specifications

### 7.1 Contacts Sidebar (`Contacts.jsx`)
- **Inbound Requests List**: Displays pending requests with "Accept" and "Decline" buttons.
- **Search Panel**: Allows searching users dynamically. Shows badges (`Add Connection`, `Pending Approval`, `Connected`) based on relationship state.
- **Active Chats Sidebar**: Shows current chat cards.
  - pulsating green dots for online status indicators.
  - Slack-style glowing indigo left-hand border for the currently selected active conversation card.
  - Flexbox username text truncation (`text-overflow: ellipsis`) to prevent card overlaps on long names.
- **Logout Action**: Custom hover-to-reveal button (reveals "Logout" text and spins power icon 90 degrees) which displays a confirmation modal overlay on click.

### 7.2 Chat Container (`ChatContainer.jsx`)
- **Header info**: Shows active contact avatar, username, and typing indicators.
- **Unread Messages Divider**: If unread messages exist, renders a horizontal message banner above the first unread message, automatically scrolling the container viewport to focus on the banner.
- **Message List**: Bubbles use custom styled gradients. Decrypts and reads chat history, updating message `isRead` flags automatically.
