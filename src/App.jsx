import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, Link, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut, Menu, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth, home } from './context/AuthContext';
import Home from './pages/Home';
import { Login, Signup } from './pages/Auth';
import { Dashboard, MyAppointments, Profile } from './pages/Patient';
import DoctorPanel from './pages/Doctor';
import Admin from './pages/Admin';

function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const links = !user ? [] : user.role === 'patient'
    ? [['/dashboard', 'Find Doctors'], ['/appointments', 'My Appointments'], ['/profile', 'Profile']]
    : user.role === 'doctor' ? [['/doctor', 'Doctor Panel']] : [['/admin', 'Admin Panel']];
  return (
    <nav className="top"><div className="container nav-in">
      <Link to="/" className="logo"><HeartPulse /> MediCare+</Link>
      <button className="icon burger" onClick={() => setOpen(!open)}><Menu /></button>
      <div className={`links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <NavLink to="/" end>Home</NavLink>
        {links.map(([to, t]) => <NavLink key={to} to={to}>{t}</NavLink>)}
        {user ? <button className="btn sm" onClick={() => { logout(); nav('/login'); }}><LogOut size={15} /> Logout ({user.name.split(' ')[0]})</button>
          : <><NavLink to="/login">Login</NavLink><Link to="/signup" className="btn sm">Sign Up</Link></>}
      </div>
    </div></nav>
  );
}
const Guard = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={home(user.role)} replace />;
  return children;
};
const Public = ({ children }) => { const { user } = useAuth(); return user ? <Navigate to={home(user.role)} replace /> : children; };

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Public><Login /></Public>} />
        <Route path="/signup" element={<Public><Signup /></Public>} />
        <Route path="/dashboard" element={<Guard roles={['patient']}><Dashboard /></Guard>} />
        <Route path="/appointments" element={<Guard roles={['patient']}><MyAppointments /></Guard>} />
        <Route path="/profile" element={<Guard roles={['patient']}><Profile /></Guard>} />
        <Route path="/doctor" element={<Guard roles={['doctor']}><DoctorPanel /></Guard>} />
        <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer><div className="container foot">
        <div><div className="logo light"><HeartPulse /> MediCare+</div><p>Quality healthcare, booked in a few clicks.</p></div>
        <div><p><Mail size={14} /> support@medicare.com</p><p><Phone size={14} /> +91 98765 43210</p><p><MapPin size={14} /> Andhra Pradesh, India</p></div>
        <p>© {new Date().getFullYear()} MediCare+. All rights reserved.</p>
      </div></footer>
    </>
  );
}
