import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './home.module.css';

function Home() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`/api/chats/${chatId}/messages`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedChat) return;

    try {
      await axios.post(`/api/chats/${selectedChat._id}/messages`, { text: newMessage }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNewMessage('');
      fetchMessages(selectedChat._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className={styles.homeContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelHeaderSection}>
          <div className={styles.leftPanelHeader}>
            <img src="/user.svg" alt="User" className={styles.userPhoto} />
            <button className={styles.logoutButton} onClick={() => localStorage.removeItem('token')}>Log Out</button>
          </div>
          <input type="text" placeholder="Search or start new chat" className={styles.userInput} />
        </div>
        <div className={styles.leftPanelMain}>
          <div className={styles.leftPanelChatsWord}>
            Chats
          </div>
          <div className={styles.leftPanelChatsList}>
            {chats.map(chat => (
              <div
                key={chat._id}
                className={styles.userListItem}
                onClick={() => handleChatSelect(chat)}
              >
                <div className={styles.userListPhoto}>
                  <img src="/user.svg" alt="User" className={styles.photo} />
                </div>
                <div className={styles.userListInfo}>
                  <div className={styles.userListInfoName}>
                    {chat.participants.find(p => p._id !== 'your-user-id').username}
                  </div>
                  <div className={styles.userListInfoLastMessage}>
                    {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : ''}
                  </div>
                </div>
                <div className={styles.userListLastMessageTime}>
                  {chat.messages.length > 0 ? new Date(chat.messages[chat.messages.length - 1].timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.rightPanelHeader}>
          {selectedChat ? (
            <>
              <img src="/user.svg" alt="User" className={styles.rightUserPhoto} />
              <span className={styles.userName}>{selectedChat.participants.find(p => p._id !== 'your-user-id').username}</span>
            </>
          ) : (
            <span className={styles.userName}>Select a chat</span>
          )}
        </div>
        <div className={styles.rightPanelMain}>
          {selectedChat && messages.map((msg, index) => (
            <div key={index} className={styles.message}>
              <strong>{msg.sender.username}</strong>: {msg.text}
            </div>
          ))}
        </div>
        <div className={styles.rightPanelMessageInput}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Type a message..."
              className={styles.messageInput}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <img
              src="/paper-plane.svg"
              alt="Send"
              className={styles.paperPlane}
              onClick={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
