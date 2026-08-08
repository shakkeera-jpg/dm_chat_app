import { Navigate, Route, Routes } from 'react-router-dom';

import AuthPage from '../pages/AuthPage';
import ChatPage from '../pages/ChatPage';

export default function AppRoutes() {
  return <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="*" element={<Navigate to="/chat" replace />} />
  </Routes>;
}
