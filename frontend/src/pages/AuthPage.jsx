import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import AuthView from '../components/AuthView';

export default function AuthPage() {
  const { token, currentUser, authenticate } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (token && currentUser) return <Navigate to="/chat" replace />;

  async function submitAuth(event) {
    event.preventDefault(); setSubmitting(true); setError('');
    const form = new FormData(event.currentTarget);
    const payload = { username: form.get('username').trim(), password: form.get('password') };
    if (registering) payload.email = form.get('email').trim();
    try { await authenticate(registering ? 'register' : 'login', payload); }
    catch (requestError) { setError(requestError.message); }
    finally { setSubmitting(false); }
  }

  return <AuthView registering={registering} setRegistering={setRegistering} error={error} submitting={submitting} onSubmit={submitAuth} />;
}
