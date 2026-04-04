import { useNavigate } from 'react-router-dom'

export default function Navbar({ theme, toggleTheme, onLogout, isLoggedIn }) {
  const navigate = useNavigate()
  const username = sessionStorage.getItem('username') || ''

  return (
    <header className="navbar">
      <div className="navbar__brand">⚗️ Quantity Measurement</div>
      <div className="navbar__right">

        {isLoggedIn && (
          <span className="navbar__user">👤 {username}</span>
        )}

        <div className="navbar__theme-wrap">
          <span className="navbar__theme-lbl">{theme === 'dark' ? '🌙' : '☀️'}</span>
          <div className="navbar__theme-switch" onClick={toggleTheme} />
        </div>

        {isLoggedIn ? (
          <button className="navbar__logout" onClick={onLogout}>Sign Out</button>
        ) : (
          <button className="navbar__logout" onClick={() => navigate('/login')}>Sign In</button>
        )}

      </div>
    </header>
  )
}