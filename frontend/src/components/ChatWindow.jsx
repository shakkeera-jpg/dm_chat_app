import { useEffect, useRef } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';

export default function ChatWindow({ currentUser, selectedUser, messages, draft, isSending, typing, onDraftChange, onSendMessage }) {
  const listRef = useRef(null);
  useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight); }, [messages]);

  if (!selectedUser) return <section className="conversation"><div className="empty"><span className="empty-icon"><Icon name="spark" size={29} /></span><h2>Your conversations</h2><p>Select someone from the list to start messaging.</p></div></section>;
  return (
    <section className="conversation">
      <div>
        <header className="chat-header"><span className="presence-avatar"><Avatar name={selectedUser.username} size="sm" />{selectedUser.is_online && <i className="presence-dot" />}</span><div><strong>{selectedUser.username}</strong><span id="typing" aria-live="polite">{typing ? 'typing...' : selectedUser.is_online ? 'Active now' : 'Offline'}</span></div></header>
        <div id="messages" ref={listRef}>
          {messages.map((message) => <div key={message.id} className={`message ${message.sender_id === currentUser.id ? 'mine' : ''}`}>{message.text_content}</div>)}
        </div>
        <form id="message-form" onSubmit={onSendMessage}>
          <input value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="Message" maxLength="2000" autoComplete="off" />
          <button className="send-button" disabled={!draft.trim() || isSending} aria-label="Send message" title="Send message">{isSending ? '...' : <Icon name="send" size={18} />}</button>
        </form>
      </div>
    </section>
  );
}
