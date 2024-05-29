import React, { useState,useRef } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg,handleTypeState }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleTyping = (e) => {
    setMsg(e.target.value);
    handleTypeState(true);
    typingTimeoutRef.current = setTimeout(() => {
      handleTypeState(false);
    }, 1000);
  };

  const handleEmojiClick = (emojiObject) => {
    // console.log(event)
    let message = msg;
    // console.log(msg)
    message += emojiObject.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <textarea
          placeholder="type your message here"
          onChange={(e) => handleTyping(e)}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  border-radius: 0 0 50px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #080420;
  padding: 0 2rem;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
  }

  .emoji {
    position: relative;
    svg {
      font-size: 1.5rem;
      color: #ffff00c8;
      cursor: pointer;
    }
    .emoji-picker-react {
      position: absolute;
      top: -350px;
      background-color: #080420;
      box-shadow: 0 5px 10px #9a86f3;
      border-color: #9a86f3;
      .emoji-scroll-wrapper::-webkit-scrollbar {
        background-color: #080420;
        width: 5px;
        &-thumb {
          background-color: #9a86f3;
        }
      }
      .emoji-categories {
        button {
          filter: contrast(0);
        }
      }
      .emoji-search {
        background-color: transparent;
        border-color: #9a86f3;
      }
      .emoji-group:before {
        background-color: #080420;
      }
    }
  }

  .input-container {
    flex-grow: 1;
    margin-left: 1rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: #ffffff34;

    textarea {
      flex: 1;
      background: transparent;
      border: none;
      color: white;
      font-size: 1.2rem;
      padding-left: 0.5rem;
      resize: none;
      overflow: hidden;
      height: 1.5rem;
      line-height: 1.5rem;
      &::placeholder {
        color: #aaa;
      }
      &:focus {
        outline: none;
      }
    }

    button {
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      background-color: #9a86f3;
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;

      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
`;


