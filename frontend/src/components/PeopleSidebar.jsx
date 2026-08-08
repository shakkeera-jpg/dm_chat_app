export default function PeopleSidebar({ currentUser, users, selectedUser, onSelectUser, onLogout }) {
  return (
    <aside>
      <div className="brand">RELAY <button onClick={onLogout} className="link-button">Log out</button></div>
      <div className="me">Signed in as {currentUser.username}</div>
      <div className="people-title">PEOPLE</div>
      <div>
        {users.map((person) => (
          <button key={person.id} className={`person ${selectedUser?.id === person.id ? 'active' : ''}`} onClick={() => onSelectUser(person)}>
            <span>{person.username}</span>
            {person.unread_count > 0 && <b className="badge">{person.unread_count}</b>}
          </button>
        ))}
      </div>
    </aside>
  );
}
