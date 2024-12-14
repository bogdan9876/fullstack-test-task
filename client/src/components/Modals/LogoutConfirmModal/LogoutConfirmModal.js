import React from 'react';
import styles from '../modal.module.css';

const LogoutConfirmModal = ({ onConfirm, onCancel }) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <p>Are you sure you want to log out?</p>
      <button
        className={`${styles.modalButton} ${styles.modalConfirm}`}
        onClick={onConfirm}
      >
        Confirm
      </button>
      <button
        className={`${styles.modalButton} ${styles.modalCancel}`}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  </div>
);

export default LogoutConfirmModal;
