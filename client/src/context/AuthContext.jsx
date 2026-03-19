import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, getAdminMe } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token) { setLoading(false); return; }

    const fetchProfile = async () => {
      try {
        if (userType === 'admin') {
          const res = await getAdminMe();
          setAdmin(res.data);
        } else {
          const res = await getMe();
          setUser(res.data);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const loginAsUser = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', 'user');
    setUser(userData);
    setAdmin(null);
  };

  const loginAsAdmin = (token, adminData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', 'admin');
    setAdmin(adminData);
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUser(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ user, admin, loading, loginAsUser, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
