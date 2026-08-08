import Icon from './Icon';

export default function ToastContainer({ toasts }) {
  return <div id="toasts" aria-live="polite" aria-atomic="true">{toasts.map((toast) => <div key={toast.id} className="toast" role="status"><Icon name="chat" size={18} /><span>{toast.text}</span></div>)}</div>;
}
