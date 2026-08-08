import Avatar from './Avatar';
import Icon from './Icon';

export default function PeopleSidebar({ currentUser, users, selectedUser, onSelectUser, onLogout }) {
  return (
    <aside className="overflow-hidden border-b border-[#e5e5ea] bg-[#fbfbfd] p-3 md:overflow-y-auto md:border-r md:border-b-0 md:p-5">
      <div className="flex items-center justify-between px-1.5 pb-2.5 md:pb-5"><div className="flex items-center gap-2 text-[1.12rem] font-extrabold tracking-[-0.03em] text-[#1d1d1f]"><span className="grid h-7 w-7 place-items-center rounded-[9px] bg-[#007aff] text-white"><Icon name="chat" size={18} /></span>Relay</div><button onClick={onLogout} className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#f0f0f3] text-[#5b5b60] transition hover:bg-[#e5e5ea] hover:text-[#007aff]" title="Log out" aria-label="Log out"><Icon name="logout" size={19} /></button></div>
      <div className="mx-1.5 mb-6 hidden items-center gap-2.5 rounded-[15px] border border-[#eeeeF2] bg-white p-2.5 md:flex"><Avatar name={currentUser.username} /><div><strong className="block text-sm">{currentUser.username}</strong><span className="mt-0.5 block text-xs text-[#34c759]">Available now</span></div></div>
      <div className="flex justify-between px-1.5 pb-2 text-[0.68rem] font-extrabold tracking-[0.1em] text-[#8e8e93]"><span>MESSAGES</span><span>{users.length}</span></div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 md:grid md:gap-1 md:overflow-visible">
        {users.map((person) => (
          <button key={person.id} className={`flex min-w-[106px] items-center gap-2 rounded-[14px] border border-[#ededf0] bg-white p-2 text-left text-[#3a3a3c] transition hover:bg-[#f0f4fa] md:w-full md:min-w-0 md:border-transparent md:bg-transparent md:p-2.5 ${selectedUser?.id === person.id ? 'border-[#aed1ff] bg-[#e5f0ff] text-[#0066cc] md:bg-[#e5f0ff]' : ''}`} onClick={() => onSelectUser(person)}>
            <span className="relative grid shrink-0"> <Avatar name={person.username} size="sm" />{person.is_online && <i className="absolute -right-px -bottom-px h-[11px] w-[11px] rounded-full border-2 border-white bg-[#34c759]" />}</span><span className="max-w-[54px] overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold md:max-w-none md:text-[0.91rem]">{person.username}</span>
            {person.unread_count > 0 && <b className="relative -ml-1.5 min-w-[17px] self-start rounded-full bg-[#007aff] px-1 py-0.5 text-center text-[0.6rem] text-white md:ml-auto md:min-w-[21px] md:px-1.5 md:text-[0.68rem]">{person.unread_count}</b>}
          </button>
        ))}
      </div>
    </aside>
  );
}
