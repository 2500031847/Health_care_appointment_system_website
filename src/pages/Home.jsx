import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Stethoscope, ShieldCheck, Clock, Star, Activity, Users, HeartPulse } from 'lucide-react';
import { useLS } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { DoctorCard } from '../components';

const services = [
  [Stethoscope, 'General Checkup', 'Routine exams and preventive care.'],
  [HeartPulse, 'Cardiology', 'Heart health, ECG and consultations.'],
  [Activity, 'Neurology', 'Expert care for brain and nerves.'],
  [Users, 'Pediatrics', 'Gentle care for your children.'],
  [ShieldCheck, 'Dental Care', 'Cleaning, fillings and orthodontics.'],
  [Clock, 'Quick Booking', 'Pick a slot and confirm in a minute.'],
];
const reviews = [
  ['Anita R.', 'Booking took less than a minute. The doctor was on time and very caring.'],
  ['Kiran P.', 'Loved how easy it is to track my appointments and cancel when needed.'],
  ['Sameer K.', 'Clean interface and great doctors. Highly recommended for families.'],
];

export default function Home() {
  const [doctors] = useLS('doctors'); const { user } = useAuth(); const nav = useNavigate();
  const go = () => nav(user ? '/dashboard' : '/login');
  return (
    <>
      <section className="hero"><div className="container hero-in">
        <div className="fade">
          <h1>Your Health, <span>Our Priority</span></h1>
          <p>Find trusted specialists and book appointments online — anytime, anywhere.</p>
          <div className="row"><button className="btn white" onClick={go}><CalendarCheck size={18} /> Book Appointment</button>
            {!user && <Link to="/signup" className="btn ghost">Join Now</Link>}</div>
          <div className="row hero-stats"><div><b>8+</b><br />Specialists</div><div><b>24/7</b><br />Online booking</div><div><b>100%</b><br />Secure</div></div>
        </div>
        <img className="float" alt="Doctor" src="https://randomuser.me/api/portraits/women/79.jpg" />
      </div></section>

      <section className="container sec"><h2 className="center">Our Services</h2>
        <div className="grid">{services.map(([I, t, d]) => <div key={t} className="card hover center"><I size={34} color="#0e7490" /><h4>{t}</h4><p className="muted">{d}</p></div>)}</div>
      </section>

      <section className="alt"><div className="container sec"><h2 className="center">Top Doctors</h2>
        <div className="grid">{doctors.slice(0, 4).map(d => <DoctorCard key={d.id} d={d} onBook={go} label="Book Now" />)}</div>
      </div></section>

      <section className="container sec"><h2 className="center">What Patients Say</h2>
        <div className="grid">{reviews.map(([n, t]) => (
          <div key={n} className="card hover"><div className="stars">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}</div>
            <p>“{t}”</p><b>— {n}</b></div>))}</div>
      </section>
    </>
  );
}
