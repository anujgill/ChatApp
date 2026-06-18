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
      if (val === "") {
        textareaRef.current.style.height = "1.5rem";
      } else {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
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
            <Picker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} />
          )}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <textarea
          ref={textareaRef}
          placeholder="Type your message here..."
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--bg-tertiary);
  padding: 0.8rem 2rem;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0.8rem 1rem;
  }

  .emoji {
    position: relative;
    display: flex;
    align-items: center;
    
    svg {
      font-size: 1.6rem;
      color: var(--color-amber);
      cursor: pointer;
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.1);
      }
    }
    .EmojiPickerReact {
      position: absolute !important;
      bottom: 60px;
      left: 0;
      box-shadow: var(--shadow-lg);
      border-color: var(--bg-tertiary) !important;
      border-radius: 16px;
    }
  }

  .input-container {
    flex-grow: 1;
    margin-left: 1.2rem;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
    padding: 0.3rem 0.5rem 0.3rem 1.2rem;
    transition: all 0.25s ease;

    &:focus-within {
      background-color: var(--bg-primary);
      border-color: var(--color-teal);
      box-shadow: 0 0 0 3px var(--color-teal-light);
    }

    textarea {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-size: 0.95rem;
      padding: 0.3rem 0;
      resize: none;
      min-height: 1.5rem;
      max-height: 100px;
      height: 1.5rem;
      line-height: 1.5rem;
      overflow-y: auto;
      font-family: inherit;

      &::placeholder {
        color: var(--text-light);
        opacity: 0.8;
      }
      &:focus {
        outline: none;
      }
    }

    button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--color-teal);
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        background-color: #235346;
        transform: scale(1.05);
      }

      svg {
        font-size: 1.1rem;
        color: white;
      }
    }
  }
`;
