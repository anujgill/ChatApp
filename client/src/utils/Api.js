export const HOST = "https://chat-app-server-zeta.vercel.app";

export const registerRoute = `${HOST}/api/auth/register`;
export const loginRoute = `${HOST}/api/auth/login`;
export const setAvatarRoute = `${HOST}/api/auth/setavatar`
export const allUsersRoute = `${HOST}/api/auth/allusers`;
export const logoutRoute = `${HOST}/api/auth/logout`;
export const sendMessageRoute = `${HOST}/api/messages/addmsg`;
export const recieveMessageRoute = `${HOST}/api/messages/getmsg`;
