import { useState } from 'react';
import { CalendarDays, ClipboardList, Users, Check, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLS, SLOTS, today } from '../lib/store';
import { Stat, Tabs, ApptTable, Modal } from '../components';

export default function DoctorPanel() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useLS('doctors'); const [apps, setApps] = useLS('appointments'); const [users] = useLS('users');
  const [tab, setTab] = useState('Overview'); const [view, setView] = useState(null);
  const me = doctors.find(d => d.id === user.id);
  if (!me) return <div className="container page"><p>Doctor profile not found.</p></div>;
  const mine = apps.filter(a => a.doctorId === me.id);
  const todays = mine.filter(a => a.date === today() && a.status !== 'rejected');
  const patientIds = [...new Set(mine.map(a => a.patientId))];
  const setStatus = (id, status) => setApps(apps.map(a => (a.id === id ? { ...a, status } : a)));
  const toggle = t => setDoctors(doctors.map(d => d.id !== me.id ? d : {
    ...d, availability: SLOTS.filter(s => (s === t ? !d.availability.includes(s) : d.availability.includes(s))),
  }));
  const actions = a => <>
    {a.status === 'pending' && <><button className="btn green sm" onClick={() => setStatus(a.id, 'accepted')}><Check size={14} /> Accept</button>
      <button className="btn red sm" onClick={() => setStatus(a.id, 'rejected')}><X size={14} /> Reject</button></>}
    <button className="btn ghost sm" onClick={() => setView(a.patientId)}><Eye size={14} /></button></>;
  const pu = users.find(u => u.id === view);
  return (
    <div className="container page">
      <div className="row"><img className="avatar" src={me.image} alt="" /><div><h2>{me.name}</h2><p className="muted">{me.specialization} · {me.experience} yrs</p></div></div>
      <Tabs tabs={['Overview', 'Appointments', 'Availability', 'Patients']} tab={tab} setTab={setTab} />
      {tab === 'Overview' && <>
        <div className="grid"><Stat icon={CalendarDays} label="Today's Appointments" value={todays.length} />
          <Stat icon={ClipboardList} label="Total Appointments" value={mine.length} /><Stat icon={Users} label="Patients" value={patientIds.length} /></div>
        <h3 className="mt">Today's Schedule</h3><ApptTable list={todays} actions={actions} /></>}
      {tab === 'Appointments' && <ApptTable list={mine} actions={actions} />}
      {tab === 'Availability' && <div className="card"><h3>Manage Time Slots</h3><p className="muted">Click a slot to toggle availability.</p>
        <div className="slots">{SLOTS.map(t => <button key={t} className={`slot ${me.availability.includes(t) ? 'on' : ''}`} onClick={() => toggle(t)}>{t}</button>)}</div></div>}
      {tab === 'Patients' && <div className="grid">{patientIds.length === 0 && <p className="muted">No patients yet.</p>}
        {patientIds.map(id => { const u = users.find(x => x.id === id); const list = mine.filter(a => a.patientId === id);
          return <div key={id} className="card hover"><h4>{u?.name || list[0].patientName}</h4><p className="muted">{u?.email}</p><p>{list.length} visit(s)</p>
            <button className="btn ghost sm" onClick={() => setView(id)}>View details</button></div>; })}</div>}
      {view && <Modal title="Patient Details" onClose={() => setView(null)}>
        <p><b>Name:</b> {pu?.name}</p><p><b>Email:</b> {pu?.email}</p><h4 className="mt">History with you</h4>
        {mine.filter(a => a.patientId === view).map(a => <p key={a.id} className="muted">• {a.date} {a.time} — {a.reason} ({a.status})</p>)}</Modal>}
    </div>
  );
}
