import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuth, home } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState('');
  const submit = e => { e.preventDefault(); const r = login(f.email.trim(), f.password); r.error ? setErr(r.error) : nav(home(r.user.role)); };
  return (
    <div className="auth"><form className="card auth-card" onSubmit={submit}>
      <HeartPulse size={36} color="#0e7490" /><h2>Welcome back</h2><p className="muted">Login as patient, doctor or admin</p>
      {err && <div className="alert">{err}</div>}
      <input type="email" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <input type="password" placeholder="Password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
      <button className="btn">Login</button>
      <p className="muted">New here? <Link to="/signup" className="link">Create account</Link></p>
      <small className="muted">Demo — Admin: admin@health.com / admin123 · Doctor: sarah@health.com / doctor123</small>
    </form></div>
  );
}

export function Signup() {
  const { signup } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' }); const [err, setErr] = useState('');
  const submit = e => {
    e.preventDefault();
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.');
    const r = signup({ ...f, name: f.name.trim(), email: f.email.trim() });
    r.error ? setErr(r.error) : nav('/login');
  };
  return (
    <div className="auth"><form className="card auth-card" onSubmit={submit}>
      <HeartPulse size={36} color="#0e7490" /><h2>Create account</h2><p className="muted">Register as a patient</p>
      {err && <div className="alert">{err}</div>}
      <input placeholder="Full name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      <input type="email" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <input type="password" placeholder="Password (min 6 chars)" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
      <input value="Patient" disabled />
      <button className="btn">Sign Up</button>
      <p className="muted">Already registered? <Link to="/login" className="link">Login</Link></p>
    </form></div>
  );
}
