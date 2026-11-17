import { useState } from 'react';
import { changePassword } from '../api/client';

export default function SecurityPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [show,    setShow]    = useState({ cur: false, nw: false, cf: false });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleShow = k => setShow(s => ({ ...s, [k]: !s[k] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required.'); return;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.'); return;
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from your current password.'); return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const strengthScore = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)          score++;
    if (pw.length >= 12)         score++;
    if (/[A-Z]/.test(pw))        score++;
    if (/[0-9]/.test(pw))        score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = strengthScore(form.newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength] || '';
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength] || '';

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Security</h1>
          <p className="page-sub">Keep your account secure by using a strong, unique password.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <section className="card formShell" style={{ marginBottom: 18 }}>
          <div className="formSection">
            <div className="sectionHeader">
              <div className="sectionIcon"><i className="fa-solid fa-shield-halved"></i></div>
              <div>
                <h2>Change Password</h2>
                <p className="muted">Choose a strong password you don't use elsewhere.</p>
              </div>
            </div>

            {error   && (
              <div className="login-error" style={{ marginBottom: 14 }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}
            {success && (
              <div style={{ marginBottom: 14, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-circle-check"></i> {success}
              </div>
            )}

            <div className="grid2">
              {/* Current password */}
              <div className="field">
                <label>Current password <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="inputIcon with-toggle">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={show.cur ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={form.currentPassword}
                    onChange={setF('currentPassword')}
                    autoComplete="current-password"
                  />
                  <button type="button" className="pass-toggle" onClick={() => toggleShow('cur')}
                    aria-label={show.cur ? 'Hide password' : 'Show password'}>
                    <i className={`fa-solid ${show.cur ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Spacer */}
              <div />

              {/* New password */}
              <div className="field">
                <label>New password <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="inputIcon with-toggle">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={show.nw ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={form.newPassword}
                    onChange={setF('newPassword')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="pass-toggle" onClick={() => toggleShow('nw')}
                    aria-label={show.nw ? 'Hide password' : 'Show password'}>
                    <i className={`fa-solid ${show.nw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {/* Strength meter */}
                {form.newPassword && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength ? strengthColor : '#e5e7eb',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              {/* Confirm new password */}
              <div className="field">
                <label>Confirm new password <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="inputIcon with-toggle">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={show.cf ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={setF('confirmPassword')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="pass-toggle" onClick={() => toggleShow('cf')}
                    aria-label={show.cf ? 'Hide password' : 'Show password'}>
                    <i className={`fa-solid ${show.cf ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 5 }}>
                    <i className="fa-solid fa-circle-xmark"></i> Passwords do not match
                  </p>
                )}
                {form.confirmPassword && form.newPassword === form.confirmPassword && form.newPassword && (
                  <p style={{ color: '#22c55e', fontSize: 12, marginTop: 5 }}>
                    <i className="fa-solid fa-circle-check"></i> Passwords match
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <p className="muted" style={{ fontSize: 13 }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }}></i>
                Use at least 8 characters with uppercase letters, numbers, and symbols for a strong password.
              </p>
            </div>
          </div>
        </section>

        <div className="formFooter" style={{ padding: '0 0 8px' }}>
          <div />
          <button className="btn btnPrimary" type="submit" disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Updating…</>
              : <><i className="fa-solid fa-shield-halved"></i> Update Password</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
