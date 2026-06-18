import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, markAsReadRoute } from "../utils/Api";

export default function ChatContainer({currentUser, currentChat, socket, onlineUsers }) {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const scrollRef = useRef();
  const chatMessagesRef = useRef();
  const unreadDividerRef = useRef(null);
  const currChat = useRef();
  const isInitialLoad = useRef(true);
  const lastMessageIdRef = useRef(null);
  
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
          page: 1,
          limit: 20,
        });
        const { messages: fetchedMessages, hasMore: more } = response.data;
        setMessages(fetchedMessages);
        setPage(1);
        setHasMore(more);
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

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    const container = chatMessagesRef.current;
    const oldScrollHeight = container ? container.scrollHeight : 0;
    
    try {
      const nextPage = page + 1;
      const response = await axios.post(recieveMessageRoute, {
        from: currentUser._id,
        to: currentChat._id,
        page: nextPage,
        limit: 20,
      });
      const { messages: fetchedMessages, hasMore: more } = response.data;
      
      setMessages((prev) => [...fetchedMessages, ...prev]);
      setPage(nextPage);
      setHasMore(more);
      
      setTimeout(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - oldScrollHeight;
        }
      }, 0);
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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
      setArrivalMessage(null);
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

      if (scrollTop < 10 && hasMore && !loadingMore && !isInitialLoad.current) {
        loadMoreMessages();
      }
    }
  };

  // Scroll logic on messages change
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage ? (lastMessage._id || lastMessage.message) : null;

    if (isInitialLoad.current) {
      if (firstUnreadMessageId && unreadDividerRef.current) {
        unreadDividerRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        scrollToBottom("auto");
      }
      isInitialLoad.current = false;
      lastMessageIdRef.current = lastMessageId;
    } else {
      if (lastMessageId !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMessageId;
        if (lastMessage.fromSelf || !isUserScrolledUp) {
          scrollToBottom("smooth");
        } else {
          setNewMessagesCount((prev) => prev + 1);
        }
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
              {loadingMore && <div className="loading-more">Loading older messages...</div>}
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
  grid-template-rows: 10% 78% 12%;
  gap: 0.1rem;
  overflow: hidden;
  height: 100%;
  background-color: var(--bg-primary);

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--bg-tertiary);
    box-shadow: var(--shadow-sm);
    z-index: 5;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 2.6rem;
          width: 2.6rem;
          border-radius: 30%;
          border: 1.5px solid var(--bg-tertiary);
        }
      }
      .username {
        display: flex;
        flex-direction: column;
        h3 {
          color: var(--text-primary);
          margin: 0 0 0.15rem 0;
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-heading);
        }
        .status {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-teal);
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

    .loading-more {
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-light);
      padding: 0.5rem 0;
      font-style: italic;
      flex-shrink: 0;
    }

    .new-messages-badge {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-terracotta);
      color: white;
      padding: 0.6rem 1.2rem;
      border-radius: 2rem;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(194, 112, 91, 0.4);
      z-index: 10;
      animation: bounce 2s infinite;
      font-size: 0.85rem;
      border: 1px solid var(--bg-tertiary);
      &:hover {
        background: #a85845;
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
        background-color: var(--bg-tertiary);
      }

      .unread-label {
        background-color: var(--color-terracotta-light);
        color: var(--color-terracotta);
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        border: 1px solid var(--color-terracotta-light);
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
        box-shadow: var(--shadow-sm);
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
        background: var(--color-teal);
        color: white;
        border-radius: 20px 20px 4px 20px;
      }
    }

    .recieved {
      justify-content: flex-start;
      .content {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border-radius: 20px 20px 20px 4px;
      }
    }
  }
`;
