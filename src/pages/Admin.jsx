import { useState } from 'react';
import { Users, Stethoscope, CalendarCheck, Wallet, Plus, Pencil, Trash2, Clock, Power, CalendarClock } from 'lucide-react';
import { useLS, uid, SLOTS } from '../lib/store';
import { Stat, Tabs, Modal, ApptTable, Bars } from '../components';

const blank = { name: '', email: '', specialization: '', experience: 1, fees: 300, image: '', password: '' };

export default function Admin() {
  const [tab, setTab] = useState('Dashboard');
  const [users, setUsers] = useLS('users');
  const [doctors, setDoctors] = useLS('doctors');
  const [apps, setApps] = useLS('appointments');
  const [departments, setDepartments] = useLS('departments', []);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(null);
  const [av, setAv] = useState(null); // availability modal
  const [rs, setRs] = useState(null); // reschedule modal
  const [deptForm, setDeptForm] = useState(null);

  const patients = users.filter(u => u.role === 'patient');
  const fee = id => doctors.find(d => d.id === id)?.fees || 0;
  const revenue = apps.filter(a => a.status === 'accepted').reduce((s, a) => s + fee(a.doctorId), 0);

  const delDoctor = id => {
    if (!confirm('Delete this doctor?')) return;
    setDoctors(doctors.filter(d => d.id !== id));
    setUsers(users.filter(u => u.id !== id));
    setApps(apps.filter(a => a.doctorId !== id));
  };
  const delUser = id => {
    if (!confirm('Delete this user?')) return;
    setUsers(users.filter(u => u.id !== id));
    setApps(apps.filter(a => a.patientId !== id));
  };

  // 1. Activate / Deactivate Doctor + Patient
  const toggleDoctor = id => setDoctors(doctors.map(d => d.id === id ? { ...d, isActive: d.isActive === false ? true : false } : d));
  const toggleUser = id => setUsers(users.map(u => u.id === id ? { ...u, isActive: u.isActive === false ? true : false } : u));

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
      setDoctors([...doctors, { id, name: f.name, email: f.email, specialization: f.specialization, experience: f.experience, fees: f.fees, availability: SLOTS.slice(0, 6), isActive: true, image: f.image || 'https://randomuser.me/api/portraits/men/10.jpg' }]);
      setUsers([...users, { id, name: f.name, email: f.email, password: f.password || 'doctor123', role: 'doctor', isActive: true }]);
    }
    setForm(null);
  };

  // 2. Save Availability
  const saveAvailability = () => {
    setDoctors(doctors.map(d => d.id === av.id ? { ...d, availability: av.slots } : d));
    setAv(null);
  };

  // 3. Reschedule + Status change
  const setStatus = (id, status) => setApps(apps.map(a => a.id === id ? { ...a, status } : a));
  const saveReschedule = e => {
    e.preventDefault();
    setApps(apps.map(a => a.id === rs.id ? { ...a, date: rs.date, time: rs.time } : a));
    setRs(null);
  };

  // 4. Departments CRUD
  const saveDept = e => {
    e.preventDefault();
    if (deptForm.id) setDepartments(departments.map(d => d.id === deptForm.id ? deptForm : d));
    else setDepartments([...departments, { ...deptForm, id: uid(), isActive: true }]);
    setDeptForm(null);
  };
  const toggleDept = id => setDepartments(departments.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
  const delDept = id => { if (confirm('Delete department?')) setDepartments(departments.filter(d => d.id !== id)); };

  const by = (keyFn, valFn = () => 1) => { const m = {}; apps.forEach(a => { const k = keyFn(a); m[k] = (m[k] || 0) + valFn(a); }); return Object.entries(m).map(([label, value]) => ({ label, value })); };
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const filteredApps = apps.filter(a => filter === 'all' || a.status === filter);
  const rsDoctor = rs ? doctors.find(d => d.id === rs.doctorId) : null;

  return (
    <div className="container page"><h2>Admin Panel</h2>
      <Tabs tabs={['Dashboard', 'Doctors', 'Users', 'Appointments', 'Departments', 'Analytics']} tab={tab} setTab={setTab} />

      {tab === 'Dashboard' && <div className="grid">
        <Stat icon={Users} label="Total Users" value={patients.length} /><Stat icon={Stethoscope} label="Total Doctors" value={doctors.length} />
        <Stat icon={CalendarCheck} label="Total Appointments" value={apps.length} /><Stat icon={Wallet} label="Revenue" value={`₹${revenue}`} /></div>}

      {tab === 'Doctors' && <>
        <button className="btn" onClick={() => setForm(blank)}><Plus size={16} /> Add Doctor</button>
        <div className="card scroll mt"><table><thead><tr><th></th><th>Name</th><th>Email</th><th>Specialization</th><th>Exp</th><th>Fees</th><th>Slots</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{doctors.map(d => <tr key={d.id}><td><img className="avatar sm" src={d.image} alt="" /></td><td>{d.name}</td><td>{d.email}</td><td>{d.specialization}</td><td>{d.experience}y</td><td>₹{d.fees}</td>
            <td>{(d.availability || []).length}</td>
            <td>{d.isActive === false ? 'Inactive' : 'Active'}</td>
            <td><div className="row">
              <button title="Edit" className="btn ghost sm" onClick={() => setForm({ ...d, password: '' })}><Pencil size={14} /></button>
              <button title="Availability" className="btn ghost sm" onClick={() => setAv({ id: d.id, name: d.name, slots: d.availability || [] })}><Clock size={14} /></button>
              <button title={d.isActive === false ? 'Activate' : 'Deactivate'} className={`btn sm ${d.isActive === false ? 'green' : 'red'}`} onClick={() => toggleDoctor(d.id)}><Power size={14} /></button>
              <button className="btn red sm" onClick={() => delDoctor(d.id)}><Trash2 size={14} /></button>
            </div></td></tr>)}</tbody></table></div></>}

      {tab === 'Users' && <div className="card scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{patients.length === 0 && <tr><td colSpan="5" className="muted">No patients registered yet.</td></tr>}
          {patients.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.isActive === false ? 'Inactive' : 'Active'}</td>
            <td><div className="row">
              <button className={`btn sm ${u.isActive === false ? 'green' : 'red'}`} onClick={() => toggleUser(u.id)}><Power size={14} /> {u.isActive === false ? 'Activate' : 'Deactivate'}</button>
              <button className="btn red sm" onClick={() => delUser(u.id)}><Trash2 size={14} /> Delete</button>
            </div></td></tr>)}</tbody></table></div>}

      {tab === 'Appointments' && <>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="mb">
          {['all', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'].map(s => <option key={s}>{s}</option>)}</select>
        <div className="card scroll"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filteredApps.map(a => <tr key={a.id}><td>{a.patientName || '-'}</td><td>{a.doctorName || '-'}</td><td>{a.date}</td><td>{a.time}</td><td>{a.status}</td>
            <td><div className="row">
              {a.status === 'pending' && <><button className="btn sm green" onClick={() => setStatus(a.id, 'accepted')}>Accept</button><button className="btn sm red" onClick={() => setStatus(a.id, 'rejected')}>Reject</button></>}
              {a.status === 'accepted' && <><button className="btn sm green" onClick={() => setStatus(a.id, 'completed')}>Complete</button><button className="btn sm red" onClick={() => setStatus(a.id, 'cancelled')}>Cancel</button></>}
              {(a.status === 'pending' || a.status === 'accepted') && <button title="Reschedule" className="btn ghost sm" onClick={() => setRs({ ...a })}><CalendarClock size={14} /></button>}
            </div></td></tr>)}
            {filteredApps.length === 0 && <tr><td colSpan="6" className="muted">No appointments.</td></tr>}
          </tbody></table></div>
      </>}

      {tab === 'Departments' && <>
        <button className="btn" onClick={() => setDeptForm({ name: '', description: '' })}><Plus size={16} /> Add Department</button>
        <div className="card scroll mt"><table><thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{departments.length === 0 && <tr><td colSpan="4" className="muted">No departments yet.</td></tr>}
            {departments.map(d => <tr key={d.id}><td>{d.name}</td><td>{d.description}</td><td>{d.isActive ? 'Active' : 'Inactive'}</td>
              <td><div className="row">
                <button className="btn ghost sm" onClick={() => setDeptForm(d)}><Pencil size={14} /></button>
                <button className="btn ghost sm" onClick={() => toggleDept(d.id)}><Power size={14} /></button>
                <button className="btn red sm" onClick={() => delDept(d.id)}><Trash2 size={14} /></button>
              </div></td></tr>)}
          </tbody></table></div>
      </>}

      {tab === 'Analytics' && <div className="grid wide">
        <div className="card"><h4>Appointments by Status</h4><Bars data={['pending', 'accepted', 'rejected'].map(s => ({ label: s, value: apps.filter(a => a.status === s).length }))} /></div>
        <div className="card"><h4>Appointments by Doctor</h4><Bars data={by(a => a.doctorName)} /></div>
        <div className="card"><h4>Revenue by Doctor (accepted)</h4><Bars prefix="₹" data={apps.filter(a => a.status === 'accepted').length ? by(a => a.doctorName, a => a.status === 'accepted' ? fee(a.doctorId) : 0) : []} /></div></div>}

      {form && <Modal title={form.id ? 'Edit Doctor' : 'Add Doctor'} onClose={() => setForm(null)}>
        <form className="form" onSubmit={save}>
          <label>Name<input required value={form.name} onChange={set('name')} /></label>
          <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
          <label>Specialization<input required list="deps" value={form.specialization} onChange={set('specialization')} /></label>
          <datalist id="deps">{departments.filter(x => x.isActive).map(x => <option key={x.id} value={x.name} />)}</datalist>
          <label>Experience (years)<input type="number" min="0" required value={form.experience} onChange={set('experience')} /></label>
          <label>Fees (₹)<input type="number" min="0" required value={form.fees} onChange={set('fees')} /></label>
          <label>Image URL (optional)<input value={form.image} onChange={set('image')} /></label>
          {!form.id && <label>Login password (default doctor123)<input value={form.password} onChange={set('password')} /></label>}
          <button className="btn">Save</button></form></Modal>}

      {av && <Modal title={`Availability: ${av.name}`} onClose={() => setAv(null)}>
        <div className="slots">{SLOTS.map(t => <button key={t} type="button" className={`slot ${av.slots.includes(t) ? 'on' : ''}`} onClick={() => setAv({ ...av, slots: av.slots.includes(t) ? av.slots.filter(x => x !== t) : [...av.slots, t] })}>{t}</button>)}</div>
        <button className="btn mt" onClick={saveAvailability}>Save slots</button></Modal>}

      {rs && <Modal title={`Reschedule ${rs.patientName || ''}`} onClose={() => setRs(null)}>
        <form className="form" onSubmit={saveReschedule}>
          <label>New date<input type="date" required value={rs.date} onChange={e => setRs({ ...rs, date: e.target.value })} /></label>
          <label>New time<select required value={rs.time} onChange={e => setRs({ ...rs, time: e.target.value })} style={{ width: '100%' }}>{(rsDoctor?.availability || SLOTS).map(t => <option key={t}>{t}</option>)}</select></label>
          <button className="btn">Reschedule</button></form></Modal>}

      {deptForm && <Modal title={deptForm.id ? 'Edit Department' : 'Add Department'} onClose={() => setDeptForm(null)}>
        <form className="form" onSubmit={saveDept}>
          <label>Name<input required value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} /></label>
          <label>Description<textarea rows="2" value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} /></label>
          <button className="btn">Save</button></form></Modal>}
    </div>
  );
}
