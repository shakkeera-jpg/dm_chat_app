import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { apiRequest } from '../api/client';
import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);
const moveUserToTop = (people, userId) => {
  const person = people.find((item) => item.id === userId);
  return person ? [person, ...people.filter((item) => item.id !== userId)] : people;
};

export function ChatProvider({ children }) {
  const { token, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
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

  const loadUsers = useCallback(async () => {
    if (token) setUsers(await apiRequest('/users', token));
  }, [token]);

  const handleSocketEvent = useCallback(async (event) => {
    const message = event.message;
    if (event.type === 'message_sent' && selectedUserRef.current?.id === message.recipient_id) {
      setMessages((items) => [...items, message]);
      setUsers((items) => moveUserToTop(items, message.recipient_id));
    }
    if (event.type === 'private_message' && selectedUserRef.current?.id === message.sender_id) {
      setMessages((items) => [...items, message]);
      setUsers((items) => moveUserToTop(items, message.sender_id));
      await apiRequest(`/messages/${message.sender_id}/read`, token, { method: 'PATCH' });
    }
    if (event.type === 'new_message_notification') {
      setUsers((items) => moveUserToTop(items.map((item) => item.id === message.sender_id ? { ...item, unread_count: item.unread_count + 1 } : item), message.sender_id));
      showToast(`New message: ${message.text_content}`);
    }
    if (event.type === 'user_registered') await loadUsers();
    if (event.type === 'typing_status') setTyping(event.is_typing);
    if (event.type === 'error') showToast(event.detail);
  }, [loadUsers, showToast, token]);

  const { send } = useChatSocket(token, handleSocketEvent);

  useEffect(() => {
    if (!token || !currentUser) {
      setUsers([]); setSelectedUser(null); setMessages([]); setDraft('');
      return;
    }
    loadUsers().catch((error) => showToast(error.message));
  }, [token, currentUser, loadUsers, showToast]);

  async function selectUser(person) {
    setSelectedUser(person); setTyping(false); send({ type: 'set_active_chat', other_user_id: person.id });
    try {
      setMessages(await apiRequest(`/messages/${person.id}`, token));
      await apiRequest(`/messages/${person.id}/read`, token, { method: 'PATCH' });
      setUsers((items) => items.map((item) => item.id === person.id ? { ...item, unread_count: 0 } : item));
    } catch (error) { showToast(error.message); }
  }

  function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim() || !selectedUser) return;
    if (send({ type: 'send_private_message', recipient_id: selectedUser.id, text_content: draft.trim() })) setDraft('');
  }

  function changeDraft(value) {
    setDraft(value);
    if (!selectedUser) return;
    send({ type: 'typing_status', recipient_id: selectedUser.id, is_typing: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => send({ type: 'typing_status', recipient_id: selectedUser.id, is_typing: false }), 700);
  }

  return <ChatContext.Provider value={{ users, selectedUser, messages, draft, typing, toasts, selectUser, sendMessage, changeDraft }}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used inside ChatProvider.');
  return context;
}
