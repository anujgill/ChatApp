import React, { useState, useEffect } from "react";
import styled from "styled-components";
import GIF from "../assets/giphy.gif";
export default function Welcome() {
  const [userName, setUserName] = useState("");
  useEffect( () => {
    const f = async ()=>{
        setUserName(
            await JSON.parse(
              sessionStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
            ).username
          );
    }
    f();
  }, []);
  return (
    <Container>
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
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;
