import Avatar from './Avatar';
import Icon from './Icon';

export default function PeopleSidebar({ currentUser, users, selectedUser, onSelectUser, onLogout }) {
  return (
    <aside className="people-sidebar">
      <div className="sidebar-top"><div className="brand"><span className="brand-icon"><Icon name="chat" size={18} /></span>Relay</div><button onClick={onLogout} className="icon-button" title="Log out" aria-label="Log out"><Icon name="logout" size={19} /></button></div>
      <div className="current-user"><Avatar name={currentUser.username} /><div><strong>{currentUser.username}</strong><span>Available now</span></div></div>
      <div className="people-title"><span>MESSAGES</span><span>{users.length}</span></div>
      <div className="people-list">
        {users.map((person) => (
          <button key={person.id} className={`person ${selectedUser?.id === person.id ? 'active' : ''}`} onClick={() => onSelectUser(person)}>
            <span className="presence-avatar"><Avatar name={person.username} size="sm" />{person.is_online && <i className="presence-dot" />}</span><span className="person-name">{person.username}</span>
            {person.unread_count > 0 && <b className="badge">{person.unread_count}</b>}
          </button>
        ))}
      </div>
    </aside>
  );
}
