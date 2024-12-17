import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './home.module.css';
import LeftPanel from '../../components/LeftPanel/LeftPanel.js';
import RightPanel from '../../components/RightPanel/RightPanel.js';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal/ConfirmDeleteModal.js';
import CreateChatModal from '../../components/Modals/CreateChatModal/CreateChatModal.js';
import LogoutConfirmModal from '../../components/Modals/LogoutConfirmModal/LogoutConfirmModal.js';
import { getChats, getMessages, sendMessage, deleteChat, createChat, fetchUserData } from '../../services/homeApi';

function Home() {
  const token = localStorage.getItem('accessToken');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [uiState, setUiState] = useState({
    newMessage: '',
    searchQuery: '',
    showMenu: false,
    showLogoutConfirm: false,
    showConfirmModal: false,
    showCreateChatModal: false,
    newChatFirstName: '',
    newChatLastName: '',
    editingMessage: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatsData = await getChats(token);
        const userData = await fetchUserData(token);
        setChats(chatsData);
        setUser(userData);
      } catch (error) {
        toast.error('Failed to load chats or user data.');
      }
    };
    fetchData();
  }, [token]);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    setUiState({ ...uiState, showMenu: false });
    try {
      const fetchedMessages = await getMessages(chat._id, token);
      setMessages(fetchedMessages);
    } catch (error) {
      toast.error('Failed to load messages.');
    }
  };

  const handleSendMessage = async () => {
    if (!uiState.newMessage || !selectedChat) return;
    try {
      const newMessage = await sendMessage(selectedChat._id, uiState.newMessage, token);
      setMessages([...messages, newMessage]);
      setUiState({ ...uiState, newMessage: '' });
    } catch (error) {
      toast.error('Failed to send message.');
    }
  };

  const handleDeleteChat = async () => {
    try {
      await deleteChat(selectedChat._id, token);
      setChats(chats.filter(chat => chat._id !== selectedChat._id));
      setSelectedChat(null);
      setMessages([]);
      setUiState({ ...uiState, showConfirmModal: false });
      toast.success('Chat deleted.');
    } catch (error) {
      toast.error('Failed to delete chat.');
    }
  };

  const handleCreateChat = async () => {
    const { newChatFirstName, newChatLastName } = uiState;
    if (!newChatFirstName || !newChatLastName) return;

    try {
      const newChat = await createChat(newChatFirstName, newChatLastName, token);
      setChats([...chats, newChat]);
      setUiState({
        ...uiState,
        newChatFirstName: '',
        newChatLastName: '',
        showCreateChatModal: false,
      });
      toast.success('Chat created.');
    } catch (error) {
      toast.error('Failed to create chat.');
    }
  };

  return (
    <div className={styles.homeContainer}>
      <LeftPanel
        user={user}
        chats={chats}
        searchQuery={uiState.searchQuery}
        setSearchQuery={(value) => setUiState({ ...uiState, searchQuery: value })}
        handleChatSelect={handleChatSelect}
        setShowCreateChatModal={() => setUiState({ ...uiState, showCreateChatModal: true })}
        handleLogout={() => setUiState({ ...uiState, showLogoutConfirm: true })}
      />
      <RightPanel
        selectedChat={selectedChat}
        messages={messages}
        handleMenuToggle={handleMenuToggle}
        newMessage={uiState.newMessage}
        setNewMessage={(value) => setUiState({ ...uiState, newMessage: value })}
        handleSendMessage={handleSendMessage}
      />
      {uiState.showConfirmModal && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteChat}
          onCancel={() => setUiState({ ...uiState, showConfirmModal: false })}
        />
      )}
      {uiState.showCreateChatModal && (
        <CreateChatModal
          newChatFirstName={uiState.newChatFirstName}
          setNewChatFirstName={(value) => setUiState({ ...uiState, newChatFirstName: value })}
          newChatLastName={uiState.newChatLastName}
          setNewChatLastName={(value) => setUiState({ ...uiState, newChatLastName: value })}
          handleCreateChat={handleCreateChat}
          setShowCreateChatModal={() => setUiState({ ...uiState, showCreateChatModal: false })}
        />
      )}

      {uiState.showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={() => {
            localStorage.removeItem('accessToken');
            window.location.reload();
          }}
          onCancel={() => setUiState({ ...uiState, showLogoutConfirm: false })}
        />
      )}
    </div>
  );
}

export default Home;
