import { useEffect, useRef } from 'react';

export default function ChatWindow({ currentUser, selectedUser, messages, draft, typing, onDraftChange, onSendMessage }) {
  const listRef = useRef(null);
  useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight); }, [messages]);

  if (!selectedUser) return <section className="conversation"><div className="empty">Select someone to begin chatting.</div></section>;
  return (
    <section className="conversation">
      <div>
        <header><div><strong>{selectedUser.username}</strong><span id="typing">{typing ? 'typing...' : ''}</span></div></header>
        <div id="messages" ref={listRef}>
          {messages.map((message) => <div key={message.id} className={`message ${message.sender_id === currentUser.id ? 'mine' : ''}`}>{message.text_content}</div>)}
        </div>
        <form id="message-form" onSubmit={onSendMessage}>
          <input value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="Write a message..." maxLength="2000" autoComplete="off" />
          <button disabled={!draft.trim()}>Send</button>
        </form>
      </div>
    </section>
  );
}
