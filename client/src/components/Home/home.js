import React from 'react';
import './home.css';

function Home() {
  const handleLogout = () => {
    console.log('User logged out');
  };

  return (
    <div className="home-container">
      <div className="left-panel">
        <div className="left-panel-header-section">
          <div className="left-panel-header">
            <img src="/user.svg" alt="User" className="user-photo" />
            <button className="logout-button" onClick={handleLogout}>Log Out</button>
          </div>
          <input type="text" placeholder="Search or start new chat" className="user-input" />
        </div>
        <div className="left-panel-main">
          <div className="left-panel-chats-word">
            Chats
          </div>
          <div className="left-panel-chats-list">
          </div>
        </div>
      </div>
      <div className="right-panel">
        <div className="right-panel-header">
          <img src="/user.svg" alt="User" className="right-user-photo" />
          <span className="user-name">Alice Freeman</span>
        </div>
        <div className="right-panel-main">
        </div>
        <div className="right-panel-message-input">
          <img src="/paper-plane.svg" alt="plane" className="paper-plane" />
        </div>
      </div>
    </div>
  );
}

export default Home;
