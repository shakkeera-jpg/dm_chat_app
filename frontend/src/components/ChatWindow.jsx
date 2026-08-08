import { useEffect, useRef } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';

export default function ChatWindow({ currentUser, selectedUser, messages, draft, isSending, typing, onDraftChange, onSendMessage, onClose }) {
  const listRef = useRef(null);
  useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight); }, [messages]);

  if (!selectedUser) return <section className="flex min-w-0 flex-1 bg-white"><div className="m-auto px-6 text-center text-[#6e6e73]"><span className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-[18px] bg-[#f0f5ff] text-[#007aff]"><Icon name="spark" size={29} /></span><h2 className="mb-1.5 text-[1.18rem] font-bold tracking-[-0.03em] text-[#1d1d1f]">Your conversations</h2><p className="m-0 text-sm">Select someone from the list to start messaging.</p></div></section>;
  return (
    <section className="flex min-w-0 flex-1 bg-white">
      <div className="flex min-h-0 w-full flex-col">
        <header className="flex h-[65px] items-center gap-3 border-b border-[#e5e5ea] px-[18px] md:h-[76px] md:px-[26px]"><button className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#007aff] hover:bg-[#f0f4fa] md:hidden" onClick={onClose} aria-label="Back to people list" title="Back to people list"><Icon name="back" size={22} /></button><span className="relative grid shrink-0"><Avatar name={selectedUser.username} size="sm" />{selectedUser.is_online && <i className="absolute -right-px -bottom-px h-[11px] w-[11px] rounded-full border-2 border-white bg-[#34c759]" />}</span><div><strong className="block text-[0.95rem] text-[#1d1d1f]">{selectedUser.username}</strong><span className={`mt-0.5 block min-h-4 text-xs ${typing ? 'text-[#007aff]' : 'text-[#8e8e93]'}`} aria-live="polite">{typing ? 'typing...' : selectedUser.is_online ? 'Active now' : 'Offline'}</span></div></header>
        <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto scroll-smooth p-[18px] md:px-12 md:py-6">
          {messages.map((message) => <div key={message.id} className={`max-w-[84%] whitespace-pre-wrap break-words rounded-[19px] px-3.5 py-2.5 text-[0.91rem] leading-[1.34] md:max-w-[min(72%,520px)] md:text-[0.95rem] ${message.sender_id === currentUser.id ? 'self-end rounded-br-[5px] bg-[#007aff] text-white' : 'self-start rounded-bl-[5px] bg-[#e9e9eb] text-[#1d1d1f]'}`}>{message.text_content}</div>)}
        </div>
        <form className="flex h-16 items-center gap-2.5 border-t border-[#e5e5ea] bg-white px-3.5 py-2.5 md:h-[72px] md:px-12 md:py-3" onSubmit={onSendMessage}>
          <input className="h-11 w-full rounded-full border border-[#e1e1e5] bg-[#f5f5f7] px-4 text-[#1d1d1f] outline-none transition focus:border-[#9dcaff] focus:bg-white focus:ring-3 focus:ring-[#007aff14]" value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="Message" maxLength="2000" autoComplete="off" />
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#007aff] text-white transition hover:scale-105 hover:bg-[#0066d6] disabled:cursor-not-allowed disabled:bg-[#d1d1d6]" disabled={!draft.trim() || isSending} aria-label="Send message" title="Send message">{isSending ? '...' : <Icon name="send" size={18} />}</button>
        </form>
      </div>
    </section>
  );
}
