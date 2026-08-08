import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);
const moveUserToTop = (people, userId) => {
  const person = people.find((item) => item.id === userId);
  return person ? [person, ...people.filter((item) => item.id !== userId)] : people;
};

export function ChatProvider({ children }) {
  const { token, currentUser, logout, refreshAccessToken, authenticatedRequest } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [toasts, setToasts] = useState([]);
  const selectedUserRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  const showToast = useCallback((text) => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, text }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4000);
  }, []);

  const handleApiError = useCallback((error) => {
    if (error.status === 401) {
      logout();
      return;
    }
    showToast(error.message);
  }, [logout, showToast]);

  const loadUsers = useCallback(async () => {
    if (token) setUsers(await authenticatedRequest('/users'));
  }, [token, authenticatedRequest]);

  const handleSocketEvent = useCallback(async (event) => {
    const message = event.message;
    if (event.type === 'message_sent') {
      setIsSending(false);
      if (selectedUserRef.current?.id === message.recipient_id) {
        setMessages((items) => [...items, message]);
        setUsers((items) => moveUserToTop(items, message.recipient_id));
      }
    }
    if (event.type === 'private_message' && selectedUserRef.current?.id === message.sender_id) {
      setMessages((items) => [...items, message]);
      setUsers((items) => moveUserToTop(items, message.sender_id));
      try { await authenticatedRequest(`/messages/${message.sender_id}/read`, { method: 'PATCH' }); }
      catch (error) { handleApiError(error); }
    }
    if (event.type === 'new_message_notification') {
      setUsers((items) => moveUserToTop(items.map((item) => item.id === message.sender_id ? { ...item, unread_count: item.unread_count + 1 } : item), message.sender_id));
      showToast(`New message: ${message.text_content}`);
    }
    if (event.type === 'user_registered') await loadUsers();
    if (event.type === 'presence_update') {
      setUsers((items) => items.map((item) => item.id === event.user_id ? { ...item, is_online: event.is_online } : item));
      setSelectedUser((user) => user?.id === event.user_id ? { ...user, is_online: event.is_online } : user);
    }
    if (event.type === 'typing_status') setTyping(event.is_typing);
    if (event.type === 'error') {
      setIsSending(false);
      showToast(event.detail);
    }
  }, [authenticatedRequest, handleApiError, loadUsers, showToast]);

  const { send } = useChatSocket(token, handleSocketEvent, refreshAccessToken);

  useEffect(() => {
    if (!token || !currentUser) {
      setUsers([]); setSelectedUser(null); setMessages([]); setDraft(''); setIsSending(false);
      return;
    }
    loadUsers().catch(handleApiError);
  }, [token, currentUser, loadUsers, handleApiError]);

  async function selectUser(person) {
    setSelectedUser(person); setTyping(false); send({ type: 'set_active_chat', other_user_id: person.id });
    try {
      setMessages(await authenticatedRequest(`/messages/${person.id}`));
      await authenticatedRequest(`/messages/${person.id}/read`, { method: 'PATCH' });
      setUsers((items) => items.map((item) => item.id === person.id ? { ...item, unread_count: 0 } : item));
    } catch (error) { handleApiError(error); }
  }

  function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim() || !selectedUser || isSending) return;
    setIsSending(true);
    if (send({ type: 'send_private_message', recipient_id: selectedUser.id, text_content: draft.trim() })) {
      setDraft('');
    } else {
      setIsSending(false);
      showToast('Connection is unavailable. Please try again.');
    }
  }

  function changeDraft(value) {
    setDraft(value);
    if (!selectedUser) return;
    clearTimeout(typingTimer.current);
    const isTyping = Boolean(value.trim());
    send({ type: 'typing_status', recipient_id: selectedUser.id, is_typing: isTyping });
    if (!isTyping) return;
    typingTimer.current = setTimeout(() => send({ type: 'typing_status', recipient_id: selectedUser.id, is_typing: false }), 700);
  }

  return <ChatContext.Provider value={{ users, selectedUser, messages, draft, isSending, typing, toasts, selectUser, sendMessage, changeDraft }}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used inside ChatProvider.');
  return context;
}
