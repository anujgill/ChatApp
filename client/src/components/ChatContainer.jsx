import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
// import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/Api";

export default function ChatContainer({currentUser, currentChat, socket,onlineUsers }) {
  // console.log(currentChat)
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const currChat = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isTyping,setIsTyping] = useState(false);
  const [typeStatus,setTypeStatus] = useState(false);
  // console.log(socket)
  useEffect( () => {
    const func = async () =>{
      const response = await axios.post(recieveMessageRoute, {
        from: currentUser._id,
        to: currentChat._id,
      });
      setMessages(response.data);
  }
    func();
  }, [currentChat]);


  //typing
  useEffect(()=>{
      socket.current.emit("setType",{
        isTyping:isTyping,
        from:currentUser._id,
        to:currentChat._id
      });
  },[isTyping]);

  const handleTypeState = (state)=>{
    setIsTyping(state);
  }





  // useEffect(() => {
  //   const getCurrentChat = async () => {
  //     if (currentChat) {
  //       await JSON.parse(
  //         sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)
  //       )._id;
  //     }
  //   };
  //   getCurrentChat();
  // }, [currentChat]);

  const handleSendMsg = async (msg) => {
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });
    setMessages((prev) => [...prev,{fromSelf:true,message:msg}]);
  };


  useEffect(() => {
    if (socket.current) {
      currChat.current = currentChat;
      socket.current.on("msg-recieve", (data) => {
        if(data.from!==currChat.current._id){
          return;
        }
          setArrivalMessage({ fromSelf: false, message: data.msg });
      });
    }
  }, [currentChat,socket]);

  useEffect(() => {
    if (socket.current) {
      currChat.current = currentChat;
      socket.current.on("typeStatus", (data) => {
        if(data.from!==currChat.current._id){
          return;
        }
          setTypeStatus(data.typeStatus);
      });
    }
  }, [currentChat]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
    { currentChat &&
      (<Container>
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
                  <span className="status">{typeStatus?"typing...":"online"}</span>
            )}
          </div>
        </div>
        <Logout socket={socket}/>
      </div>
      <div className="chat-messages">
        {messages.map((message,index) => {
          return (
            <div ref={scrollRef} key={index}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} handleTypeState={handleTypeState}/>
    </Container>
    )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
          margin-top:1.5rem;
        }
      }
      .username {
        display: flex;
        flex-direction: column;
        h3 {
          color: white;
          margin-bottom: 0.1rem;
        }
        .status {
          font-size: 0.8rem;
          color: green;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
        p{
          white-space: pre-wrap;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
