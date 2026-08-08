import { Navigate } from 'react-router-dom';

import ChatWindow from '../components/ChatWindow';
import PeopleSidebar from '../components/PeopleSidebar';
import ToastContainer from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function ChatPage() {
  const { token, currentUser, logout } = useAuth();
  const chat = useChat();
  if (!token || !currentUser) return <Navigate to="/auth" replace />;

  return (
    <main className="chat-shell">
      <PeopleSidebar currentUser={currentUser} users={chat.users} selectedUser={chat.selectedUser} onSelectUser={chat.selectUser} onLogout={logout} />
      <ChatWindow currentUser={currentUser} selectedUser={chat.selectedUser} messages={chat.messages} draft={chat.draft} isSending={chat.isSending} typing={chat.typing} onDraftChange={chat.changeDraft} onSendMessage={chat.sendMessage} />
      <ToastContainer toasts={chat.toasts} />
    </main>
  );
}
