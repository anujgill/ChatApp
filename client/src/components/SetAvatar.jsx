import React, { useEffect, useState } from "react";
import styled from "styled-components";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/Api";
import axios from "axios";
import { Buffer } from "buffer";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [shuffling, setShuffling] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  useEffect(() => {
    if (!sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)) {
      navigate("/login");
    }
  }, [navigate]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      const user = JSON.parse(
        sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)
      );

      try {
        const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
          image: avatars[selectedAvatar],
        });

        if (data.isSet) {
          user.isAvatarImageSet = true;
          user.avatarImage = data.image;
          sessionStorage.setItem(
            process.env.REACT_APP_CURRENT_USER,
            JSON.stringify(user)
          );
          navigate("/");
        } else {
          toast.error("Error setting avatar. Please try again.", toastOptions);
        }
      } catch (error) {
        toast.error("Failed to set avatar. Please try again.", toastOptions);
      }
    }
  };

  const generateAvatars = async () => {
    try {
      setShuffling(true);
      // Lazy load Dicebear modules to keep the initial client bundle footprint light
      const { createAvatar } = await import("@dicebear/core");
      const { adventurer } = await import("@dicebear/collection");
      
      const fetchedAvatars = [];
      for (let i = 0; i < 4; i++) {
        const seed = Math.random().toString(36).substring(7);
        const avatar = createAvatar(adventurer, {
          seed,
          size: 128,
        });
        const svg = avatar.toString();
        const base64 = Buffer.from(svg).toString("base64");
        fetchedAvatars.push(base64);
      }
      setAvatars(fetchedAvatars);
      setSelectedAvatar(undefined);
      setIsLoading(false);
      setShuffling(false);
    } catch (error) {
      console.error("Error generating avatars:", error);
      toast.error("Failed to generate avatars. Please refresh.", toastOptions);
      setIsLoading(false);
      setShuffling(false);
    }
  };

  useEffect(() => {
    generateAvatars();
  }, []);

  return (
    <>
      <Container>
        {isLoading ? (
          <img src={loader} alt="loader" className="loader" />
        ) : (
          <div className="content-box">
            <div className="title-container">
              <h1>Pick an Avatar as your profile picture</h1>
            </div>
            <div className="avatars">
              {avatars.map((avatar, index) => {
                return (
                  <div
                    className={`avatar ${
                      selectedAvatar === index ? "selected" : ""
                    }`}
                    key={index}
                  >
                    <img
                      src={`data:image/svg+xml;base64,${avatar}`}
                      alt="avatar"
                      onClick={() => setSelectedAvatar(index)}
                    />
                  </div>
                );
              })}
            </div>
            <div className="actions">
              <button 
                onClick={generateAvatars} 
                className="shuffle-btn" 
                disabled={shuffling}
              >
                {shuffling ? "Shuffling..." : "Shuffle Avatars"}
              </button>
              <button onClick={setProfilePicture} className="submit-btn">
                Set as Profile Picture
              </button>
            </div>
          </div>
        )}
        <ToastContainer />
      </Container>
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: var(--bg-primary);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  .loader {
    max-inline-size: 100%;
    z-index: 1;
  }

  .content-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
    border-radius: 24px;
    padding: 3rem;
    box-shadow: var(--shadow-lg);
    z-index: 1;
    width: 90%;
    max-width: 600px;
    box-sizing: border-box;
  }

  .title-container {
    h1 {
      color: var(--text-primary);
      text-align: center;
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      font-family: var(--font-heading);
    }
  }

  .avatars {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;

    .avatar {
      cursor: pointer;
      border: 2px solid var(--bg-tertiary);
      padding: 0.4rem;
      border-radius: 30%;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.25s ease;
      background-color: var(--bg-primary);

      img {
        height: 5.5rem;
        width: 5.5rem;
        transition: transform 0.25s ease;
      }

      &:hover {
        border-color: var(--color-teal);
        transform: scale(1.05);
      }
    }

    .selected {
      border: 3px solid var(--color-teal);
      background-color: var(--color-teal-light);
      box-shadow: 0 0 20px var(--color-teal-light);
    }
  }

  .actions {
    display: flex;
    gap: 1.5rem;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .submit-btn {
    background: var(--color-teal);
    color: white;
    padding: 0.95rem 1.8rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    border-radius: 50px;
    font-size: 0.9rem;
    transition: all 0.25s ease;
    box-shadow: var(--shadow-sm);
    font-family: var(--font-heading);

    &:hover {
      background: #235346;
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .shuffle-btn {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--text-light);
    padding: 0.95rem 1.8rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 50px;
    font-size: 0.9rem;
    transition: all 0.25s ease;
    font-family: var(--font-heading);

    &:hover:not(:disabled) {
      background: var(--bg-primary);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
