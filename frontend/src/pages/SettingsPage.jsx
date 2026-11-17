import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api/client';

function PrefRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid #f0f2f5' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: '#eef2ff', color: '#4f46e5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#8a94a6', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: value ? '#172033' : '#c4c9d4' }}>
          {value || 'Not set — complete your Assessment'}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile()
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (val) => {
    if (!val) return '';
    return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const fmtSalary = (min, max) => {
    if (!min && !max) return '';
    if (min && max) return `$${Number(min).toLocaleString()} – $${Number(max).toLocaleString()}`;
    if (min) return `From $${Number(min).toLocaleString()}`;
    return `Up to $${Number(max).toLocaleString()}`;
  };

  const fmtBool = (val) => {
    if (val === null || val === undefined || val === '') return '';
    return Number(val) === 1 ? 'Yes' : 'No';
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Your career preferences pulled from your latest assessment.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#8a94a6' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22 }}></i>
        </div>
      ) : (
        <>
          {/* ── Career Preferences ────────────────────────────── */}
          <section className="card formShell" style={{ marginBottom: 18 }}>
            <div className="formSection">
              <div className="sectionHeader">
                <div className="sectionIcon"><i className="fa-solid fa-sliders"></i></div>
                <div>
                  <h2>Career Preferences</h2>
                  <p className="muted">These values come from your latest assessment submission.</p>
                </div>
              </div>

              <PrefRow icon="fa-id-card"        label="Work authorization"   value={fmt(data?.work_authorization)} />
              <PrefRow icon="fa-file-contract"  label="Employment type"      value={fmt(data?.employmemt_type)} />
              <PrefRow icon="fa-laptop"         label="Work mode"            value={fmt(data?.work_mode)} />
              <PrefRow icon="fa-chart-simple"   label="Experience level"     value={fmt(data?.experience_level)} />
              <PrefRow icon="fa-dollar-sign"    label="Salary expectation"   value={fmtSalary(data?.salary_expectation_minimum, data?.salary_expectation_maximum)} />
              <PrefRow icon="fa-truck-moving"   label="Willing to relocate"  value={fmtBool(data?.willing_to_relocate)} />
              <PrefRow icon="fa-plane"          label="Willing to travel"    value={data?.willing_to_travel != null && data?.willing_to_travel !== '' ? `${data.willing_to_travel}%` : ''} />

              <div style={{ marginTop: 18 }}>
                <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }}></i>
                  To update these preferences, resubmit your Assessment.
                </p>
                <button className="btn btnPrimary" type="button" onClick={() => navigate('/assessment')} style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fa-solid fa-pen"></i> Go to Assessment
                </button>
              </div>
            </div>
          </section>

          {/* ── Account ───────────────────────────────────────── */}
          <section className="card formShell">
            <div className="formSection">
              <div className="sectionHeader">
                <div className="sectionIcon"><i className="fa-solid fa-gear"></i></div>
                <div>
                  <h2>Account</h2>
                  <p className="muted">Manage your profile and security settings.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <button className="btn" type="button" onClick={() => navigate('/profile')}
                  style={{ justifyContent: 'flex-start', gap: 10 }}>
                  <i className="fa-solid fa-user" style={{ width: 16 }}></i> Edit Profile
                </button>
                <button className="btn" type="button" onClick={() => navigate('/security')}
                  style={{ justifyContent: 'flex-start', gap: 10 }}>
                  <i className="fa-solid fa-shield-halved" style={{ width: 16 }}></i> Change Password
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
