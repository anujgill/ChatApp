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
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
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
    theme: "light",
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
    const finalOtp = otpValues.join("");
    if (finalOtp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.", toastOptions);
      return;
    }
    try {
      const { data } = await axios.post(verifyOtpRoute, { username, otp: finalOtp });
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
    const finalOtp = otpValues.join("");
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
        otp: finalOtp,
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

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otpValues];
    newOtp[index] = element.value;
    setOtpValues(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && otpValues[index] === "" && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  return (
    <>
      <FormContainer>
        <div className="left-panel">
          <div className="left-content">
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h1>WhispR</h1>
            </div>
            <p className="left-tagline">Recover your account security configuration with a few simple steps.</p>
            <div className="left-decor">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fbeee9" d="M41.5,-71.7C53.7,-64.9,63.5,-53.4,70.7,-40C77.9,-26.7,82.4,-11.4,80.8,3.2C79.2,17.7,71.5,31.4,62,42.5C52.5,53.7,41.2,62.3,28.2,68.4C15.2,74.5,0.4,78.2,-14.8,76.5C-30,74.8,-45.5,67.8,-57.4,56.8C-69.3,45.8,-77.6,30.8,-81,14.6C-84.3,-1.6,-82.7,-18.9,-75.6,-33.5C-68.5,-48.1,-55.8,-60.1,-41.5,-66.1C-27.2,-72.1,-13.6,-72.2,0.8,-73.6C15.3,-75,30.6,-77.7,41.5,-71.7Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>
        </div>
        <div className="right-panel">
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="step-indicator">
                <div className="step-dot active"></div>
                <div className="step-line"></div>
                <div className="step-dot"></div>
                <div className="step-line"></div>
                <div className="step-dot"></div>
              </div>

              <h2>Reset Password</h2>
              <p className="instruction">
                Enter your username or email to receive a password recovery verification code.
              </p>
              
              <div className="input-group">
                <label htmlFor="username">Username or Email</label>
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <button type="submit">Send Code</button>
              <div className="back-link">
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="step-indicator">
                <div className="step-dot active"></div>
                <div className="step-line active"></div>
                <div className="step-dot active"></div>
                <div className="step-line"></div>
                <div className="step-dot"></div>
              </div>

              <h2>Enter Code</h2>
              <p className="instruction">
                We sent a 6-digit OTP code to your registered email: <br />
                <strong>{maskedEmail}</strong>
              </p>
              
              <div className="otp-container">
                {otpValues.map((data, index) => (
                  <input
                    className="otp-field"
                    type="text"
                    name="otp"
                    maxLength="1"
                    key={index}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>

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
              <div className="step-indicator">
                <div className="step-dot active"></div>
                <div className="step-line active"></div>
                <div className="step-dot active"></div>
                <div className="step-line active"></div>
                <div className="step-dot active"></div>
              </div>

              <h2>New Password</h2>
              <p className="instruction">Set a new secure password for your account.</p>
              
              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </div>
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
        </div>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  background-color: var(--bg-primary);
  overflow: hidden;
  box-sizing: border-box;

  .left-panel {
    flex: 1.1;
    background-color: var(--bg-secondary);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    position: relative;
    overflow: hidden;
    border-right: 1px solid var(--bg-tertiary);
    
    @media (max-width: 768px) {
      display: none;
    }
  }

  .left-content {
    max-width: 440px;
    z-index: 2;
    text-align: left;
  }

  .left-decor {
    position: absolute;
    width: 420px;
    height: 420px;
    top: -10%;
    right: -10%;
    z-index: 1;
    opacity: 0.6;
    animation: float-rev 15s ease-in-out infinite;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  @keyframes float-rev {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(15px) rotate(-8deg); }
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 2rem;

    img {
      height: 3.5rem;
      border-radius: 30%;
      box-shadow: var(--shadow-md);
    }

    h1 {
      color: var(--color-teal);
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 0;
    }
  }

  .left-tagline {
    font-size: 1.25rem;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
    font-family: var(--font-heading);
    font-weight: 400;
  }

  .right-panel {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background-color: var(--bg-primary);
    overflow-y: auto;
  }

  form {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    h2 {
      color: var(--text-primary);
      margin: 0 0 0.4rem 0;
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    p.instruction {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0 0 2rem 0;
      line-height: 1.5;

      strong {
        color: var(--color-teal);
      }
    }
  }

  .step-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    align-self: flex-start;

    .step-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--bg-tertiary);
      transition: all 0.3s ease;

      &.active {
        background-color: var(--color-teal);
        box-shadow: 0 0 0 3px var(--color-teal-light);
      }
    }

    .step-line {
      width: 20px;
      height: 2px;
      background-color: var(--bg-tertiary);
      transition: all 0.3s ease;

      &.active {
        background-color: var(--color-teal);
      }
    }
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.2rem;
    width: 100%;

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: 0.3px;
    }
  }

  input {
    background-color: var(--bg-secondary);
    padding: 0.9rem 1.1rem;
    border: 1px solid transparent;
    border-radius: 50px;
    color: var(--text-primary);
    width: 100%;
    font-size: 0.95rem;
    transition: all 0.25s ease;
    font-family: inherit;
    box-sizing: border-box;

    &::placeholder {
      color: var(--text-light);
      opacity: 0.7;
    }

    &:focus {
      border-color: var(--color-teal);
      background-color: var(--bg-primary);
      outline: none;
      box-shadow: 0 0 0 4px var(--color-teal-light);
    }
  }

  .password-input-wrapper {
    position: relative;
    width: 100%;

    input {
      padding-right: 3rem;
    }

    .toggle-password {
      position: absolute;
      right: 1.2rem;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--text-light);
      font-size: 1.25rem;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--color-teal);
      }
    }
  }

  .otp-container {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 2rem;
    width: 100%;

    .otp-field {
      width: 48px;
      height: 48px;
      padding: 0;
      text-align: center;
      font-size: 1.25rem;
      font-weight: 600;
      border-radius: 12px;
      background-color: var(--bg-secondary);
      border: 1px solid transparent;

      &:focus {
        border-color: var(--color-teal);
        box-shadow: 0 0 0 4px var(--color-teal-light);
      }
    }
  }

  button[type="submit"] {
    background: var(--color-teal);
    color: white;
    padding: 0.95rem 2rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    border-radius: 50px;
    font-size: 0.95rem;
    transition: all 0.25s ease;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-md);
    font-family: var(--font-heading);
    width: 100%;

    &:hover {
      background: #235346;
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .back-link {
    text-align: center;
    margin-top: 0.5rem;
    
    a {
      color: var(--color-terracotta);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--text-primary);
        text-decoration: underline;
      }
    }

    .text-btn {
      background: none;
      border: none;
      color: var(--color-terracotta);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--text-primary);
        text-decoration: underline;
      }
    }
  }
`;
