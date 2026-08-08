export default function ToastContainer({ toasts }) {
  return <div id="toasts">{toasts.map((toast) => <div key={toast.id} className="toast">{toast.text}</div>)}</div>;
}
