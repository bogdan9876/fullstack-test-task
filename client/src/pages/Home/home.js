import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './home.module.css';
import { getChats, getMessages, sendMessage, deleteChat, updateChatName, createChat, quoteMessage } from '../../services/homeApi.js';
import LogoutConfirmModal from '../../components/Modals/LogoutConfirmModal/LogoutConfirmModal.js';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal/ConfirmDeleteModal.js';
import CreateChatModal from '../../components/Modals/CreateChatModal/CreateChatModal.js';
import ChatsList from '../../components/ChatList/ChatList.js';
import MessageList from '../../components/MessageList/MessageList.js';

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
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchChatsData = async () => {
      try {
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
          <ChatsList
            filteredChats={filteredChats}
            handleChatSelect={handleChatSelect}
            setShowCreateChatModal={setShowCreateChatModal}
          />
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
        <MessageList messages={messages} />
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
        <ConfirmDeleteModal 
          onConfirm={handleConfirmDelete} 
          onCancel={() => setShowConfirmModal(false)} 
        />
      )}
      {showCreateChatModal && (
        <CreateChatModal 
          newChatFirstName={newChatFirstName} 
          setNewChatFirstName={setNewChatFirstName} 
          newChatLastName={newChatLastName} 
          setNewChatLastName={setNewChatLastName} 
          handleCreateChat={handleCreateChat} 
          setShowCreateChatModal={setShowCreateChatModal} 
        />
      )}
      {showLogoutConfirm && (
        <LogoutConfirmModal 
          onConfirm={handleConfirmLogout} 
          onCancel={() => setShowLogoutConfirm(false)} 
        />
      )}
    </div>
  );
}

export default Home;
