import React from 'react';
import './home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="left-panel">
        <div className="left-panel-header">
        </div>
        <div className="left-panel-main">
          <div className="left-panel-chats-word" >
            Chats
          </div>
          <div className="left-panel-chats-list">
          </div>
        </div>
      </div>
      <div className="right-panel">
        <div className="right-panel-header">
        </div>
        <div className="right-panel-main">
        </div>
        <div className="right-panel-message-input">
        </div>
      </div>
    </div>
  );
}

export default Home;