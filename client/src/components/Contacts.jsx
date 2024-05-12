import React, { useState } from "react";
import styled from "styled-components";
import Logo from "../assets/Designer.png";

export default function Contacts({ contacts,changeChat,currentUser,onlineUsers }) {
    // console.log("contacts")
    const [currentSelected, setCurrentSelected] = useState(undefined);
    const [searchQuery, setSearchQuery] = useState("");

    const changeCurrentChat = (index, contact) => {
      setCurrentSelected(index);
      changeChat(contact);
    };

    const filteredContacts = contacts.filter((contact) =>
      contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <>
        {currentUser && (
          <Container>
            <div className="brand">

              <div>
              <img src={Logo} alt="logo" />
              <h3>WhispR</h3>
              </div>
              <div className="search-bar">
              <input
                type="text"
                placeholder="Search Contact"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              </div> 
            </div>

            <div className="contacts">
              {filteredContacts.map((contact, index) => {
                const isOnline = onlineUsers.includes(contact._id);
                return (
                  <div
                    key={contact._id}
                    className={`contact ${
                      index === currentSelected ? "selected" : ""
                    }`}
                    onClick={() => changeCurrentChat(index, contact)}
                  >
                    <div className="avatar">
                      <img
                        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                        alt=""
                      />
                      {isOnline && <div className="online-dot"></div>}
                    </div>
                    <div className="username">
                      <h3>{contact.username}</h3>
                    </div>
                    <h2 className="unreads">{contact.unreadCount}</h2>
                  </div>
                );
              })}
            </div>
            <div className="current-user">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentUser.avatarImage}`}
                  alt="avatar"
                />
              </div>
            <div className="username">
                <h2>{currentUser.username}</h2>
              </div>
            </div>  
          </Container>
        )}
      </>
    );
  }


  const Container = styled.div`
  border-radius:50px 0px 0px 50px;
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #8d9668 ;
  .brand {
    margin-top:15%;
    position:relative;
    display: flex;
    flex-direction:column;
    align-items: center;
    justify-content: center;
    div{
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      img {
        height: 2rem;
      }
      h3 {
        color: white;
        text-transform: uppercase;
      }
  }
    .search-bar {
      border-radius:50px;
      width: 80%;
      height:50px;
      padding: 0.5rem;
      background-color: #1b1b32;
      input {
        width: 100%;
        padding: 0.5rem;
        border: none;
        border-radius: 0.2rem;
        outline: none;
        background-color: #1b1b32;
        color: white;
      }
    }
  }
  .contacts {
    display: flex;
    position: relative;
    top:15%;
    height:90%;
    bottom:-20px;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #573132;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      justify-content: space-between;
      .avatar {
        img {
          height: 3rem;
        }
        .online-dot {
          width: 10px;
          height: 10px;
          background-color: green;
          border-radius: 50%;
          position:relative;
          top: 0;
          right: 0;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
      .unreads{
        color:green;
        font-weight: bold;
        margin-left: auto;
        margin-right:10%;
        
      }
    }
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    top:15%;
    position:relative;
    background-color: #701316;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }


`;