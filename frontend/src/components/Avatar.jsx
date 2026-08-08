export default function Avatar({ name, size = 'md' }) {
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <span className={`avatar avatar-${size}`}>{initials}</span>;
}
