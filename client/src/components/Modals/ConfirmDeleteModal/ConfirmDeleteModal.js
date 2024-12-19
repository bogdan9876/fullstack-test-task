import React from 'react';
import styles from '../modal.module.css';

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <p>Are you sure you want to delete this chat?</p>
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

export default ConfirmDeleteModal;
