import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/Designer.png";
import axios from "axios";
import {
  searchUsersRoute,
  sendRequestRoute,
  respondRequestRoute,
  getRequestsRoute
} from "../utils/Api";
import { AiOutlineCheck, AiOutlineClose, AiOutlineUserAdd } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Contacts({ contacts, changeChat, currentUser, onlineUsers, refreshContacts, socket }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  useEffect(() => {
    if (currentUser) {
      fetchPendingRequests();
    }
  }, [currentUser, contacts]);

  const fetchPendingRequests = async () => {
    try {
      const { data } = await axios.get(`${getRequestsRoute}/${currentUser._id}`);
      if (data.status === true) {
        setPendingRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `${searchUsersRoute}/${query}?currentUserId=${currentUser._id}`
      );
      if (data.status === true) {
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const sendConnectionRequest = async (targetUserId) => {
    try {
      const { data } = await axios.post(sendRequestRoute, {
        from: currentUser._id,
        to: targetUserId,
      });
      if (data.status === true) {
        if (data.request.status === "accepted") {
          toast.success("Connected!", toastOptions);
          refreshContacts();
        } else {
          toast.success("Request sent!", toastOptions);
        }
        
        setSearchResults((prev) =>
          prev.map((user) =>
            user._id === targetUserId
              ? {
                  ...user,
                  requestStatus: data.request.status,
                  requestSender: currentUser._id,
                  requestId: data.request._id,
                }
              : user
          )
        );

        if (socket && socket.current) {
          socket.current.emit("send-request", {
            from: currentUser._id,
            to: targetUserId,
            request: data.request,
          });
        }
      } else {
        toast.error(data.msg, toastOptions);
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request", toastOptions);
    }
  };

  const handleRequestResponse = async (requestId, status, targetUserId) => {
    try {
      const { data } = await axios.post(respondRequestRoute, {
        requestId,
        status,
      });
      if (data.status === true) {
        if (status === "accepted") {
          toast.success("Request accepted!", toastOptions);
        } else {
          toast.info("Request rejected.", toastOptions);
        }

        setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
        refreshContacts();

        setSearchResults((prev) =>
          prev.map((user) =>
            user._id === targetUserId ? { ...user, requestStatus: status } : user
          )
        );

        if (socket && socket.current) {
          socket.current.emit("request-response", {
            from: currentUser._id,
            to: targetUserId,
            status,
          });
        }
      } else {
        toast.error(data.msg, toastOptions);
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      toast.error("Failed to respond to request", toastOptions);
    }
  };

  const changeCurrentChat = (contact) => {
    setCurrentSelected(contact._id);
    changeChat(contact);
  };

  return (
    <>
      {currentUser && (
        <Container>
          <div className="brand">
            <div className="logo-title">
              <img src={Logo} alt="logo" />
              <h3>WhispR</h3>
            </div>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="contacts-container">
            {isSearching ? (
              <div className="section">
                <h4 className="section-title">Search Results</h4>
                {searchResults.length > 0 ? (
                  searchResults.map((user) => {
                    const isOnline = onlineUsers.includes(user._id);
                    return (
                      <div key={user._id} className="contact-item">
                        <div className="avatar">
                          <img
                            src={`data:image/svg+xml;base64,${user.avatarImage}`}
                            alt=""
                          />
                          {isOnline && <div className="online-dot"></div>}
                        </div>
                        <div className="username">
                          <h3>{user.username}</h3>
                        </div>
                        <div className="action-buttons">
                          {user.requestStatus === "accepted" && (
                            <button
                              className="chat-btn"
                              onClick={() => {
                                changeCurrentChat(user);
                                setSearchQuery("");
                                setIsSearching(false);
                              }}
                            >
                              Message
                            </button>
                          )}
                          {user.requestStatus === "pending" && (
                            user.requestSender === currentUser._id ? (
                              <span className="pending-label">Requested</span>
                            ) : (
                              <div className="btn-group">
                                <button
                                  className="accept-btn"
                                  title="Accept"
                                  onClick={() =>
                                    handleRequestResponse(user.requestId, "accepted", user._id)
                                  }
                                >
                                  <AiOutlineCheck />
                                </button>
                                <button
                                  className="reject-btn"
                                  title="Reject"
                                  onClick={() =>
                                    handleRequestResponse(user.requestId, "rejected", user._id)
                                  }
                                >
                                  <AiOutlineClose />
                                </button>
                              </div>
                            )
                          )}
                          {user.requestStatus === "none" && (
                            <button
                              className="add-btn"
                              onClick={() => sendConnectionRequest(user._id)}
                            >
                              <AiOutlineUserAdd /> Add
                            </button>
                          )}
                          {user.requestStatus === "rejected" && (
                            <button
                              className="add-btn"
                              onClick={() => sendConnectionRequest(user._id)}
                            >
                              Re-add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-results">No users found</p>
                )}
              </div>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div className="section requests-section">
                    <h4 className="section-title">Pending Requests ({pendingRequests.length})</h4>
                    {pendingRequests.map((req) => (
                      <div key={req._id} className="contact-item request-item">
                        <div className="avatar">
                          <img
                            src={`data:image/svg+xml;base64,${req.from.avatarImage}`}
                            alt=""
                          />
                        </div>
                        <div className="username">
                          <h3>{req.from.username}</h3>
                        </div>
                        <div className="btn-group">
                          <button
                            className="accept-btn"
                            onClick={() =>
                              handleRequestResponse(req._id, "accepted", req.from._id)
                            }
                          >
                            <AiOutlineCheck />
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() =>
                              handleRequestResponse(req._id, "rejected", req.from._id)
                            }
                          >
                            <AiOutlineClose />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="section conversations-section">
                  <h4 className="section-title">Conversations</h4>
                  {contacts.length > 0 ? (
                    contacts.map((contact) => {
                      const isOnline = onlineUsers.includes(contact._id);
                      return (
                        <div
                          key={contact._id}
                          className={`contact-item contact ${
                            contact._id === currentSelected ? "selected" : ""
                          }`}
                          onClick={() => changeCurrentChat(contact)}
                        >
                          <div className="avatar">
                            <img
                              src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                              alt=""
                            />
                            {isOnline && <div className="online-dot"></div>}
                          </div>
                          <div className="username">
                            <h3>{contact.username}</h3>
                          </div>
                          {contact.unreadCount > 0 && (
                            <span className="unreads">{contact.unreadCount}</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-results">No conversations yet. Search users to start chatting!</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUser.avatarImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUser.username}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--bg-tertiary);

  .brand {
    padding: 1.5rem 1.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--bg-tertiary);
    flex-shrink: 0;

    .logo-title {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      justify-content: center;
      img {
        height: 2.2rem;
        border-radius: 30%;
        box-shadow: var(--shadow-sm);
      }
      h3 {
        color: var(--color-teal);
        margin: 0;
        font-weight: 700;
        font-size: 1.3rem;
        font-family: var(--font-heading);
      }
    }

    .search-bar {
      border-radius: 50px;
      width: 100%;
      background-color: var(--bg-primary);
      border: 1px solid var(--bg-tertiary);
      display: flex;
      align-items: center;
      padding: 0.2rem 1.2rem;
      transition: all 0.25s ease;
      box-sizing: border-box;

      &:focus-within {
        border-color: var(--color-teal);
        box-shadow: 0 0 0 3px var(--color-teal-light);
      }

      input {
        width: 100%;
        padding: 0.5rem 0;
        border: none;
        outline: none;
        background-color: transparent;
        color: var(--text-primary);
        font-size: 0.9rem;
        font-family: inherit;

        &::placeholder {
          color: var(--text-light);
          opacity: 0.8;
        }
      }
    }
  }

  .contacts-container {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .section {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      .section-title {
        color: var(--text-secondary);
        font-size: 0.8rem;
        text-transform: uppercase;
        margin: 0 0 0.2rem 0.5rem;
        letter-spacing: 1px;
        font-weight: 700;
        font-family: var(--font-heading);
      }

      .no-results {
        color: var(--text-light);
        font-size: 0.85rem;
        text-align: center;
        margin: 1rem 0;
        font-style: italic;
      }
    }

    .contact-item {
      background-color: var(--bg-primary);
      border: 1px solid var(--bg-tertiary);
      min-height: 4.2rem;
      width: 100%;
      border-radius: 12px;
      padding: 0.6rem 0.8rem;
      display: flex;
      gap: 0.8rem;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s ease;
      box-sizing: border-box;
      box-shadow: var(--shadow-sm);

      &.contact {
        cursor: pointer;
        border-left: 4px solid transparent;
        &:hover {
          background-color: var(--bg-tertiary);
          transform: translateY(-1px);
        }
      }

      &.selected {
        background-color: var(--color-teal-light);
        border-left: 4px solid var(--color-teal);
        border-color: var(--color-teal-light);
        box-shadow: var(--shadow-md);
        transform: none !important;

        .username h3 {
          color: var(--color-teal);
        }
      }

      .avatar {
        position: relative;
        display: flex;
        align-items: center;
        img {
          height: 2.6rem;
          width: 2.6rem;
          border-radius: 30%;
          border: 1.5px solid var(--bg-tertiary);
        }
        .online-dot {
          width: 8px;
          height: 8px;
          background-color: var(--color-amber);
          border-radius: 50%;
          position: absolute;
          bottom: -2px;
          right: -2px;
          border: 2px solid var(--bg-primary);
          animation: pulsate 1.8s infinite;
        }
      }

      @keyframes pulsate {
        0% {
          box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.7);
        }
        70% {
          box-shadow: 0 0 0 5px rgba(212, 165, 116, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(212, 165, 116, 0);
        }
      }

      .username {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        h3 {
          color: var(--text-primary);
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
      }

      .unreads {
        background: var(--color-terracotta);
        color: white;
        font-weight: 700;
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        min-width: 0.8rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(194, 112, 91, 0.4);
      }

      .action-buttons {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .btn-group {
        display: flex;
        gap: 0.4rem;
      }

      button {
        padding: 0.4rem 0.8rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: all 0.2s ease;

        &.add-btn {
          background-color: var(--color-teal);
          color: white;
          box-shadow: var(--shadow-sm);
          &:hover {
            background-color: #235346;
            transform: translateY(-1px);
          }
        }

        &.chat-btn {
          background-color: var(--color-teal);
          color: white;
          box-shadow: var(--shadow-sm);
          &:hover {
            background-color: #235346;
            transform: translateY(-1px);
          }
        }

        &.accept-btn {
          background-color: var(--color-teal);
          color: white;
          padding: 0.4rem;
          font-size: 0.9rem;
          &:hover {
            background-color: #235346;
            transform: scale(1.05);
          }
        }

        &.reject-btn {
          background-color: var(--color-terracotta);
          color: white;
          padding: 0.4rem;
          font-size: 0.9rem;
          &:hover {
            background-color: #a85845;
            transform: scale(1.05);
          }
        }
      }

      .pending-label {
        color: var(--text-secondary);
        font-size: 0.75rem;
        font-style: italic;
        background-color: var(--bg-tertiary);
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        border: 1px solid var(--bg-tertiary);
      }
    }
  }

  .current-user {
    background-color: var(--bg-tertiary);
    border-top: 1px solid var(--bg-tertiary);
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    flex-shrink: 0;

    .avatar {
      img {
        height: 2.8rem;
        width: 2.8rem;
        border-radius: 30%;
        border: 2px solid var(--bg-secondary);
      }
    }
    .username {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      h2 {
        color: var(--text-primary);
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        font-family: var(--font-heading);
      }
    }
  }
`;