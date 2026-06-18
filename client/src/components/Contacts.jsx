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
    theme: "dark",
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
  border-radius: 24px 0 0 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: rgba(12, 12, 22, 0.6);
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  .brand {
    padding: 1.5rem 1.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background-color: rgba(0, 0, 0, 0.15);
    flex-shrink: 0;

    .logo-title {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      justify-content: center;
      img {
        height: 2rem;
      }
      h3 {
        color: #f7fafc;
        text-transform: uppercase;
        margin: 0;
        letter-spacing: 2px;
        font-weight: 800;
        font-size: 1.1rem;
        background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .search-bar {
      border-radius: 12px;
      width: 100%;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      padding: 0.2rem 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;

      &:focus-within {
        background-color: rgba(255, 255, 255, 0.05);
        border-color: #6366f1;
        box-shadow: 0 0 12px rgba(99, 102, 241, 0.25);
      }

      input {
        width: 100%;
        padding: 0.5rem 0;
        border: none;
        outline: none;
        background-color: transparent;
        color: white;
        font-size: 0.9rem;

        &::placeholder {
          color: #64748b;
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

    &::-webkit-scrollbar {
      width: 0.25rem;
      &-thumb {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
      }
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      .section-title {
        color: #64748b;
        font-size: 0.75rem;
        text-transform: uppercase;
        margin: 0 0 0.2rem 0.5rem;
        letter-spacing: 1.5px;
        font-weight: 700;
      }

      .no-results {
        color: #64748b;
        font-size: 0.85rem;
        text-align: center;
        margin: 1rem 0;
        font-style: italic;
      }
    }

    .contact-item {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      min-height: 4.2rem;
      width: 100%;
      border-radius: 12px;
      padding: 0.6rem;
      display: flex;
      gap: 0.8rem;
      align-items: center;
      justify-content: space-between;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;

      &.contact {
        cursor: pointer;
        border-left: 4px solid transparent;
        &:hover {
          background-color: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }
      }

      &.selected {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%);
        border-left: 4px solid #6366f1;
        border-color: rgba(99, 102, 241, 0.2);
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.1);
        transform: none !important;
      }

      .avatar {
        position: relative;
        display: flex;
        align-items: center;
        img {
          height: 2.6rem;
          width: 2.6rem;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
        }
        .online-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          position: absolute;
          bottom: 0;
          right: 0;
          border: 2px solid #0d0d18;
          animation: pulsate 1.8s infinite;
        }
      }

      @keyframes pulsate {
        0% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }
        70% {
          box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
      }

      .username {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        h3 {
          color: #f7fafc;
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
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        color: white;
        font-weight: 700;
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        min-width: 0.8rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
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
          background-color: #6366f1;
          color: white;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
          &:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
          }
        }

        &.chat-btn {
          background-color: #10b981;
          color: white;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
          &:hover {
            background-color: #059669;
            transform: translateY(-1px);
          }
        }

        &.accept-btn {
          background-color: #10b981;
          color: white;
          padding: 0.4rem;
          font-size: 0.9rem;
          &:hover {
            background-color: #059669;
            transform: scale(1.05);
          }
        }

        &.reject-btn {
          background-color: #ef4444;
          color: white;
          padding: 0.4rem;
          font-size: 0.9rem;
          &:hover {
            background-color: #dc2626;
            transform: scale(1.05);
          }
        }
      }

      .pending-label {
        color: #64748b;
        font-size: 0.75rem;
        font-style: italic;
        background-color: rgba(255, 255, 255, 0.02);
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.04);
      }
    }
  }

  .current-user {
    background-color: rgba(0, 0, 0, 0.25);
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    flex-shrink: 0;

    .avatar {
      img {
        height: 2.8rem;
        width: 2.8rem;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.08);
      }
    }
    .username {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      h2 {
        color: #f7fafc;
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }
  }
`;