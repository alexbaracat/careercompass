import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AvatarMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user
    ? ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
    : '?';

  const displayName = user
    ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email)
    : '';

  const go = (path) => { setOpen(false); navigate(path); };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="avatar-wrap" ref={ref}>
      <button
        className="avatar-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span className="avatar-circle">{initials}</span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} avatar-chevron`}></i>
      </button>

      {open && (
        <div className="avatar-dropdown">
          <div className="avatar-dropdown-header">
            <div className="avatar-circle lg">{initials}</div>
            <div>
              <div className="avatar-dd-name">{displayName}</div>
              <div className="avatar-dd-email">{user?.email}</div>
            </div>
          </div>

          <div className="avatar-dropdown-divider"></div>

          <button className="avatar-dd-item" onClick={() => go('/profile')}>
            <i className="fa-solid fa-user"></i> Profile
          </button>
          <button className="avatar-dd-item" onClick={() => go('/security')}>
            <i className="fa-solid fa-shield-halved"></i> Security
          </button>
          <button className="avatar-dd-item" onClick={() => go('/settings')}>
            <i className="fa-solid fa-gear"></i> Settings
          </button>

          <div className="avatar-dropdown-divider"></div>

          <button className="avatar-dd-item danger" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </button>
        </div>
      )}
    </div>
  );
}
