import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zHeight: 1000, padding: '0.75rem 3rem' }}>
      <div 
        onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/student')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
      >
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1px', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Examify
        </span>
      </div>
      
      <div className="nav-links" style={{ gap: '1.5rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 1rem', background: 'rgba(15, 23, 42, 0.05)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
              <UserIcon size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
              <span className="badge" style={{ fontSize: '0.6rem', textTransform: 'uppercase', opacity: 0.8 }}>{user.role}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '10px' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1.5rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1.5rem' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
