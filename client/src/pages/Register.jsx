import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/Designer.png";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute, verifyRegisterRoute } from "../utils/Api";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)) {
      navigate("/");
    }
  }, [navigate]);

  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;

    if (password !== confirmPassword) {
      toast.error("Password and confirm password should be same.", toastOptions);
      return false;
    } else if (username.length < 3 || username.length > 20) {
      toast.error("Username should be between 3 and 20 characters.", toastOptions);
      return false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username can only contain alphanumeric characters and underscores.", toastOptions);
      return false;
    } else if (password.length < 8) {
      toast.error("Password should be equal or greater than 8 characters.", toastOptions);
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmitStep1 = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { email, username, password } = values;
      try {
        toast.info("Sending verification code...", { ...toastOptions, autoClose: 2000 });
        const { data } = await axios.post(registerRoute, {
          username,
          email,
          password,
        });
        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        } else {
          toast.success(data.msg, toastOptions);
          setStep(2);
        }
      } catch (error) {
        toast.error("Registration failed. Please try again.", toastOptions);
      }
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    const finalOtp = otpValues.join("");
    if (finalOtp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.", toastOptions);
      return;
    }
    try {
      const { data } = await axios.post(verifyRegisterRoute, {
        username: values.username,
        otp: finalOtp,
      });
      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      } else {
        toast.success("Email verified successfully! Profile created.", toastOptions);
        sessionStorage.setItem(
          process.env.REACT_APP_CURRENT_USER,
          JSON.stringify(data.user)
        );
        navigate(`/setAvatar`);
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.", toastOptions);
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

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  return (
    <>
      <FormContainer>
        <div className="left-panel">
          <div className="left-content">
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h1>WhispR</h1>
            </div>
            <p className="left-tagline">Join a beautiful, private space for conversations that feel natural.</p>
            <div className="left-decor">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#e6eee9" d="M37.8,-63.9C49.9,-56.9,61.4,-47.9,68.9,-36.1C76.4,-24.3,79.8,-9.6,78.2,4.5C76.6,18.6,70,32.2,61.1,43.7C52.3,55.3,41.2,64.9,28.2,70.5C15.2,76,-0.3,77.5,-16,74.5C-31.7,71.5,-47.5,64.1,-58.8,52.6C-70.1,41.2,-76.9,25.8,-79.8,9.5C-82.6,-6.9,-81.4,-24.2,-73.8,-37.9C-66.2,-51.6,-52.1,-61.8,-37.9,-67.6C-23.7,-73.4,-9.4,-74.8,2.7,-79.4C14.7,-84.1,25.6,-70.9,37.8,-63.9Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>
        </div>
        <div className="right-panel">
          {step === 1 && (
            <form onSubmit={(event) => handleSubmitStep1(event)}>
              <div className="step-indicator">
                <div className="step-dot active"></div>
                <div className="step-line"></div>
                <div className="step-dot"></div>
              </div>

              <h2>Create Account</h2>
              <p className="subtitle">Sign up to start messaging securely</p>
              
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. johndoe"
                  name="username"
                  maxLength="20"
                  value={values.username}
                  onChange={(e) => handleChange(e)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  name="email"
                  value={values.email}
                  onChange={(e) => handleChange(e)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    name="password"
                    value={values.password}
                    onChange={(e) => handleChange(e)}
                  />
                  <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={(e) => handleChange(e)}
                  />
                  <div className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </div>
                </div>
              </div>

              <button type="submit">Send Code</button>
              <span>
                Already have an account? <Link to="/login">Login</Link>
              </span>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={(event) => handleVerifyOTP(event)}>
              <div className="step-indicator">
                <div className="step-dot active"></div>
                <div className="step-line active"></div>
                <div className="step-dot active"></div>
              </div>

              <h2>Verify Email</h2>
              <p className="instruction">
                We sent a 6-digit OTP code to: <br />
                <strong>{values.email}</strong>
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

              <button type="submit">Verify & Register</button>
              <div className="back-link">
                <button className="text-btn" type="button" onClick={() => setStep(1)}>
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

    p.subtitle {
      color: var(--text-light);
      font-size: 0.95rem;
      margin: 0 0 1.5rem 0;
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
      width: 30px;
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

  span {
    color: var(--text-light);
    font-size: 0.85rem;
    text-align: center;

    a {
      color: var(--color-teal);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;

      &:hover {
        color: #235346;
        text-decoration: underline;
      }
    }
  }

  .back-link {
    text-align: center;
    margin-top: 0.5rem;
    
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
