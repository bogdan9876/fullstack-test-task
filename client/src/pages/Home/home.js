import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './home.module.css';
import LeftPanel from '../../components/LeftPanel/LeftPanel.js';
import RightPanel from '../../components/RightPanel/RightPanel.js';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal/ConfirmDeleteModal.js';
import CreateChatModal from '../../components/Modals/CreateChatModal/CreateChatModal.js';
import LogoutConfirmModal from '../../components/Modals/LogoutConfirmModal/LogoutConfirmModal.js';
import { getChats, getMessages, sendMessage, deleteChat, createChat, fetchUserData, updateChatName, quoteMessage, updateMessage } from '../../services/homeApi';

function Home() {
  const token = localStorage.getItem('accessToken');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editChatName, setEditChatName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedMessageText, setEditedMessageText] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uiState, setUiState] = useState({
    searchQuery: '',
    showMenu: false,
    showLogoutConfirm: false,
    showConfirmModal: false,
    showCreateChatModal: false,
    newChatFirstName: '',
    newChatLastName: ''
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

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    setUiState({ ...uiState, showMenu: false });
    try {
      const fetchedMessages = await getMessages(chat._id, token);
      setMessages(fetchedMessages);
    } catch (error) {
      toast.error('Failed to load messages.');
    }
    setShowMenu(false);
    cancelEditingMessage();
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

  const handleDeleteChat = () => {
    setShowConfirmModal(true);
    setShowMenu(false);
  };

  const handleConfirmDelete = async () => {
    await deleteChat(selectedChat._id, token);
    setChats(chats.filter(chat => chat._id !== selectedChat._id));
    setSelectedChat(null);
    setMessages([]);
    setShowConfirmModal(false);
  };

  const handleCreateChat = async () => {
    const { newChatFirstName, newChatLastName } = uiState;
    if (!newChatFirstName || !newChatLastName) return;

    const newChat = await createChat(newChatFirstName, newChatLastName, token);
    setChats([...chats, newChat]);
    setUiState({
      ...uiState,
      newChatFirstName: '',
      searchQuery: '',
      newChatLastName: '',
      showCreateChatModal: false,
    });
  };

  const cancelEditingMessage = () => {
    setEditingMessage(null);
    setEditedMessageText('');
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

  const handleEditChatName = () => {
    setEditChatName(selectedChat.name);
    setIsEditing(true);
    setShowMenu(false);
    setIsSearching(false)
    setSearchQuery('');
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editedMessageText) return;

    try {
      const updatedMessage = await updateMessage(selectedChat._id, editingMessage._id, editedMessageText, token);

      console.log('Updated message:', updatedMessage);

      setMessages(prevMessages => {
        return prevMessages.map(msg =>
          msg._id === updatedMessage.updatedMessage._id
            ? { ...msg, ...updatedMessage.updatedMessage }
            : msg
        );
      });

      setChats(chats.map(chat =>
        chat._id === selectedChat._id
          ? {
            ...chat, messages: chat.messages.map(msg =>
              msg._id === updatedMessage.updatedMessage._id ? updatedMessage.updatedMessage : msg
            )
          }
          : chat
      ));

      setEditingMessage(null);
      setEditedMessageText('');
    } catch (error) {
      console.error('Error updating message:', error.response ? error.response.data : error.message);
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
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleConfirmEdit={handleConfirmEdit}
        editChatName={editChatName}
        editingMessage={editingMessage}
        setIsSearching={setIsSearching}
        isSearching={isSearching}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cancelEditingMessage={cancelEditingMessage}
        handleMenuToggle={handleMenuToggle}
        handleEditMessage={handleEditMessage}
        setEditChatName={setEditChatName}
        setEditedMessageText={setEditedMessageText}
        editedMessageText={editedMessageText}
        setEditingMessage={setEditingMessage}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
      {uiState.showConfirmModal && (
        <ConfirmDeleteModal
          onConfirm={handleConfirmDelete}
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
      {showMenu && (
        <div className={styles.menu}>
          <div className={styles.menuItem} onClick={handleEditChatName}>Edit chat name</div>
          <div className={styles.menuItem} onClick={handleDeleteChat}>Delete chat</div>
        </div>
      )}
      {showConfirmModal && (
        <ConfirmDeleteModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      {uiState.showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.reload();
          }}
          onCancel={() => setUiState({ ...uiState, showLogoutConfirm: false })}
        />
      )}
    </div>
  );
}

export default Home;
