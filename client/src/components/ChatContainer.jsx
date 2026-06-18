import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, markAsReadRoute } from "../utils/Api";

export default function ChatContainer({currentUser, currentChat, socket, onlineUsers }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const chatMessagesRef = useRef();
  const unreadDividerRef = useRef(null);
  const currChat = useRef();
  const isInitialLoad = useRef(true);
  
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typeStatus, setTypeStatus] = useState(false);
  
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);
  const [unreadCountValue, setUnreadCountValue] = useState(0);

  useEffect(() => {
    const func = async () => {
      try {
        const response = await axios.post(recieveMessageRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        const fetchedMessages = response.data;
        setMessages(fetchedMessages);
        setNewMessagesCount(0);
        setIsUserScrolledUp(false);
        isInitialLoad.current = true;

        const unreadCount = currentChat.unreadCount || 0;
        setUnreadCountValue(unreadCount);
        if (unreadCount > 0 && fetchedMessages.length >= unreadCount) {
          const firstUnreadIndex = fetchedMessages.length - unreadCount;
          setFirstUnreadMessageId(fetchedMessages[firstUnreadIndex]._id || null);
        } else {
          setFirstUnreadMessageId(null);
        }
      } catch (error) {
        console.error("Error receiving messages:", error);
      }
    };
    func();
  }, [currentChat]);

  // typing emit
  useEffect(() => {
    if (socket.current) {
      socket.current.emit("setType", {
        isTyping: isTyping,
        from: currentUser._id,
        to: currentChat._id
      });
    }
  }, [isTyping]);

  const handleTypeState = (state) => {
    setIsTyping(state);
  };

  const handleSendMsg = async (msg) => {
    if (socket.current) {
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: currentUser._id,
        msg,
      });
    }
    try {
      await axios.post(sendMessageRoute, {
        from: currentUser._id,
        to: currentChat._id,
        message: msg,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);
  };

  // receive socket message
  useEffect(() => {
    if (socket.current) {
      currChat.current = currentChat;
      const handleMsgReceive = (data) => {
        if (currChat.current && data.from === currChat.current._id) {
          setArrivalMessage({ fromSelf: false, message: data.msg });
        }
      };

      socket.current.on("msg-recieve", handleMsgReceive);
      return () => {
        if (socket.current) {
          socket.current.off("msg-recieve", handleMsgReceive);
        }
      };
    }
  }, [currentChat, socket]);

  // typing status socket
  useEffect(() => {
    if (socket.current) {
      currChat.current = currentChat;
      const handleTypeStatus = (data) => {
        if (currChat.current && data.from === currChat.current._id) {
          setTypeStatus(data.typeStatus);
        }
      };

      socket.current.on("typeStatus", handleTypeStatus);
      return () => {
        if (socket.current) {
          socket.current.off("typeStatus", handleTypeStatus);
        }
      };
    }
  }, [currentChat, socket]);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
      if (!arrivalMessage.fromSelf) {
        axios.post(markAsReadRoute, {
          from: currentChat._id,
          to: currentUser._id,
        }).catch((err) => console.error("Error marking message as read:", err));
      }
    }
  }, [arrivalMessage, currentChat, currentUser]);

  const scrollToBottom = (behavior = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
    }
    setIsUserScrolledUp(false);
    setNewMessagesCount(0);
  };

  // Handle scrolling detection
  const handleScroll = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      if (isAtBottom) {
        setIsUserScrolledUp(false);
        setNewMessagesCount(0);
      } else {
        setIsUserScrolledUp(true);
      }
    }
  };

  // Scroll logic on messages change
  useEffect(() => {
    if (messages.length === 0) return;
    if (isInitialLoad.current) {
      if (firstUnreadMessageId && unreadDividerRef.current) {
        unreadDividerRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        scrollToBottom("auto");
      }
      isInitialLoad.current = false;
    } else {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.fromSelf || !isUserScrolledUp) {
        scrollToBottom("smooth");
      } else {
        setNewMessagesCount((prev) => prev + 1);
      }
    }
  }, [messages, firstUnreadMessageId]);

  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                  alt=""
                />
              </div>
              <div className="username">
                <h3>{currentChat.username}</h3>
                {onlineUsers.includes(currentChat._id) && (
                  <span className="status">
                    {typeStatus ? "typing..." : "online"}
                  </span>
                )}
              </div>
            </div>
            <Logout socket={socket} />
          </div>

          <div className="messages-wrapper">
            <div
              className="chat-messages"
              ref={chatMessagesRef}
              onScroll={handleScroll}
            >
              {messages.map((message, index) => {
                const showDivider = firstUnreadMessageId && message._id === firstUnreadMessageId;
                return (
                  <React.Fragment key={message._id || index}>
                    {showDivider && (
                      <div className="unread-divider-container" ref={unreadDividerRef}>
                        <div className="unread-line"></div>
                        <span className="unread-label">
                          {unreadCountValue} Unread Message{unreadCountValue > 1 ? "s" : ""}
                        </span>
                        <div className="unread-line"></div>
                      </div>
                    )}
                    <div
                      className={`message ${
                        message.fromSelf ? "sended" : "recieved"
                      }`}
                    >
                      <div className="content">
                        <p>{message.message}</p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {isUserScrolledUp && newMessagesCount > 0 && (
              <div
                className="new-messages-badge"
                onClick={() => scrollToBottom("smooth")}
              >
                ↓ {newMessagesCount} New Message{newMessagesCount > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <ChatInput
            handleSendMsg={handleSendMsg}
            handleTypeState={handleTypeState}
          />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 12% 76% 12%;
  gap: 0.1rem;
  overflow: hidden;
  height: 100%;
  background-color: rgba(12, 12, 22, 0.35);

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 2.6rem;
          width: 2.6rem;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
        }
      }
      .username {
        display: flex;
        flex-direction: column;
        h3 {
          color: white;
          margin: 0 0 0.15rem 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .status {
          font-size: 0.75rem;
          font-weight: 600;
          color: #10b981;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      }
    }
  }

  .messages-wrapper {
    position: relative;
    grid-row: 2;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;

    .new-messages-badge {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 0.6rem 1.2rem;
      border-radius: 2rem;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
      z-index: 10;
      animation: bounce 2s infinite;
      font-size: 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      &:hover {
        background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
      }
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) translateY(0);
      }
      40% {
        transform: translateX(-50%) translateY(-10px);
      }
      60% {
        transform: translateX(-50%) translateY(-5px);
      }
    }

    .unread-divider-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 1.2rem 0;
      width: 100%;

      .unread-line {
        flex: 1;
        height: 1px;
        background-color: rgba(99, 102, 241, 0.2);
      }

      .unread-label {
        background-color: rgba(99, 102, 241, 0.1);
        color: #a5b4fc;
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        border: 1px solid rgba(99, 102, 241, 0.2);
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }
    }

    .chat-messages {
      flex-grow: 1;
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      overflow: auto;
      &::-webkit-scrollbar {
        width: 0.2rem;
        &-thumb {
          background-color: rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
        }
      }
    }

    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 50%;
        overflow-wrap: break-word;
        padding: 0.9rem 1.1rem;
        font-size: 0.95rem;
        line-height: 1.45;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 75%;
        }
        p {
          white-space: pre-wrap;
          margin: 0;
        }
      }
    }

    .sended {
      justify-content: flex-end;
      .content {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(124, 58, 237, 0.12) 100%);
        border: 1px solid rgba(99, 102, 241, 0.25);
        color: #e2e8f0;
        border-radius: 16px 16px 4px 16px;
      }
    }

    .recieved {
      justify-content: flex-start;
      .content {
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: #cbd5e1;
        border-radius: 16px 16px 16px 4px;
      }
    }
  }
`;
