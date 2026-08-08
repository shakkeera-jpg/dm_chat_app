import Icon from './Icon';

export default function AuthView({ registering, setRegistering, error, submitting, onSubmit }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-logo"><Icon name="chat" size={25} /></div>
        <p className="eyebrow">RELAY MESSENGER</p>
        <h1>{registering ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">{registering ? 'Start a private conversation in seconds.' : 'Sign in to continue your conversations.'}</p>
        <form onSubmit={onSubmit}>
          <label>Username<span className="input-wrap"><Icon name="user" size={18} /><input name="username" autoComplete="username" required minLength="3" maxLength="150" /></span></label>
          {registering && <label>Email<span className="input-wrap"><Icon name="mail" size={18} /><input name="email" type="email" autoComplete="email" required /></span></label>}
          <label>Password<span className="input-wrap"><Icon name="lock" size={18} /><input name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} required minLength="8" /></span></label>
          <p className="error">{error}</p>
          <button className="primary-button" disabled={submitting}>{submitting ? 'Please wait...' : registering ? 'Create account' : 'Sign in'}</button>
        </form>
        <button className="link-button" onClick={() => setRegistering(!registering)}>
          {registering ? 'Already have an account? Sign in' : 'Need an account? Register'}
        </button>
      </section>
    </main>
  );
}
