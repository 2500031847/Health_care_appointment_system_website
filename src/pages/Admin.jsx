import { useState } from 'react';
import { Users, Stethoscope, CalendarCheck, Wallet, Plus, Pencil, Trash2 } from 'lucide-react';
import { useLS, uid, SLOTS } from '../lib/store';
import { Stat, Tabs, Modal, ApptTable, Bars } from '../components';

const blank = { name: '', email: '', specialization: '', experience: 1, fees: 300, image: '', password: '' };

export default function Admin() {
  const [tab, setTab] = useState('Dashboard');
  const [users, setUsers] = useLS('users'); const [doctors, setDoctors] = useLS('doctors'); const [apps, setApps] = useLS('appointments');
  const [filter, setFilter] = useState('all'); const [form, setForm] = useState(null);
  const patients = users.filter(u => u.role === 'patient');
  const fee = id => doctors.find(d => d.id === id)?.fees || 0;
  const revenue = apps.filter(a => a.status === 'accepted').reduce((s, a) => s + fee(a.doctorId), 0);

  const delDoctor = id => { if (!confirm('Delete this doctor?')) return;
    setDoctors(doctors.filter(d => d.id !== id)); setUsers(users.filter(u => u.id !== id)); setApps(apps.filter(a => a.doctorId !== id)); };
  const delUser = id => { if (!confirm('Delete this user?')) return;
    setUsers(users.filter(u => u.id !== id)); setApps(apps.filter(a => a.patientId !== id)); };
  const save = e => {
    e.preventDefault();
    const f = { ...form, experience: +form.experience, fees: +form.fees };
    if (f.id) {
      setDoctors(doctors.map(d => d.id === f.id ? { ...d, name: f.name, email: f.email, specialization: f.specialization, experience: f.experience, fees: f.fees, image: f.image || d.image } : d));
      setUsers(users.map(u => u.id === f.id ? { ...u, name: f.name, email: f.email } : u));
      setApps(apps.map(a => a.doctorId === f.id ? { ...a, doctorName: f.name } : a));
    } else {
      if (users.some(u => u.email.toLowerCase() === f.email.toLowerCase())) return alert('Email already exists.');
      const id = uid();
      setDoctors([...doctors, { id, name: f.name, email: f.email, specialization: f.specialization, experience: f.experience, fees: f.fees, availability: SLOTS.slice(0, 6), image: f.image || 'https://randomuser.me/api/portraits/men/10.jpg' }]);
      setUsers([...users, { id, name: f.name, email: f.email, password: f.password || 'doctor123', role: 'doctor' }]);
    }
    setForm(null);
  };
  const by = (keyFn, valFn = () => 1) => { const m = {}; apps.forEach(a => { const k = keyFn(a); m[k] = (m[k] || 0) + valFn(a); }); return Object.entries(m).map(([label, value]) => ({ label, value })); };
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="container page"><h2>Admin Panel</h2>
      <Tabs tabs={['Dashboard', 'Doctors', 'Users', 'Appointments', 'Analytics']} tab={tab} setTab={setTab} />
      {tab === 'Dashboard' && <div className="grid">
        <Stat icon={Users} label="Total Users" value={patients.length} /><Stat icon={Stethoscope} label="Total Doctors" value={doctors.length} />
        <Stat icon={CalendarCheck} label="Total Appointments" value={apps.length} /><Stat icon={Wallet} label="Revenue" value={`₹${revenue}`} /></div>}

      {tab === 'Doctors' && <>
        <button className="btn" onClick={() => setForm(blank)}><Plus size={16} /> Add Doctor</button>
        <div className="card scroll mt"><table><thead><tr><th></th><th>Name</th><th>Email</th><th>Specialization</th><th>Exp</th><th>Fees</th><th>Actions</th></tr></thead>
          <tbody>{doctors.map(d => <tr key={d.id}><td><img className="avatar sm" src={d.image} alt="" /></td><td>{d.name}</td><td>{d.email}</td><td>{d.specialization}</td><td>{d.experience}y</td><td>₹{d.fees}</td>
            <td><div className="row"><button className="btn ghost sm" onClick={() => setForm({ ...d, password: '' })}><Pencil size={14} /></button>
              <button className="btn red sm" onClick={() => delDoctor(d.id)}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div></>}

      {tab === 'Users' && <div className="card scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
        <tbody>{patients.length === 0 && <tr><td colSpan="4" className="muted">No patients registered yet.</td></tr>}
          {patients.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
            <td><button className="btn red sm" onClick={() => delUser(u.id)}><Trash2 size={14} /> Delete</button></td></tr>)}</tbody></table></div>}

      {tab === 'Appointments' && <><select value={filter} onChange={e => setFilter(e.target.value)} className="mb">
        {['all', 'pending', 'accepted', 'rejected'].map(s => <option key={s}>{s}</option>)}</select>
        <ApptTable list={apps.filter(a => filter === 'all' || a.status === filter)} /></>}

      {tab === 'Analytics' && <div className="grid wide">
        <div className="card"><h4>Appointments by Status</h4><Bars data={['pending', 'accepted', 'rejected'].map(s => ({ label: s, value: apps.filter(a => a.status === s).length }))} /></div>
        <div className="card"><h4>Appointments by Doctor</h4><Bars data={by(a => a.doctorName)} /></div>
        <div className="card"><h4>Revenue by Doctor (accepted)</h4><Bars prefix="₹" data={apps.filter(a => a.status === 'accepted').length ? by(a => a.doctorName, a => a.status === 'accepted' ? fee(a.doctorId) : 0) : []} /></div></div>}

      {form && <Modal title={form.id ? 'Edit Doctor' : 'Add Doctor'} onClose={() => setForm(null)}>
        <form className="form" onSubmit={save}>
          <label>Name<input required value={form.name} onChange={set('name')} /></label>
          <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
          <label>Specialization<input required value={form.specialization} onChange={set('specialization')} /></label>
          <label>Experience (years)<input type="number" min="0" required value={form.experience} onChange={set('experience')} /></label>
          <label>Fees (₹)<input type="number" min="0" required value={form.fees} onChange={set('fees')} /></label>
          <label>Image URL (optional)<input value={form.image} onChange={set('image')} /></label>
          {!form.id && <label>Login password (default doctor123)<input value={form.password} onChange={set('password')} /></label>}
          <button className="btn">Save</button></form></Modal>}
    </div>
  );
}
