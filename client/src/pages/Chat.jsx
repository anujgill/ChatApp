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
  }, []);


  useEffect(() => {
    if (currentUser) {
      socket.current = io(HOST);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect( () => {
    // console.log("first")
    const fun = async() =>{
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        // console.log(data)
        setContacts(data.data);
        // console.log(contacts)
     } else {
        navigate("/setAvatar");
      }
    }
  }

  fun();
    
  }, [currentUser]);

  

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <>
      <Container>
        <div className="container">
          <Contacts contacts={contacts} changeChat={handleChatChange}/>
          {currentChat === undefined ? (
            <Welcome/>
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket}/>
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
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;