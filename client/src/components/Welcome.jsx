import React, { useState, useEffect } from "react";
import styled from "styled-components";
import GIF from "../assets/giphy.gif";
import Logout from "./Logout";
export default function Welcome({socket}) {
  const [userName, setUserName] = useState("");
  useEffect( () => {
    const f = async ()=>{
        setUserName(
            await JSON.parse(
              sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)
            )?.username
          );
    }
    f();
  }, []);
  return (
    <Container>
      <Logout socket={socket}/>
      <img src={GIF} alt="" />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  background-color: rgba(12, 12, 22, 0.25);
  position: relative;
  height: 100%;

  img {
    height: 15rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    margin-bottom: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
    span {
      background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }
  }

  h3 {
    color: #64748b;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    letter-spacing: 0.5px;
  }
`;
