export default function AuthView({ registering, setRegistering, error, submitting, onSubmit }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">RELAY</p>
        <h1>Private messages, live.</h1>
        <p className="muted">Sign in or create an account to start a conversation.</p>
        <form onSubmit={onSubmit}>
          <label>Username<input name="username" autoComplete="username" required minLength="3" maxLength="150" /></label>
          {registering && <label>Email<input name="email" type="email" autoComplete="email" required /></label>}
          <label>Password<input name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} required minLength="8" /></label>
          <p className="error">{error}</p>
          <button disabled={submitting}>{submitting ? 'Please wait...' : registering ? 'Create account' : 'Sign in'}</button>
        </form>
        <button className="link-button" onClick={() => setRegistering(!registering)}>
          {registering ? 'Already have an account? Sign in' : 'Need an account? Register'}
        </button>
      </section>
    </main>
  );
}
