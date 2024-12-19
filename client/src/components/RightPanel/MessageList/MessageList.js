import React, { useEffect, useRef } from 'react';
import styles from './MessageList.module.css';

const MessageList = ({ messages, onEdit, editingMessageId, onCancelEdit }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.rightPanelMain}>
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={msg.isQuote ? styles.quoteMessageContainer : styles.chatMessageContainer}
        >
          <div className={styles.messageWrapper}>
            {!msg.isQuote && (
              <div
                className={styles.messageMenu}
                title="Edit message"
                onClick={() =>
                  editingMessageId === msg._id ? onCancelEdit() : onEdit(msg)
                }
              >
                {editingMessageId === msg._id ? 'x' : '···'}
              </div>
            )}
            <div className={msg.isQuote ? styles.quoteMessage : styles.chatMessage}>
              {msg.text}
              <div className={styles.timestamp}>
                {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;