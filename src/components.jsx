import { X, Clock, Briefcase, Wallet } from 'lucide-react';
export const Badge = ({ s }) => <span className={`badge ${s}`}>{s}</span>;
export const Stat = ({ icon: I, label, value }) => (
  <div className="card stat hover"><I size={30} /><div><h3>{value}</h3><p>{label}</p></div></div>
);
export const Modal = ({ title, onClose, children }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal card" onClick={e => e.stopPropagation()}>
      <div className="row between"><h3>{title}</h3><button className="icon" onClick={onClose}><X /></button></div>
      {children}
    </div>
  </div>
);
export const Tabs = ({ tabs, tab, setTab }) => (
  <div className="tabs">{tabs.map(t => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
);
export const DoctorCard = ({ d, onBook, label = 'Book Appointment' }) => (
  <div className="card hover doc">
    <img src={d.image} alt={d.name} />
    <h4>{d.name}</h4>
    <span className="tag">{d.specialization}</span>
    <p className="muted"><Briefcase size={14} /> {d.experience} yrs experience</p>
    <p className="muted"><Wallet size={14} /> Fees: ₹{d.fees}</p>
    <p className="muted"><Clock size={14} /> {d.availability.length ? `${d.availability.length} slots (${d.availability[0]} - ${d.availability[d.availability.length - 1]})` : 'Not available'}</p>
    <button className="btn" onClick={onBook}>{label}</button>
  </div>
);
export const ApptTable = ({ list, actions }) => (
  <div className="card scroll">
    <table>
      <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th>{actions && <th>Actions</th>}</tr></thead>
      <tbody>
        {list.length === 0 && <tr><td colSpan="7" className="muted">No appointments found.</td></tr>}
        {list.map(a => (
          <tr key={a.id}><td>{a.patientName}</td><td>{a.doctorName}</td><td>{a.date}</td><td>{a.time}</td><td>{a.reason}</td>
            <td><Badge s={a.status} /></td>{actions && <td><div className="row">{actions(a)}</div></td>}</tr>
        ))}
      </tbody>
    </table>
  </div>
);
export const Bars = ({ data, prefix = '' }) => {
  const max = Math.max(1, ...data.map(d => d.value));
  return <div className="bars">{data.map(d => (
    <div key={d.label} className="bar-row"><span>{d.label}</span>
      <div className="track"><div className="fill" style={{ width: `${(d.value / max) * 100}%` }} /></div><b>{prefix}{d.value}</b></div>
  ))}</div>;
};
