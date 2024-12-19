import React from 'react';
import styles from '../modal.module.css';

function CreateChatModal({
  newChatFirstName, 
  setNewChatFirstName, 
  newChatLastName, 
  setNewChatLastName, 
  handleCreateChat, 
  setShowCreateChatModal 
}) {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Create New Chat</h2>
        <input
          type="text"
          placeholder="First Name"
          value={newChatFirstName}
          onChange={(e) => setNewChatFirstName(e.target.value)}
          className={styles.modalInput}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newChatLastName}
          onChange={(e) => setNewChatLastName(e.target.value)}
          className={styles.modalInput}
        />
        <div className={styles.modalButtons}>
          <button className={`${styles.modalButton} ${styles.modalConfirm}`} onClick={handleCreateChat}>Create</button>
          <button className={`${styles.modalButton} ${styles.modalCancel}`} onClick={() => setShowCreateChatModal(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default CreateChatModal;
