import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
        <BookOpen color="var(--primary)" />
        <span>Examify</span>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
