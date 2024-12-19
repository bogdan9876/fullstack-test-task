import React from 'react';
import styles from '../../pages/Home/home.module.css';
import ChatsList from './ChatList/ChatList.js';

const LeftPanel = ({ user, chats, searchQuery, setSearchQuery, handleChatSelect, setShowCreateChatModal, handleLogout }) => (
  <div className={styles.leftPanel}>
    <div className={styles.leftPanelHeaderSection}>
      <div className={styles.leftPanelHeader}>
        <div className={styles.leftPanelUserData}>
          <img src={user?.picture ? `data:image/jpeg;base64,${user.picture}` : '/user.svg'} alt="User" className={styles.userPhoto} />
          <div className={styles.leftPanelUsername}>{user?.username}</div>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>Log Out</button>
      </div>
      <input
        type="text"
        placeholder="Search or start new chat"
        className={styles.userInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <div className={styles.leftPanelMain}>
      <div className={styles.leftPanelChatsWord}>Chats</div>
      <ChatsList
        filteredChats={chats.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))}
        handleChatSelect={handleChatSelect}
        setShowCreateChatModal={setShowCreateChatModal}
      />
    </div>
  </div>
);

export default LeftPanel;
