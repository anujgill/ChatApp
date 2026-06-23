import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/Designer.png";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/Api";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const [values, setValues] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "") {
      toast.error("Email or Username is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const { username, password } = values;
      try {
        const { data } = await axios.post(loginRoute, {
          username,
          password,
        });
        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        } else {
          sessionStorage.setItem(
            process.env.REACT_APP_CURRENT_USER,
            JSON.stringify(data.user)
          );
          // If the user registered but dropped before selecting an avatar,
          // send them back to avatar selection to complete their profile.
          if (!data.user.isAvatarImageSet) {
            navigate("/setAvatar", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        toast.error("Login failed. Please try again.", toastOptions);
      }
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
            <p className="left-tagline">Secure, organic, and elegant messaging designed for the modern age.</p>
            <div className="left-decor">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#e6eee9" d="M44.7,-74C58.1,-67.7,69.5,-56,76,-41.9C82.4,-27.7,83.9,-11.1,82.4,5C81,21.1,76.6,36.7,68,49.2C59.4,61.7,46.6,71.2,32.3,76.6C18,82.1,2.1,83.5,-13.7,80.7C-29.4,77.9,-45.1,70.9,-57.4,60.1C-69.6,49.2,-78.4,34.4,-82.9,18.4C-87.4,2.3,-87.6,-15.1,-81.9,-30.4C-76.3,-45.7,-64.8,-58.9,-51.2,-65C-37.6,-71.1,-21.8,-70.1,-5.5,-61.4C10.7,-52.7,44.7,-74,44.7,-74Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <form action="" onSubmit={(event) => handleSubmit(event)}>
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to resume secure messaging</p>
            
            <div className="input-group">
              <label htmlFor="username">Username or Email</label>
              <input
                id="username"
                type="text"
                placeholder="e.g. johndoe"
                name="username"
                value={values.username}
                onChange={(e) => handleChange(e)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name="password"
                  value={values.password}
                  onChange={(e) => handleChange(e)}
                />
                <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </div>
              </div>
            </div>
            
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <button type="submit">Log In</button>
            <span>
              Don't have an account? <Link to="/register">Register</Link>
            </span>
          </form>
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
    width: 380px;
    height: 380px;
    bottom: -10%;
    left: -10%;
    z-index: 1;
    opacity: 0.6;
    animation: float 12s ease-in-out infinite;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
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
      margin: 0 0 2rem 0;
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

  .forgot-password {
    text-align: right;
    margin-bottom: 2rem;
    width: 100%;
    a {
      color: var(--color-terracotta);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: color 0.2s ease;
      &:hover {
        color: var(--text-primary);
        text-decoration: underline;
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
`;
