import { useState } from 'react';
export const SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];
export const read = (k, d = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
export const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const P = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const DOCS = [
  ['Dr. Sarah Johnson','Cardiologist',12,800,'women',44,'sarah'],
  ['Dr. Michael Chen','Dentist',8,400,'men',32,'michael'],
  ['Dr. Emily Davis','General',10,300,'women',65,'emily'],
  ['Dr. James Wilson','Neurologist',15,1000,'men',75,'james'],
  ['Dr. Priya Sharma','Dermatologist',9,500,'women',68,'priya'],
  ['Dr. Robert Brown','Orthopedic',14,700,'men',52,'robert'],
  ['Dr. Olivia Martinez','Pediatrician',11,450,'women',12,'olivia'],
  ['Dr. David Lee','ENT',7,350,'men',22,'david'],
];
export function seed() {
  if (!localStorage.getItem('doctors'))
    write('doctors', DOCS.map(([name, specialization, experience, fees, g, n, e], i) => ({
      id: 'doc' + (i + 1), name, email: `${e}@health.com`, specialization, experience, fees,
      availability: SLOTS.slice(0, 6 + (i % 3)), image: P(g, n),
    })));
  let users = read('users');
  if (!users.some(u => u.email === 'admin@health.com'))
    users.push({ id: 'admin', name: 'Admin', email: 'admin@health.com', password: 'admin123', role: 'admin' });
  read('doctors').forEach(d => {
    if (!users.some(u => u.id === d.id)) users.push({ id: d.id, name: d.name, email: d.email, password: 'doctor123', role: 'doctor' });
  });
  write('users', users);
  if (!localStorage.getItem('appointments')) write('appointments', []);
}
export function useLS(key) {
  const [v, s] = useState(() => read(key));
  const set = x => { const n = typeof x === 'function' ? x(v) : x; write(key, n); s(n); };
  return [v, set];
}
