import React from 'react';
import styles from './home.module.css';

function Home() {
  const handleLogout = () => {
    console.log('User logged out');
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelHeaderSection}>
          <div className={styles.leftPanelHeader}>
            <img src="/user.svg" alt="User" className={styles.userPhoto} />
            <button className={styles.logoutButton} onClick={handleLogout}>Log Out</button>
          </div>
          <input type="text" placeholder="Search or start new chat" className={styles.userInput} />
        </div>
        <div className={styles.leftPanelMain}>
          <div className={styles.leftPanelChatsWord}>
            Chats
          </div>
          <div className={styles.leftPanelChatsList}>
          </div>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.rightPanelHeader}>
          <img src="/user.svg" alt="User" className={styles.rightUserPhoto} />
          <span className={styles.userName}>Alice Freeman</span>
        </div>
        <div className={styles.rightPanelMain}>
        </div>
        <div className={styles.rightPanelMessageInput}>
          <div className={styles.inputContainer}>
            <input type="text" placeholder="Type a message..." className={styles.messageInput} />
            <img src="/paper-plane.svg" alt="Send" className={styles.paperPlane} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
