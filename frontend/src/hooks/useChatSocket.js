import { useEffect, useRef } from 'react';

const WS_BASE_URL = 'ws://127.0.0.1:8000/ws/chat/';

export function useChatSocket(token, onEvent) {
  const socketRef = useRef(null);
  const eventHandlerRef = useRef(onEvent);

  useEffect(() => { eventHandlerRef.current = onEvent; }, [onEvent]);

  useEffect(    () => {
    if (!token) return undefined;
    let reconnectTimer;
    let intentionallyClosed = false;

    const connect = () => {
      const socket = new WebSocket(`${WS_BASE_URL}?token=${encodeURIComponent(token)}`);
      socketRef.current = socket;
      socket.onmessage = ({ data }) => eventHandlerRef.current(JSON.parse(data));
      socket.onclose = () => {
        if (!intentionallyClosed && localStorage.getItem('relay_token') === token) {
          reconnectTimer = setTimeout(connect, 2500);
        }
      };
    };

    connect();
    return () => {
      intentionallyClosed = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [token]);

  function send(event) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(event));
      return true;
    }
    return false;
  }

  return { send, close: () => socketRef.current?.close() };
}
