import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/Designer.png";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendOtpRoute, verifyOtpRoute, resetPasswordOtpRoute } from "../utils/Api";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (username === "") {
      toast.error("Username or Email is required.", toastOptions);
      return;
    }
    try {
      toast.info("Sending OTP... Please wait.", { ...toastOptions, autoClose: 2000 });
      const { data } = await axios.post(sendOtpRoute, { username });
      if (data.status === true) {
        setMaskedEmail(data.email);
        toast.success(data.msg, toastOptions);
        setStep(2);
      } else {
        toast.error(data.msg, toastOptions);
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please check your credentials.", toastOptions);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.", toastOptions);
      return;
    }
    try {
      const { data } = await axios.post(verifyOtpRoute, { username, otp });
      if (data.status === true) {
        toast.success(data.msg, toastOptions);
        setStep(3);
      } else {
        toast.error(data.msg, toastOptions);
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.", toastOptions);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password should be equal or greater than 8 characters.", toastOptions);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.", toastOptions);
      return;
    }

    try {
      const { data } = await axios.post(resetPasswordOtpRoute, {
        username,
        otp,
        newPassword,
      });

      if (data.status === true) {
        toast.success("Password reset successful! Redirecting to login...", toastOptions);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.msg, toastOptions);
      }
    } catch (error) {
      toast.error("Failed to reset password. Please try again.", toastOptions);
    }
  };

  return (
    <>
      <FormContainer>
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h1>WhispR</h1>
            </div>
            <h2>Reset Password</h2>
            <p className="instruction">
              Enter your username or email to receive a password recovery verification code.
            </p>
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Send Code</button>
            <div className="back-link">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h1>WhispR</h1>
            </div>
            <h2>Enter Code</h2>
            <p className="instruction">
              We have sent a 6-digit OTP code to your registered email: <br />
              <strong>{maskedEmail}</strong>.
            </p>
            <input
              type="text"
              placeholder="6-Digit OTP"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="otp-input"
            />
            <button type="submit">Verify Code</button>
            <div className="back-link">
              <button className="text-btn" type="button" onClick={() => setStep(1)}>
                Back
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h1>WhispR</h1>
            </div>
            <h2>New Password</h2>
            <p className="instruction">Set a new secure password for your account.</p>
            
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>

            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>

            <button type="submit">Reset Password</button>
            <div className="back-link">
              <button className="text-btn" type="button" onClick={() => setStep(2)}>
                Back
              </button>
            </div>
          </form>
        )}
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #07070c;
  background-image: radial-gradient(circle at 50% -20%, #171635 0%, #07070c 75%);
  padding: 2rem;
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

  .brand {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
    justify-content: center;

    img {
      height: 3.5rem;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    h1 {
      color: white;
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin: 0;
    }
  }

  form {
    width: 100%;
    max-width: 400px;
    background-color: rgba(12, 12, 22, 0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 2.5rem 2.2rem;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    z-index: 1;

    h2 {
      color: white;
      text-align: center;
      margin: 0 0 0.4rem 0;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.instruction {
      color: #94a3b8;
      text-align: center;
      font-size: 0.9rem;
      margin: 0 0 1.6rem 0;
      line-height: 1.5;

      strong {
        color: #e2e8f0;
      }
    }
  }

  input {
    background-color: rgba(255, 255, 255, 0.03);
    padding: 0.9rem 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    color: white;
    width: calc(100% - 2.2rem);
    font-size: 0.95rem;
    margin-bottom: 1.2rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;

    &::placeholder {
      color: #64748b;
    }

    &:focus {
      border-color: #6366f1;
      background-color: rgba(255, 255, 255, 0.05);
      outline: none;
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
    }
  }

  .otp-input {
    text-align: center;
    font-size: 1.5rem;
    letter-spacing: 0.4rem;
    font-weight: bold;
    color: #a5b4fc;
    width: calc(100% - 2.2rem);
  }

  .password-input-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 1.2rem;

    input {
      margin-bottom: 0;
      width: calc(100% - 3.2rem);
      padding-right: 2.1rem;
    }

    .toggle-password {
      position: absolute;
      right: 1.1rem;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #64748b;
      font-size: 1.25rem;
      transition: color 0.2s ease;
      
      &:hover {
        color: #818cf8;
      }
    }
  }

  button[type="submit"] {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    padding: 0.95rem 2rem;
    border: none;
    font-weight: 700;
    cursor: pointer;
    border-radius: 12px;
    font-size: 0.95rem;
    text-transform: uppercase;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 1.2rem;
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

  .back-link {
    text-align: center;
    margin-top: 0.5rem;
    
    a {
      color: #818cf8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: bold;
      transition: color 0.2s ease;
      
      &:hover {
        color: #a5b4fc;
        text-decoration: underline;
      }
    }

    .text-btn {
      background: none;
      border: none;
      color: #818cf8;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: bold;
      padding: 0;
      transition: color 0.2s ease;
      
      &:hover {
        color: #a5b4fc;
        text-decoration: underline;
      }
    }
  }
`;
