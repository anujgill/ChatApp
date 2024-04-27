import React,{useState,useEffect} from 'react'
import styled from 'styled-components'
import Logo from '../assets/Designer.png'
import {Link,useNavigate} from 'react-router-dom'
import {ToastContainer,toast} from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import {loginRoute} from '../utils/Api'
import axios from 'axios'

export default function Login() {
    // console.log(process.env)
    // console.log("login")
    const navigate = useNavigate();
    useEffect(() => {
        if (sessionStorage.getItem(process.env.REACT_APP_CURRENT_USER)) {
          navigate("/");
        }
      }, []);

    
    const [values,setValues] = useState({
        username:"",
        password:"",
    });
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

    const handleSubmit = async(event)=>{
        event.preventDefault();
        if (validateForm()) {
            const {username, password } = values;
            const { data } = await axios.post(loginRoute, {
              username,
              password,
            });
            if (data.status === false) {
                toast.error(data.msg, toastOptions);
              }
            if (data.status === true) {
                sessionStorage.setItem(
                  process.env.REACT_APP_CURRENT_USER,
                  JSON.stringify(data.user)
                );
                navigate("/");
            }
    }

}

    function handleChange(event){
        setValues({...values,[event.target.name]:event.target.value});
    }

  return (
    <>
        <FormContainer>
        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>WhispR</h1>
          </div>
          <input
            type="text"
            placeholder="Username or Email"
            name="username"
            onChange={(e) => handleChange(e)}
          />

          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
          <button type="submit">Log In</button>
          <br/>
          <span>
            Don't have an account ? <Link to="/register">Register</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer/>
    </>
  )
}
  var FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f2f2f2;
  padding: 2rem;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;

    img {
      height: 5rem;
    }

    h1 {
      color: #333;
      font-size: 2rem;
      font-weight: bold;
    }
  }

  form {
    width: 100%;
    max-width: 400px;
    background-color: #fff;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  input {
    background-color: #f9f9f9;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 0.4rem;
    color: #333;
    width: calc(100% - 2rem); /* Adjust width to account for padding */
    font-size: 1rem;
    margin-bottom: 1rem;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #4e0eff;
      outline: none;
    }
  }

  button {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: background-color 0.3s ease;
    margin-bottom: 1rem;

    &:hover {
      background-color: #3a08b5;
    }
  }

  span {
    color: #666;
    text-transform: uppercase;
    font-size: 0.8rem;

    a {
      color: #4e0eff;
      text-decoration: none;
      font-weight: bold;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;



