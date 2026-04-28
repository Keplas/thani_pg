import { createContext, useContext, useState } from 'react';
import api from '../api/axios';
const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('thani_user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);
  const persist = (token, u) => { localStorage.setItem('thani_token', token); localStorage.setItem('thani_user', JSON.stringify(u)); setUser(u); };
  const login = async (email, password) => {
    setLoading(true);
    try { const { data } = await api.post('/auth/login', { email, password }); persist(data.token, data.user); return { success: true, role: data.user.role }; }
    catch (err) { return { success: false, message: err.response?.data?.message || 'Login failed' }; }
    finally { setLoading(false); }
  };
  const register = async (name, email, password, role) => {
    setLoading(true);
    try { const { data } = await api.post('/auth/register', { name, email, password, role }); persist(data.token, data.user); return { success: true, role: data.user.role }; }
    catch (err) { return { success: false, message: err.response?.data?.message || 'Registration failed' }; }
    finally { setLoading(false); }
  };
  const logout = () => { localStorage.clear(); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
