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
      <div className="logout-wrapper">
        <Logout socket={socket}/>
      </div>
      <img src={GIF} alt="Welcome" />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-primary);
  flex-direction: column;
  background-color: var(--bg-primary);
  position: relative;
  height: 100%;
  width: 100%;

  .logout-wrapper {
    position: absolute;
    top: 2rem;
    right: 2rem;
  }

  img {
    height: 15rem;
    border-radius: 30px;
    box-shadow: var(--shadow-md);
    margin-bottom: 2rem;
    border: 3px solid var(--bg-secondary);
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
    font-family: var(--font-heading);
    
    span {
      color: var(--color-teal);
      font-weight: 700;
    }
  }

  h3 {
    color: var(--text-secondary);
    font-size: 1.1rem;
    font-weight: 400;
    text-align: center;
    margin: 0;
  }
`;
