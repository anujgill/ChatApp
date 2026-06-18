# WhispR — Frontend Complete Reference

> **Single source of truth for the client.** Every file, component, page, hook, state, prop, style, and route is documented here in full detail.

---

## 1. Overview

| Item | Value |
|---|---|
| **App name** | WhispR |
| **Framework** | React 18 |
| **Styling** | styled-components 6.x / Vanilla CSS |
| **Design System**| **Aurora Sand** Light Theme (Teal, Cream, Terracotta, Amber) |
| **Typography** | Headings: **Space Grotesk** / Body: **DM Sans** |
| **Routing** | React Router DOM 6.x |
| **HTTP client** | Axios 1.x |
| **Real-time** | Socket.IO client 4.x |
| **Notifications** | react-toastify 10.x (Light Theme) |
| **Emoji picker** | emoji-picker-react 4.x (Light Theme) |
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
│   └── index.html
└── src/
    ├── index.js           # ReactDOM.createRoot entry
    ├── index.css          # Global resets, Aurora Sand CSS variables, scrollbars
    ├── App.js             # BrowserRouter + Routes mapping
    ├── assets/
    │   ├── Designer.png   # Brand logo
    │   ├── giphy.gif      # Animated Welcome graphic (framed)
    │   └── loader.gif     # Avatar loading spinner
    ├── utils/
    │   └── Api.js         # API endpoint routes mapping
    ├── pages/
    │   ├── Register.jsx   # /register (split-screen, step progress, 6-digit OTP)
    │   ├── Login.jsx      # /login (split-screen, pill input structures)
    │   ├── ForgotPassword.jsx # /forgot-password (split-screen, 3-step recovery)
    │   └── Chat.jsx       # / (full viewport grid dashboard)
    └── components/
        ├── Contacts.jsx   # Sidebar: contacts, user search, requests panel, user card
        ├── ChatContainer.jsx # Chat container: paginated message logger & focus stabilizer
        ├── ChatInput.jsx  # Pill-shaped textarea + light emoji picker + teal send button
        ├── SetAvatar.jsx  # /setAvatar (rounded-square cards layout)
        ├── Welcome.jsx    # Default landing screen, logout wrapper positioning
        └── Logout.jsx     # Terracotta power button, light-cream confirmation modal
```

---

## 3. Global Styles — `index.css`

Defines Google Fonts imports (**Space Grotesk** for headings and **DM Sans** for body) and the light-warm CSS variables/resets:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --bg-primary: #faf7f2;
  --bg-secondary: #f0ebe4;
  --bg-tertiary: #e8e0d4;
  --text-primary: #3d3229;
  --text-secondary: #605246;
  --text-light: #9e8e80;
  
  --color-teal: #2d6a5a;
  --color-teal-light: #e6eee9;
  --color-terracotta: #c2705b;
  --color-terracotta-light: #fbeee9;
  --color-amber: #d4a574;
  --color-amber-light: #faf4eb;
  
  --shadow-sm: 0 2px 8px rgba(61, 50, 41, 0.04);
  --shadow-md: 0 4px 20px rgba(61, 50, 41, 0.08);
  --shadow-lg: 0 10px 30px rgba(61, 50, 41, 0.12);
  
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}

body {
  margin: 0;
  font-family: var(--font-body);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  background-image: 
    radial-gradient(at 100% 0%, rgba(212, 165, 116, 0.15) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(45, 106, 90, 0.1) 0px, transparent 50%);
}
```

---

## 4. Client Routes — `App.js`

Configures routes inside React Router's `<BrowserRouter>`:
- `/register`: `Register` component.
- `/login`: `Login` component.
- `/forgot-password`: `ForgotPassword` component.
- `/`: `Chat` main container.
- `/setAvatar`: `SetAvatar` profile selector.

---

## 5. API Endpoints — `utils/Api.js`

Maps endpoints to `HOST` (e.g. `http://localhost:4000` or production Render address):
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
- **Split-Screen Layout**: Left panel displays brand logo, title, and organic wavy graphic vector. Right panel displays form.
- **Form Groups**: Inputs contain explicit text labels above them. Submitting triggers an OTP to the user's email.
- **Step 2 (OTP Input)**: Uses **6 individual digit textboxes** which automatically forward focus to the next box on input, and slide back on Backspace. Joins array inputs to verify.
- **Toast theme**: Light.

### 6.2 Login (`Login.jsx`)
- Matches the split-screen design of the Register page.
- Collects Username/Email and Password in pill-shaped inputs with outline indicators. Submitting logs in and routes to `/`.

### 6.3 Forgot Password (`ForgotPassword.jsx`)
- **Step 1**: Username or email input.
- **Step 2**: 6 individual digit focus-shifting OTP boxes with masked email notices.
- **Step 3**: Password reset inputs with show/hide toggle visibility icons.
- **Styling**: Consistent with the Split-Screen layout and Aurora Sand Light-Cream specifications.

### 6.4 Chat Dashboard (`Chat.jsx`)
- **Full Viewport Layout**: Edge-to-edge layout filling 100vh and 100vw, eliminating centered overlay cards and neon background glow orbs.
- **Grid Structure**: Column splits set to `340px` (contacts panel) and `1fr` (chat space). Responsive layouts collapse to `1fr` on small viewports.

---

## 7. Component Specifications

### 7.1 Contacts Sidebar (`Contacts.jsx`)
- **Search Panel**: Pill-shaped bar with soft borders that turns teal on focus. Searches users on input changes, ignoring empty queries.
- **Connection / Message Requests**:
  - Displays inbound pending connection requests in a special section at the top of the contacts list. Users can accept (check button) or reject (cross button) requests, triggering state updates.
  - Integrates user search results with actionable request buttons: showing "Add User" (sends a request), "Pending" (if request was sent), or "Connected" based on search query status.
  - Relays request/response events via sockets in real-time (`send-request` and `request-response`).
- **Contact Cards**: Light cream container elements with bottom separators. Selected contact displays light teal background washes and a forest teal left-side indicator border. Displays active user counts and unread message counters.
- **Online indicator**: Warm amber dots pulsating via CSS keyframes.
- **Avatar profiles**: Rounded-square frames (`border-radius: 30%`) instead of circular outlines.
- **Current user**: Solid sand panel background (`var(--bg-tertiary)`) displayed at the footer of the contacts sidebar.

### 7.2 Chat Container (`ChatContainer.jsx`)
- **Header info**: Clean sand-border layout showing rounded-square contact profile, typing state status, and online status. Shows "typing..." in green text when the user's active contact is typing.
- **Message List**: Bubbles use custom colors:
  - Sent: Solid teal (`var(--color-teal)`) with white text and trailing right-side tail.
  - Received: Sand-cream (`var(--bg-secondary)`) with warm charcoal text and left-side tail.
- **Unread Messages Divider**:
  - Calculated dynamically using `firstUnreadMessageId` (first message in the unread subset).
  - Renders a visually prominent divider separating read and unread messages displaying the count (e.g., `3 UNREAD MESSAGES`).
  - Auto-scrolls the divider into view on chat loading (`unreadDividerRef.current.scrollIntoView`).
- **"New Messages" Badge**:
  - Renders a floating terracotta badge (`.new-messages-badge`) at the bottom of the message log when a new incoming message is received while the user is scrolled up.
  - Displays the count of unread incoming messages received while scrolled.
  - Clicking the badge triggers a smooth scroll to the bottom (`scrollToBottom("smooth")`) and resets the count.
- **Message Pagination (Lazy Loading)**:
  - Fetches message documents incrementally in batches of **20** to optimize loading latency.
  - Monitors scrolling: When `scrollTop < 10`, `hasMore` is true, and `isInitialLoad` is false, it requests page `page + 1`.
  - Scroll stabilization: Records scrollHeight metrics before prepends and aligns the scrollbar to retain visual reading focus.
  - Uses `lastMessageIdRef` to prevent bottom scroll triggers when loading older history, ensuring auto-scroll only fires on new incoming/outgoing messages.
  - Displays a `.loading-more` loader at the top of the chat panel.

### 7.3 Chat Input (`ChatInput.jsx`)
- **Textarea**: Pill-shaped cream container that expands on typing new lines and shrinks back to `"1.5rem"` height when cleared.
- **Send button**: Solid teal circular button containing send symbol icon.
- **Emoji trigger**: Warm amber smiley icon toggling the **Light** themed emoji sheets drawer. Includes a clicks-outside handler to close the drawer automatically if the user clicks anywhere else in the document.
- **Typing Status Emission**:
  - Triggers a callback `handleTypeState(true)` immediately when the user starts typing.
  - Employs a `1000`ms timeout to clear typing state and trigger `handleTypeState(false)` after user ceases input, reducing socket spam.
  - Prevents default submit behavior for standard `Enter` key presses (submits chat), allowing newlines with `Shift+Enter`.

### 7.4 Set Avatar Selector (`SetAvatar.jsx`)
- Overhauled to display generated avatars inside rounded-square grid slots. Selected avatar displays a teal highlight glow.
- Action buttons styled as a teal primary submission pill and a secondary outlined shuffle button.

### 7.5 Logout (`Logout.jsx`)
- Power button styled in terracotta tints (`var(--color-terracotta)`), expanding to reveal text on hover.
- Modal overlay displays a clean light-cream dialog panel containing cancel/confirm actions.
