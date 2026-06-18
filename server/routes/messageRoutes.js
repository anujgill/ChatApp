const { addMessage, getMessages, markAsRead } = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/markread/", markAsRead);

module.exports = router;
