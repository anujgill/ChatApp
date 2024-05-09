import React,{useState,useEffect,useRef} from 'react'
import styled from 'styled-components';
import Contacts from '../components/Contacts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { allUsersRoute , HOST } from '../utils/Api';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from "socket.io-client";

function Chat() {
  // console.log("chat")
  const navigate = useNavigate();
  const socket = useRef();
  // console.log(socket)
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [onlineUsers,setOnlineUsers] = useState([]);
  const [reload,setReload] = useState(true);

  useEffect( () => {
    const func = async()=>{
    if (!sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)) {
      // console.log("first")
      navigate("/login");
      // console.log("second")
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
      // console.log(socket,socket.current);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect( () => {
    // console.log("first")
    const fun = async() =>{
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        const {data} = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setOnlineUsers(data.onlineUsers)
        console.log(data.onlineUsers);
        setContacts(data.users);
        // console.log(contacts)
     } else {
        navigate("/setAvatar");
      }
    }
  }

  fun();
    
  }, [currentUser,navigate,reload]);

  if (socket.current) {
    socket.current.on('reload', () => {
      if(reload===true)
        setReload(false);
      else
        setReload(true);
    });
  }
  


  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <>
      <Container>
        <div className="container">
          <Contacts currentUser={currentUser} onlineUsers={onlineUsers} contacts={contacts} changeChat={handleChatChange}/>
          {currentChat === undefined ? (
            <Welcome socket={socket}/>
          ) : (
            <ChatContainer onlineUsers={onlineUsers} currentChat={currentChat} socket={socket}/>
          )}
        </div>
      </Container>
    </>
  )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #4f5731;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: rgba(0, 0, 0, 0.6);
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
    border-radius:50px;
  }
`;

export default Chat;