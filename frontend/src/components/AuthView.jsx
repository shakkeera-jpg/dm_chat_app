import Icon from './Icon';

export default function AuthView({ registering, setRegistering, error, submitting, onSubmit }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_15%_10%,#e4efff_0,transparent_34%),radial-gradient(circle_at_90%_90%,#e9e2ff_0,transparent_31%)] bg-[#f5f5f7] p-4 sm:p-7">
      <section className="w-full max-w-[430px] rounded-[28px] border border-[#e5e5ea] bg-white p-6 text-center shadow-[0_24px_60px_#1d1d1f14] sm:p-10">
        <div className="mx-auto mb-4 grid h-[54px] w-[54px] place-items-center rounded-[17px] bg-linear-to-br from-[#4d98ff] to-[#0066dd] text-white shadow-[0_10px_22px_#007aff40]"><Icon name="chat" size={25} /></div>
        <p className="m-0 text-[0.69rem] font-extrabold tracking-[0.12em] text-[#8e8e93]">RELAY MESSENGER</p>
        <h1 className="my-2 text-[1.85rem] font-bold tracking-[-0.04em] text-[#1d1d1f]">{registering ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mx-auto mb-6 max-w-[290px] text-[0.95rem] leading-relaxed text-[#6e6e73]">{registering ? 'Start a private conversation in seconds.' : 'Sign in to continue your conversations.'}</p>
        <form className="text-left" onSubmit={onSubmit}>
          <label className="mt-4 block text-sm font-bold text-[#3a3a3c]">Username<span className="relative mt-1.5 block text-[#8e8e93]"><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" name="user" size={18} /><input className="h-12 w-full rounded-[13px] border border-[#d1d1d6] bg-white py-0 pr-3.5 pl-11 text-[#1d1d1f] outline-none transition focus:border-[#007aff] focus:ring-4 focus:ring-[#007aff1a]" name="username" autoComplete="username" required minLength="3" maxLength="150" /></span></label>
          {registering && <label className="mt-4 block text-sm font-bold text-[#3a3a3c]">Email<span className="relative mt-1.5 block text-[#8e8e93]"><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" name="mail" size={18} /><input className="h-12 w-full rounded-[13px] border border-[#d1d1d6] bg-white py-0 pr-3.5 pl-11 text-[#1d1d1f] outline-none transition focus:border-[#007aff] focus:ring-4 focus:ring-[#007aff1a]" name="email" type="email" autoComplete="email" required /></span></label>}
          <label className="mt-4 block text-sm font-bold text-[#3a3a3c]">Password<span className="relative mt-1.5 block text-[#8e8e93]"><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" name="lock" size={18} /><input className="h-12 w-full rounded-[13px] border border-[#d1d1d6] bg-white py-0 pr-3.5 pl-11 text-[#1d1d1f] outline-none transition focus:border-[#007aff] focus:ring-4 focus:ring-[#007aff1a]" name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} required minLength="8" /></span></label>
          <p className="mt-3 min-h-5 text-sm text-[#d70015]" aria-live="polite">{error}</p>
          <button className="mt-1.5 h-12 w-full rounded-[13px] bg-[#007aff] font-bold text-white shadow-[0_7px_14px_#007aff2e] transition hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:opacity-65" disabled={submitting}>{submitting ? 'Please wait...' : registering ? 'Create account' : 'Sign in'}</button>
        </form>
        <button className="mt-5 bg-transparent p-0 text-sm font-semibold text-[#007aff]" onClick={() => setRegistering(!registering)}>
          {registering ? 'Already have an account? Sign in' : 'Need an account? Register'}
        </button>
      </section>
    </main>
  );
}
