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
      navigate("/");
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
    theme: "dark",
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
          navigate("/");
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
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>WhispR</h1>
          </div>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to resume secure messaging</p>
          <input
            type="text"
            placeholder="Username or Email"
            name="username"
            value={values.username}
            onChange={(e) => handleChange(e)}
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              value={values.password}
              onChange={(e) => handleChange(e)}
            />
            <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
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

    p.subtitle {
      color: #94a3b8;
      text-align: center;
      font-size: 0.9rem;
      margin: 0 0 1.8rem 0;
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

  .password-input-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 1rem;

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

  .forgot-password {
    text-align: right;
    margin-bottom: 1.8rem;
    width: 100%;
    a {
      color: #818cf8;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: color 0.2s ease;
      &:hover {
        color: #a5b4fc;
        text-decoration: underline;
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

  span {
    color: #64748b;
    font-size: 0.85rem;
    text-align: center;
    letter-spacing: 0.3px;

    a {
      color: #818cf8;
      text-decoration: none;
      font-weight: 700;
      transition: color 0.2s ease;

      &:hover {
        color: #a5b4fc;
        text-decoration: underline;
      }
    }
  }
`;
