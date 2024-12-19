import React from 'react';
import styles from './ChatsList.module.css';

const ChatsList = ({ filteredChats, handleChatSelect, setShowCreateChatModal }) => {
  return (
    <div className={styles.leftPanelChatsList}>
      {filteredChats.length > 0 ? (
        filteredChats.map(chat => (
          <div
            key={chat._id}
            className={styles.userListItem}
            onClick={() => handleChatSelect(chat)}
          >
            <div className={styles.userListPhoto}>
              <img src="/user.svg" alt="User" className={styles.photo} />
            </div>
            <div className={styles.userListInfo}>
              <div className={styles.userListInfoName}>{chat.name}</div>
              <div className={styles.userListInfoLastMessage}>
                {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages yet'}
              </div>
            </div>
            <div className={styles.userListLastMessageTime}>
              {chat.messages.length > 0 ? new Date(chat.messages[chat.messages.length - 1].createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.createChatPrompt}>
          <div className={styles.createChatPromptQ}>No chats found. </div>
          <button onClick={() => setShowCreateChatModal(true)}>Create Chat</button>
        </div>
      )}
    </div>
  );
};

export default ChatsList;