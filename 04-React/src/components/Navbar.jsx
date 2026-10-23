import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="RailGo home">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span>Rail<span>Go</span></span>
        </Link>
        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <button className="nav-logout" type="button" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link className="button button--small" to="/signup">Create account</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
