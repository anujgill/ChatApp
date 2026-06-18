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
    theme: "dark",
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
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
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
  background-color: #07070c;
  background-image: radial-gradient(circle at 50% -20%, #171635 0%, #07070c 75%);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.12;
    z-index: 0;
  }
  .glow-orb-1 {
    width: 400px;
    height: 400px;
    background-color: #6366f1;
    top: 10%;
    right: 15%;
  }
  .glow-orb-2 {
    width: 350px;
    height: 350px;
    background-color: #a855f7;
    bottom: 10%;
    left: 15%;
  }

  .loader {
    max-inline-size: 100%;
    z-index: 1;
  }

  .content-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    background-color: rgba(12, 12, 22, 0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 3rem;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    z-index: 1;
    width: 90%;
    max-width: 600px;
    box-sizing: border-box;
  }

  .title-container {
    h1 {
      color: white;
      text-align: center;
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .avatars {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;

    .avatar {
      cursor: pointer;
      border: 2px solid rgba(255, 255, 255, 0.06);
      padding: 0.4rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: rgba(255, 255, 255, 0.03);

      img {
        height: 5.5rem;
        width: 5.5rem;
        transition: transform 0.3s ease;
      }

      &:hover {
        border-color: #6366f1;
        transform: scale(1.05);
      }
    }

    .selected {
      border: 3px solid #6366f1;
      background-color: rgba(99, 102, 241, 0.1);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
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
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    padding: 0.95rem 1.8rem;
    border: none;
    font-weight: 700;
    cursor: pointer;
    border-radius: 12px;
    font-size: 0.9rem;
    text-transform: uppercase;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35);
    letter-spacing: 1px;

    &:hover {
      background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(124, 58, 237, 0.5);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .shuffle-btn {
    background: transparent;
    color: #a5b4fc;
    border: 1px solid rgba(165, 180, 252, 0.4);
    padding: 0.95rem 1.8rem;
    font-weight: 700;
    cursor: pointer;
    border-radius: 12px;
    font-size: 0.9rem;
    text-transform: uppercase;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 1px;

    &:hover:not(:disabled) {
      background: rgba(165, 180, 252, 0.1);
      border-color: #a5b4fc;
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
