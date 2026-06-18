import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import axios from "axios";
import { logoutRoute } from "../utils/Api";

export default function Logout({ socket }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const id = await JSON.parse(
        sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)
      )._id;
      const data = await axios.get(`${logoutRoute}/${id}`);
      if (data.status === 200) {
        sessionStorage.clear();
        if (socket && socket.current) {
          socket.current.disconnect();
        }
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setShowConfirm(false);
  };

  return (
    <>
      <Button onClick={handleLogoutClick}>
        <BiPowerOff />
        <span className="logout-text">Logout</span>
      </Button>

      {showConfirm && (
        <ModalOverlay onClick={() => setShowConfirm(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of WhispR?</p>
            <div className="btn-group">
              <button className="confirm-btn" onClick={confirmLogout}>
                Logout
              </button>
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.6rem;
  border-radius: 8px;
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  max-width: 40px;
  
  svg {
    font-size: 1.3rem;
    color: #ef4444;
    transition: transform 0.3s ease;
  }

  .logout-text {
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ef4444;
    font-weight: 600;
    font-size: 0.9rem;
  }

  &:hover {
    max-width: 120px;
    padding: 0.6rem 1rem;
    background-color: #ef4444;
    border-color: #ef4444;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

    svg {
      color: white;
      transform: rotate(90deg);
    }

    .logout-text {
      max-width: 80px;
      opacity: 1;
      margin-left: 0.5rem;
      color: white;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: #111122;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: white;
  animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes scaleUp {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  h3 {
    margin: 0 0 0.8rem 0;
    font-size: 1.4rem;
    color: #ef4444;
  }

  p {
    margin: 0 0 1.5rem 0;
    color: #a0aec0;
    font-size: 1rem;
    line-height: 1.5;
  }

  .btn-group {
    display: flex;
    justify-content: center;
    gap: 1rem;

    button {
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      width: 100px;
    }

    .confirm-btn {
      background-color: #ef4444;
      color: white;
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
      &:hover {
        background-color: #dc2626;
        transform: translateY(-1px);
      }
    }

    .cancel-btn {
      background-color: rgba(255, 255, 255, 0.08);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover {
        background-color: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
      }
    }
  }
`;
