import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLS, uid, today } from '../lib/store';
import { DoctorCard, Modal, Badge } from '../components';

function Book({ d, user, apps, setApps, onClose }) {
  const nav = useNavigate();
  const [f, setF] = useState({ patientName: user.name, date: '', time: '', reason: '' });
  const [msg, setMsg] = useState('');
  const taken = apps.filter(a => a.doctorId === d.id && a.date === f.date && a.status !== 'rejected').map(a => a.time);
  const submit = e => {
    e.preventDefault();
    if (!f.time) return setMsg('Please select a time slot.');
    setApps([...apps, { id: uid(), patientId: user.id, patientName: f.patientName, doctorId: d.id, doctorName: d.name, date: f.date, time: f.time, status: 'pending', reason: f.reason }]);
    nav('/appointments');
  };
  return (
    <Modal title={`Book with ${d.name}`} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label>Patient name<input required value={f.patientName} onChange={e => setF({ ...f, patientName: e.target.value })} /></label>
        <label>Date<input type="date" required min={today()} value={f.date} onChange={e => setF({ ...f, date: e.target.value, time: '' })} /></label>
        <label>Time slot</label>
        <div className="slots">{d.availability.length === 0 && <span className="muted">No slots available.</span>}
          {d.availability.map(t => <button type="button" key={t} disabled={!f.date || taken.includes(t)} className={`slot ${f.time === t ? 'on' : ''}`} onClick={() => setF({ ...f, time: t })}>{t}</button>)}</div>
        {!f.date && <small className="muted">Choose a date to enable slots.</small>}
        <label>Reason<textarea required rows="3" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} /></label>
        {msg && <div className="alert">{msg}</div>}
        <button className="btn">Confirm Booking (₹{d.fees})</button>
      </form>
    </Modal>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [doctors] = useLS('doctors'); const [apps, setApps] = useLS('appointments');
  const [q, setQ] = useState(''); const [spec, setSpec] = useState('All'); const [sel, setSel] = useState(null);
  const specs = ['All', ...new Set(doctors.map(d => d.specialization))];
  const list = doctors.filter(d => (spec === 'All' || d.specialization === spec) && (d.name + d.specialization).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="container page">
      <h2>Hello, {user.name} 👋</h2><p className="muted">Find a doctor by specialization and book your visit.</p>
      <div className="row filters">
        <div className="search"><Search size={18} /><input placeholder="Search doctor or specialization" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select value={spec} onChange={e => setSpec(e.target.value)}>{specs.map(s => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="grid">{list.map(d => <DoctorCard key={d.id} d={d} onBook={() => setSel(d)} />)}</div>
      {list.length === 0 && <p className="muted center">No doctors found.</p>}
      {sel && <Book d={sel} user={user} apps={apps} setApps={setApps} onClose={() => setSel(null)} />}
    </div>
  );
}

export function MyAppointments() {
  const { user } = useAuth(); const [apps, setApps] = useLS('appointments');
  const mine = apps.filter(a => a.patientId === user.id);
  const cancel = id => confirm('Cancel this appointment?') && setApps(apps.filter(a => a.id !== id));
  return (
    <div className="container page"><h2>My Appointments</h2>
      {mine.length === 0 && <p className="muted">You have no appointments yet.</p>}
      <div className="grid">{mine.map(a => (
        <div key={a.id} className="card hover"><div className="row between"><h4>{a.doctorName}</h4><Badge s={a.status} /></div>
          <p className="muted">📅 {a.date} · ⏰ {a.time}</p><p>Patient: {a.patientName}</p><p>Reason: {a.reason}</p>
          <button className="btn red sm" onClick={() => cancel(a.id)}>Cancel</button></div>))}</div>
    </div>
  );
}

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user.name); const [password, setPassword] = useState(''); const [ok, setOk] = useState(false);
  const submit = e => { e.preventDefault(); updateProfile({ name, password }); setPassword(''); setOk(true); };
  return (
    <div className="container page"><form className="card auth-card" style={{ margin: '0 auto' }} onSubmit={submit}>
      <h2>My Profile</h2>
      <label>Name<input required value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Email<input value={user.email} disabled /></label>
      <label>Role<input value={user.role} disabled /></label>
      <label>New password (optional)<input type="password" minLength="6" value={password} onChange={e => setPassword(e.target.value)} /></label>
      {ok && <div className="alert ok">Profile updated.</div>}
      <button className="btn">Save Changes</button>
    </form></div>
  );
}
