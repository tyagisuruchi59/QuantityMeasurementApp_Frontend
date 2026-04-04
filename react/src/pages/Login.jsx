import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { login, signup } from '../services/api'
import '../styles/main.css'

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab]       = useState('login')
  const [alert, setAlert]   = useState({ msg: '', type: '' })
  const [showPw, setShowPw] = useState(false)

  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' })
  const [loginData, setLoginData]   = useState({ email: '', password: '' })
  const [errors, setErrors]         = useState({})

  const showAlert = (msg, type) => setAlert({ msg, type })

  const saveSession = (data) => {
    sessionStorage.setItem('accessToken',  data.accessToken)
    sessionStorage.setItem('refreshToken', data.refreshToken)
    sessionStorage.setItem('username',     data.username)
    sessionStorage.setItem('email',        data.email)
    const returnTo = sessionStorage.getItem('returnTo') || '/dashboard'
    sessionStorage.removeItem('returnTo')
    navigate(returnTo)
  }

  const handleSignup = () => {
    const errs = {}
    if (signupData.username.length < 3) errs.signupName = 'Min 3 characters'
    if (!signupData.email.includes('@')) errs.signupEmail = 'Valid email required'
    if (signupData.password.length < 8) errs.signupPw = 'Min 8 characters'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    signup(signupData)
      .then(() => {
        showAlert('✅ Account created! Please login.', 'success')
        setSignupData({ username: '', email: '', password: '' })
        setTimeout(() => setTab('login'), 1500)
      })
      .catch(err => {
        showAlert('❌ ' + (err.response?.data?.message || 'Signup failed'), 'error')
      })
  }

  const handleLogin = () => {
    const errs = {}
    if (!loginData.email.includes('@')) errs.loginEmail = 'Valid email required'
    if (!loginData.password) errs.loginPw = 'Password required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    login(loginData)
      .then(res => {
        const data = res.data?.data || res.data
        saveSession(data)
      })
      .catch(err => {
        showAlert('❌ ' + (err.response?.data?.message || 'Invalid credentials'), 'error')
      })
  }

  const handleGoogleSuccess = (credentialResponse) => {
    const base64Url = credentialResponse.credential.split('.')[1]
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload   = JSON.parse(window.atob(base64))

    import('../services/api').then(({ default: api }) => {
      api.post('/auth/google', { token: credentialResponse.credential })
        .then(res => {
          const data = res.data?.data || res.data
          saveSession(data)
        })
        .catch(() => {
          sessionStorage.setItem('accessToken',  credentialResponse.credential)
          sessionStorage.setItem('refreshToken', credentialResponse.credential)
          sessionStorage.setItem('username',     payload.name || payload.email)
          sessionStorage.setItem('email',        payload.email)
          sessionStorage.setItem('isGoogleUser', 'true')
          const returnTo = sessionStorage.getItem('returnTo') || '/dashboard'
          sessionStorage.removeItem('returnTo')
          navigate(returnTo)
        })
    })
  }

  const handleGoogleError = () => {
    showAlert('❌ Google login failed. Try again.', 'error')
  }

  return (
    <div className="login-page">
      <div className="login-page__bg" />
      <div className="login-page__wrapper">

        {/* Left Panel */}
        <div className="login-page__left">
          <div className="login-page__logo-ring">
            <div className="login-page__logo-inner">⚗️</div>
          </div>
          <div className="login-page__brand">Quantity Measurement</div>
          <div className="login-page__tagline">Convert, Compare & Calculate units with ease</div>
          <div className="login-page__features">
            <div className="login-page__feat"><span className="dot" />Length, Weight, Volume</div>
            <div className="login-page__feat"><span className="dot" />Temperature Units</div>
            <div className="login-page__feat"><span className="dot" />Full History Tracking</div>
            <div className="login-page__feat"><span className="dot" />Secure JWT Auth</div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-page__right">
          <div className="login-page__tabs">
            <button
              className={`login-page__tab ${tab === 'login' ? 'login-page__tab--active' : ''}`}
              onClick={() => { setTab('login'); setAlert({ msg: '', type: '' }) }}
            >LOGIN</button>
            <button
              className={`login-page__tab ${tab === 'signup' ? 'login-page__tab--active' : ''}`}
              onClick={() => { setTab('signup'); setAlert({ msg: '', type: '' }) }}
            >SIGNUP</button>
          </div>

          {alert.msg && (
            <div className={`login-page__alert login-page__alert--${alert.type}`}>
              {alert.msg}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <div className="login-page__form">
              <div className="login-page__field">
                <label className="login-page__label">Email</label>
                <input
                  className="login-page__input"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                />
                {errors.loginEmail && <div className="login-page__error">{errors.loginEmail}</div>}
              </div>
              <div className="login-page__field">
                <label className="login-page__label">Password</label>
                <div className="login-page__input-wrap">
                  <input
                    className="login-page__input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  />
                  <button className="login-page__eye" onClick={() => setShowPw(!showPw)}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.loginPw && <div className="login-page__error">{errors.loginPw}</div>}
              </div>
              <button className="login-page__btn" onClick={handleLogin}>Login</button>
              <div className="login-page__divider"><span>or continue with</span></div>
              <div className="login-page__google">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  width="100%"
                  theme="filled_black"
                  shape="rectangular"
                  text="signin_with"
                />
              </div>
            </div>
          )}

          {/* SIGNUP FORM */}
          {tab === 'signup' && (
            <div className="login-page__form">
              <div className="login-page__field">
                <label className="login-page__label">Full Name</label>
                <input
                  className="login-page__input"
                  type="text"
                  placeholder="Enter your username"
                  value={signupData.username}
                  onChange={e => setSignupData({ ...signupData, username: e.target.value })}
                />
                {errors.signupName && <div className="login-page__error">{errors.signupName}</div>}
              </div>
              <div className="login-page__field">
                <label className="login-page__label">Email</label>
                <input
                  className="login-page__input"
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                />
                {errors.signupEmail && <div className="login-page__error">{errors.signupEmail}</div>}
              </div>
              <div className="login-page__field">
                <label className="login-page__label">Password</label>
                <div className="login-page__input-wrap">
                  <input
                    className="login-page__input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={signupData.password}
                    onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                  />
                  <button className="login-page__eye" onClick={() => setShowPw(!showPw)}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.signupPw && <div className="login-page__error">{errors.signupPw}</div>}
              </div>
              <button className="login-page__btn" onClick={handleSignup}>Signup</button>
              <div className="login-page__divider"><span>or continue with</span></div>
              <div className="login-page__google">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  width="100%"
                  theme="filled_black"
                  shape="rectangular"
                  text="signup_with"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}