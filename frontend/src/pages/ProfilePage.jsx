import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../api/client';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  'District of Columbia',
];

export default function ProfilePage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    firstName:   '',
    lastName:    '',
    dateOfBirth: '',
    phoneNumber: '',
    country:     'United States',
    state:       '',
    city:        '',
  });

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeSaved, setResumeSaved] = useState(false);

  // Pre-fill from DB on mount
  useEffect(() => {
    getUserProfile()
      .then(data => {
        setForm({
          firstName:   data.first_name   || '',
          lastName:    data.last_name    || '',
          dateOfBirth: data.date_of_birth || '',
          phoneNumber: data.phone_number  || '',
          country:     data.country       || 'United States',
          state:       data.state         || '',
          city:        data.city          || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.firstName.trim()) { setError('First name is required.'); return; }
    setSaving(true);
    try {
      await updateUserProfile(form);
      setSuccess('Profile saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    setResumeSaved(false);
    // Note: file storage not yet wired to backend — saved locally for now
    setTimeout(() => setResumeSaved(true), 400);
  };

  if (loading) {
    return (
      <div>
        <div className="topbar">
          <div><h1 className="page-title">Profile</h1></div>
        </div>
        <div style={{ padding: 40, textAlign: 'center', color: '#8a94a6' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22 }}></i>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-sub">Manage your personal information. Changes here update your account details.</p>
        </div>
      </div>

      <form onSubmit={handleSave} noValidate>

        {/* ── Personal Information ─────────────────────────────── */}
        <section className="card formShell" style={{ marginBottom: 18 }}>
          <div className="formSection">
            <div className="sectionHeader">
              <div className="sectionIcon"><i className="fa-solid fa-user"></i></div>
              <div>
                <h2>Personal Information</h2>
                <p className="muted">Your name, date of birth, and contact details.</p>
              </div>
            </div>

            {error   && <div className="login-error"   style={{ marginBottom: 14 }}><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
            {success && <div className="login-success" style={{ marginBottom: 14, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-circle-check"></i> {success}</div>}

            <div className="grid3">
              <div className="field">
                <label>First name <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="inputIcon">
                  <i className="fa-solid fa-user"></i>
                  <input type="text" placeholder="First name" value={form.firstName} onChange={setF('firstName')} />
                </div>
              </div>
              <div className="field">
                <label>Last name</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-user"></i>
                  <input type="text" placeholder="Last name" value={form.lastName} onChange={setF('lastName')} />
                </div>
              </div>
              <div className="field">
                <label>Date of birth</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-cake-candles"></i>
                  <input type="date" value={form.dateOfBirth} onChange={setF('dateOfBirth')} />
                </div>
              </div>
            </div>

            <div className="grid3">
              <div className="field">
                <label>Phone number</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-phone"></i>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={form.phoneNumber} onChange={setF('phoneNumber')} />
                </div>
              </div>
              <div className="field">
                <label>Email address</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-envelope"></i>
                  <input type="email" value={user?.email || ''} readOnly
                    style={{ background: '#f8f9fb', cursor: 'not-allowed', color: '#8a94a6' }} />
                </div>
              </div>
              <div className="field">
                <label>Country</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-globe"></i>
                  <input type="text" placeholder="Country" value={form.country} onChange={setF('country')} />
                </div>
              </div>
            </div>

            <div className="grid3">
              <div className="field">
                <label>State</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-map"></i>
                  <select value={form.state} onChange={setF('state')}>
                    <option value="">Select state</option>
                    {US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>City</label>
                <div className="inputIcon">
                  <i className="fa-solid fa-city"></i>
                  <input type="text" placeholder="City" value={form.city} onChange={setF('city')} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Resume Upload ────────────────────────────────────── */}
        <section className="card formShell" style={{ marginBottom: 18 }}>
          <div className="formSection">
            <div className="sectionHeader">
              <div className="sectionIcon"><i className="fa-solid fa-file-arrow-up"></i></div>
              <div>
                <h2>Resume</h2>
                <p className="muted">Upload your resume to strengthen future career analysis.</p>
              </div>
              <span className="sectionBadge optional">Optional</span>
            </div>

            <div className="grid2">
              <div className="field">
                <label>Upload resume</label>
                <label className="uploadBox" htmlFor="profileResumeInput">
                  <i className="fa-solid fa-file-arrow-up"></i>
                  <span className="uploadLabel">
                    {resumeFile
                      ? resumeFile.name
                      : 'Choose PDF, DOC, or DOCX'}
                  </span>
                  <input
                    id="profileResumeInput"
                    className="uploadInput"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                  />
                </label>
                {resumeSaved && (
                  <p style={{ color: '#22c55e', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="fa-solid fa-circle-check"></i> File selected
                  </p>
                )}
              </div>
              <div className="tipCard">
                <div className="tipTitle"><i className="fa-solid fa-circle-info"></i> Tip</div>
                <p>A resume helps the system cross-reference your experience and skills against target roles. PDF format is preferred.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="formFooter" style={{ padding: '0 0 8px' }}>
          <div />
          <button className="btn btnPrimary" type="submit" disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving…</>
              : <><i className="fa-solid fa-floppy-disk"></i> Save Profile</>
            }
          </button>
        </div>

      </form>
    </div>
  );
}
