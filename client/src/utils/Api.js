//http://localhost:4000
//https://api-whispr-messaging.vercel.app/

export const HOST = "https://api-whispr-messaging.vercel.app";

export const registerRoute = `${HOST}/api/auth/register`;
export const verifyRegisterRoute = `${HOST}/api/auth/verify-register`;
export const loginRoute = `${HOST}/api/auth/login`;
export const setAvatarRoute = `${HOST}/api/auth/setavatar`
export const allUsersRoute = `${HOST}/api/auth/allusers`;
export const logoutRoute = `${HOST}/api/auth/logout`;
export const sendMessageRoute = `${HOST}/api/messages/addmsg`;
export const recieveMessageRoute = `${HOST}/api/messages/getmsg`;
export const markAsReadRoute = `${HOST}/api/messages/markread`;
export const sendOtpRoute = `${HOST}/api/auth/send-otp`;
export const verifyOtpRoute = `${HOST}/api/auth/verify-otp`;
export const resetPasswordOtpRoute = `${HOST}/api/auth/reset-password-otp`;
export const searchUsersRoute = `${HOST}/api/auth/search`;
export const sendRequestRoute = `${HOST}/api/auth/request`;
export const respondRequestRoute = `${HOST}/api/auth/request/respond`;
export const getRequestsRoute = `${HOST}/api/auth/requests`;
export const getContactsRoute = `${HOST}/api/auth/contacts`;
