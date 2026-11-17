import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!firstName.trim()) { setError('First name is required.'); setLoading(false); return; }
        await register(email, password, firstName, lastName);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <img
            src="/assets/Project logo.png"
            alt="Career Compass"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <span>Career Compass</span>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p>{mode === 'login'
            ? 'Sign in to continue your career journey.'
            : 'Start your career readiness assessment today.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <i className="fa-solid fa-circle-exclamation"></i> {error}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {mode === 'register' && (
            <div className="grid2">
              <div className="field">
                <label>First name</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-user"></i>
                  <input
                    type="text" placeholder="Alex"
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    required autoComplete="given-name"
                  />
                </div>
              </div>
              <div className="field">
                <label>Last name</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-user"></i>
                  <input
                    type="text" placeholder="Smith"
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="field">
            <label>Email address</label>
            <div className="inputIcon">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="inputIcon with-toggle">
              <i className="fa-solid fa-lock"></i>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                <i className={showPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary login-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              : <><i className={mode === 'login' ? 'fa-solid fa-arrow-right-to-bracket' : 'fa-solid fa-user-plus'}></i>
                  {mode === 'login' ? 'Sign in' : 'Create account'}</>
            }
          </button>
        </form>

        {/* Toggle */}
        <div className="login-toggle">
          {mode === 'login'
            ? <>Don't have an account? <button type="button" onClick={() => { setMode('register'); setError(''); }}>Sign up</button></>
            : <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          }
        </div>

      </div>
    </div>
  );
}
