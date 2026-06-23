import React,{useState,useEffect,useRef} from 'react'
import styled from 'styled-components';
import Contacts from '../components/Contacts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getContactsRoute, HOST } from '../utils/Api';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from "socket.io-client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const currChat = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [onlineUsers,setOnlineUsers] = useState([]);
  const [reload,setReload] = useState(true);

  const refreshContacts = () => {
    setReload((prev) => !prev);
  };

  useEffect(() => {
    const func = async()=>{
      if (!sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)) {
        navigate("/login");
      } else {
        setCurrentUser(
          await JSON.parse(
            sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)
          )
        );
      }
    }
    func();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(HOST);
      socket.current.emit("add-user", currentUser._id);
      
      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [currentUser]);

  useEffect(() => {
    const fun = async() =>{
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            const {data} = await axios.get(`${getContactsRoute}/${currentUser._id}`);
            if (data.status === true) {
              setOnlineUsers(data.onlineUsers);
              const updatedContacts = data.users.map(user => ({ ...user, unreadCount: user.unreadCount || 0 }));
              setContacts(updatedContacts);
            }
          } catch (error) {
            console.error("Error fetching contacts:", error);
          }
        } else {
          navigate("/setAvatar");
        }
      }
    }
    fun();
  }, [currentUser, navigate, reload]);

  useEffect(() => {
    if (socket.current) {
      const handleReload = () => {
        setReload((prev) => !prev);
      };
      
      const handleNewRequest = () => {
        setReload((prev) => !prev);
      };

      const handleRequestStatusUpdated = () => {
        setReload((prev) => !prev);
      };

      socket.current.on('reload', handleReload);
      socket.current.on('new-request', handleNewRequest);
      socket.current.on('request-status-updated', handleRequestStatusUpdated);

      return () => {
        if (socket.current) {
          socket.current.off('reload', handleReload);
          socket.current.off('new-request', handleNewRequest);
          socket.current.off('request-status-updated', handleRequestStatusUpdated);
        }
      };
    }
  }, [socket.current]);

  useEffect(() => {
    if (socket.current) {
      currChat.current = currentChat;
      const handleMsgReceive = (data) => {
        if (!currChat.current || data.from !== currChat.current._id) {
          setContacts((prevContacts) =>
            prevContacts.map((contact) =>
              contact._id === data.from
                ? { ...contact, unreadCount: (contact.unreadCount || 0) + 1 }
                : contact
            )
          );
        }
      };

      socket.current.on("msg-recieve", handleMsgReceive);
      return () => {
        if (socket.current) {
          socket.current.off("msg-recieve", handleMsgReceive);
        }
      };
    }
  }, [currentChat, socket.current]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  
  useEffect(() => {
    if (currentChat) {
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact._id === currentChat._id ? { ...contact, unreadCount: 0 } : contact
        )
      );
    }
  }, [currentChat]);

  return (
    <>
      <Container $isChatActive={currentChat !== undefined}>
        <div className="container">
          <Contacts 
            currentUser={currentUser} 
            onlineUsers={onlineUsers} 
            contacts={contacts} 
            changeChat={handleChatChange}
            refreshContacts={refreshContacts}
            socket={socket}
          />
          {currentChat === undefined ? (
            <Welcome socket={socket}/>
          ) : (
            <ChatContainer currentUser={currentUser} onlineUsers={onlineUsers} currentChat={currentChat} socket={socket} changeChat={handleChatChange}/>
          )}
        </div>
      </Container>
      <ToastContainer />
    </>
  )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-primary);
  overflow: hidden;

  .container {
    height: 100vh;
    width: 100vw;
    background-color: var(--bg-primary);
    display: grid;
    grid-template-columns: 340px 1fr;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    
    @media screen and (max-width: 768px) {
      grid-template-columns: 1fr;
      ${({ $isChatActive }) => $isChatActive ? `
        & > :first-child {
          display: none;
        }
      ` : `
        & > :last-child {
          display: none;
        }
      `}
    }
  }
`;

export default Chat;