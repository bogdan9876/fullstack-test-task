import React from 'react';
import styles from '../../pages/Home/home.module.css';
import MessageList from './MessageList/MessageList.js';

const RightPanel = ({
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleConfirmEdit,
  isEditing,
  setIsEditing,
  editChatName,
  setEditChatName,
  handleMenuToggle,
  editingMessage,
  cancelEditingMessage,
  setEditingMessage,
  setEditedMessageText,
  handleEditMessage,
  editedMessageText
}) => (
  <div className={styles.rightPanel}>
    <div className={styles.rightPanelHeader}>
      {selectedChat ? (
        <>
          <img src="/user.svg" alt="User" className={styles.rightUserPhoto} />
          {isEditing ? (
            <>
              <input
                type="text"
                value={editChatName}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmEdit()}
                onChange={(e) => setEditChatName(e.target.value)}
                className={styles.editChatInput}
              />
              <div className={styles.editMenu}>
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirmEdit}
                >
                    Confirm
                </button>
                <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <span className={styles.userName}>{selectedChat.name}</span>
          )}
          <span className={styles.ellipsis} onClick={handleMenuToggle}>···</span>
        </>
      ) : (
        <span className={styles.userName}>Select a chat</span>
      )}
    </div>
    <MessageList
          messages={messages}
          onEdit={(msg) => {
            setEditingMessage(msg);
            setEditedMessageText(msg.text);
          }}
          onCancelEdit={cancelEditingMessage}
          setEditedMessageText={setEditedMessageText}
          editingMessageId={editingMessage ? editingMessage._id : null}
        />
            {selectedChat && (
          <div className={styles.rightPanelMessageInput}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                className={styles.messageInput}
                value={editingMessage ? editedMessageText : newMessage}
                onChange={(e) => {
                  if (editingMessage) {
                    setEditedMessageText(e.target.value);
                  } else {
                    setNewMessage(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    editingMessage ? handleEditMessage() : handleSendMessage();
                  }
                }}
              />
              <img
                src="/paper-plane.svg"
                alt="Send"
                className={styles.paperPlane}
                onClick={editingMessage ? handleEditMessage : handleSendMessage}
              />
            </div>
          </div>
        )}
  </div>
);

export default RightPanel;
