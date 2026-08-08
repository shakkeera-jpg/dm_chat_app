export default function Avatar({ name, size = 'md' }) {
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const sizes = {
    md: 'h-9 w-9 text-xs',
    sm: 'h-9 w-9 text-xs',
  };
  return <span className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-200 to-violet-500 font-extrabold tracking-tight text-white`}>{initials}</span>;
}
