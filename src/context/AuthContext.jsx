import { createContext, useContext, useState } from 'react';
import { read, write, uid } from '../lib/store';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export const home = r => (r === 'admin' ? '/admin' : r === 'doctor' ? '/doctor' : '/dashboard');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read('currentUser', null));
  const signup = ({ name, email, password }) => {
    const users = read('users');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { error: 'This email is already registered.' };
    write('users', [...users, { id: uid(), name, email, password, role: 'patient' }]);
    return { ok: true };
  };
  const login = (email, password) => {
    const u = read('users').find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return { error: 'Invalid email or password.' };
    const c = { id: u.id, name: u.name, email: u.email, role: u.role };
    write('currentUser', c); setUser(c);
    return { user: c };
  };
  const logout = () => { localStorage.removeItem('currentUser'); setUser(null); };
  const updateProfile = ({ name, password }) => {
    const users = read('users').map(u => (u.id === user.id ? { ...u, name, ...(password ? { password } : {}) } : u));
    write('users', users);
    const c = { ...user, name }; write('currentUser', c); setUser(c);
  };
  return <Ctx.Provider value={{ user, signup, login, logout, updateProfile }}>{children}</Ctx.Provider>;
}
