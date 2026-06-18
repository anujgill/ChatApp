import React, { useState, useRef, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker, { Theme } from "emoji-picker-react";

export default function ChatInput({ handleSendMsg, handleTypeState }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTyping = (e) => {
    const val = e.target.value;
    setMsg(val);
    handleTypeState(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      handleTypeState(false);
    }, 1000);

    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEmojiClick = (emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
    // After adding emoji, update height of textarea if needed
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const sendChat = (event) => {
    if (event) event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg);
      setMsg("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "1.5rem";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji" ref={emojiRef}>
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && (
            <Picker onEmojiClick={handleEmojiClick} theme={Theme.DARK} />
          )}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <textarea
          ref={textareaRef}
          placeholder="type your message here"
          onChange={(e) => handleTyping(e)}
          onKeyDown={handleKeyDown}
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
    .EmojiPickerReact {
      position: absolute !important;
      bottom: 60px;
      left: 0;
      box-shadow: 0 5px 10px #9a86f3;
      border-color: #9a86f3;
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
      min-height: 1.5rem;
      max-height: 120px;
      height: 1.5rem;
      line-height: 1.5rem;
      overflow-y: auto;
      &::placeholder {
        color: #aaa;
      }
      &:focus {
        outline: none;
      }
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #9a86f3;
        border-radius: 10px;
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


