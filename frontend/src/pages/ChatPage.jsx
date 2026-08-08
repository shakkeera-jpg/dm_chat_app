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
    <main className="flex h-dvh flex-col overflow-hidden bg-white md:grid md:grid-cols-[300px_minmax(0,1fr)]">
      <div className={chat.selectedUser ? 'hidden md:block' : 'block'}><PeopleSidebar currentUser={currentUser} users={chat.users} selectedUser={chat.selectedUser} onSelectUser={chat.selectUser} onLogout={logout} /></div>
      <div className={chat.selectedUser ? 'flex min-h-0 flex-1 md:flex' : 'hidden md:flex'}><ChatWindow currentUser={currentUser} selectedUser={chat.selectedUser} messages={chat.messages} draft={chat.draft} isSending={chat.isSending} typing={chat.typing} onDraftChange={chat.changeDraft} onSendMessage={chat.sendMessage} onClose={chat.closeConversation} /></div>
      <ToastContainer toasts={chat.toasts} />
    </main>
  );
}
