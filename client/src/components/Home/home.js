import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './home.module.css';

function Home() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editChatName, setEditChatName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!token) {
          console.error('No token found');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/chats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error.response ? error.response.data : error.message);
      }
    };

    fetchChats();
  }, [token]);

  const fetchMessages = async (chatId) => {
    try {
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`http://localhost:5000/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error.response ? error.response.data : error.message);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
    setShowMenu(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedChat) return;

    try {
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.post(`http://localhost:5000/api/chats/${selectedChat._id}/messages`, { text: newMessage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.reload();
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleEditChatName = () => {
    setEditChatName(selectedChat.name);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDeleteChat = () => {
    setShowConfirmModal(true);
    setShowMenu(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/chats/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(chats.filter(chat => chat._id !== selectedChat._id));
      setSelectedChat(null);
      setMessages([]);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error deleting chat:', error.response ? error.response.data : error.message);
    }
  };

  const handleConfirmEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/chats/${selectedChat._id}`, { name: editChatName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(chats.map(chat => chat._id === selectedChat._id ? response.data : chat));
      setSelectedChat(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating chat name:', error.response ? error.response.data : error.message);
    }
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
          <div className={styles.leftPanelChatsWord}>Chats</div>
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
                    {chat.name}
                  </div>
                  <div className={styles.userListInfoLastMessage}>
                    {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages yet'}
                  </div>
                </div>
                <div className={styles.userListLastMessageTime}>
                  {chat.messages.length > 0 ? new Date(chat.messages[chat.messages.length - 1].createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
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
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editChatName}
                    onChange={(e) => setEditChatName(e.target.value)}
                    className={styles.editChatInput}
                  />
                  <div className={styles.editMenu}>
                    <button className={styles.confirmButton} onClick={handleConfirmEdit}>Confirm</button>
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
        <div className={styles.rightPanelMain}>
          {selectedChat && messages.map((msg, index) => (
            <div key={index} className={styles.message}>
              <strong>{msg.sender.username}</strong>: {msg.text}
            </div>
          ))}
        </div>
        {selectedChat && (
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
        )}
        {showMenu && (
          <div className={styles.menu}>
            <div className={styles.menuItem} onClick={handleEditChatName}>Edit chat name</div>
            <div className={styles.menuItem} onClick={handleDeleteChat}>Delete chat</div>
          </div>
        )}
      </div>
      {showConfirmModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>Are you sure you want to delete this chat?</p>
            <button className={`${styles.modalButton} ${styles.modalConfirm}`} onClick={handleConfirmDelete}>Confirm</button>
            <button className={`${styles.modalButton} ${styles.modalCancel}`} onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
