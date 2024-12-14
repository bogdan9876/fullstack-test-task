import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './home.module.css';
import {
  getChats, getMessages, sendMessage, deleteChat, updateChatName, createChat, quoteMessage } from '../../services/homeApi.js';

const token = localStorage.getItem('accessToken');

function Home() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editChatName, setEditChatName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [newChatFirstName, setNewChatFirstName] = useState('');
  const [newChatLastName, setNewChatLastName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchChatsData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const chatsData = await getChats(token);
        setChats(chatsData);
      } catch (error) {
        console.error('Error fetching chats:', error.response ? error.response.data : error.message);
      }
    };
    fetchChatsData();
  }, []);

  const fetchMessagesData = async (chatId) => {
    try {
      const messagesData = await getMessages(chatId, token);
      const uniqueMessages = messagesData.filter((message, index, self) =>
        index === self.findIndex((m) => (
          m.text === message.text && new Date(m.createdAt).toString() === new Date(message.createdAt).toString()
        ))
      );
      setMessages(uniqueMessages);
    } catch (error) {
      console.error('Error fetching messages:', error.response ? error.response.data : error.message);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessagesData(chat._id);
    setShowMenu(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedChat) return;

    try {
      const sentMessage = await sendMessage(selectedChat._id, newMessage, token);
      setMessages(prevMessages => [...prevMessages, sentMessage]);

      setChats(chats.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, messages: [...chat.messages, sentMessage] }
          : chat
      ));

      if (sentMessage.isQuote) {
        toast.info(`You have a new message: ${sentMessage.text}`);
      }
      setNewMessage('');

      setTimeout(async () => {
        try {
          const quoteMessageData = await quoteMessage(selectedChat._id, token);
          setMessages(prevMessages => [...prevMessages, quoteMessageData]);

          setChats(chats.map(chat =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, quoteMessageData] }
              : chat
          ));

          if (quoteMessageData.isQuote) {
            toast.info(`New quoted message: ${quoteMessageData.text}`);
          }
        } catch (quoteError) {
          console.error('Error fetching quote:', quoteError.response ? quoteError.response.data : quoteError.message);
        }
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
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
      await deleteChat(selectedChat._id, token);
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
      const updatedChat = await updateChatName(selectedChat._id, editChatName, token);
      setChats(chats.map(chat => chat._id === selectedChat._id ? updatedChat : chat));
      setSelectedChat(updatedChat);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating chat name:', error.response ? error.response.data : error.message);
    }
  };

  const handleCreateChat = async () => {
    try {
      if (!newChatFirstName || !newChatLastName) {
        console.error('Both first name and last name are required');
        return;
      }

      const newChat = await createChat(newChatFirstName, newChatLastName, token);
      setChats([...chats, newChat]);
      setShowCreateChatModal(false);
      setNewChatFirstName('');
      setNewChatLastName('');
    } catch (error) {
      console.error('Error creating chat:', error.response ? error.response.data : error.message);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelHeaderSection}>
          <div className={styles.leftPanelHeader}>
            <img src="/user.svg" alt="User" className={styles.userPhoto} />
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
              ))
            ) : (
              <div className={styles.createChatPrompt}>
                <div className={styles.createChatPromptQ}>No chats found. </div>
                <button onClick={() => setShowCreateChatModal(true)}>Create Chat</button>
              </div>
            )}
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
            <div
              key={index}
              className={msg.isQuote ? styles.quoteMessageContainer : styles.chatMessageContainer}
            >
              <div className={msg.isQuote ? styles.quoteMessage : styles.chatMessage}>
                {msg.text}
                <div className={styles.timestamp}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
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
      {showCreateChatModal && (
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
      )}
      {showLogoutConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>Are you sure you want to log out?</p>
            <button className={`${styles.modalButton} ${styles.modalConfirm}`} onClick={handleConfirmLogout}>Confirm</button>
            <button className={`${styles.modalButton} ${styles.modalCancel}`} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
