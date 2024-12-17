import React from 'react';
import styles from '../../pages/Home/home.module.css';
import MessageList from './MessageList/MessageList.js';

const RightPanel = ({ selectedChat, messages, newMessage, setNewMessage, handleSendMessage, handleMenuToggle }) => (
  <div className={styles.rightPanel}>
    <div className={styles.rightPanelHeader}>
      {selectedChat ? (
        <>
          <img src="/user.svg" alt="User" className={styles.rightUserPhoto} />
          <span className={styles.userName}>{selectedChat.name}</span>
          <span className={styles.ellipsis} onClick={handleMenuToggle}>···</span>
        </>
      ) : (
        <span className={styles.userName}>Select a chat</span>
      )}
    </div>
    <MessageList messages={messages} />
    {selectedChat && (
      <div className={styles.rightPanelMessageInput}>
        <input
          type="text"
          placeholder="Type a message..."
          className={styles.messageInput}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <img
          src="/paper-plane.svg"
          alt="Send"
          className={styles.paperPlane}
          onClick={handleSendMessage}
        />
      </div>
    )}
  </div>
);

export default RightPanel;
