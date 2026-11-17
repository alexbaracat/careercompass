import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { get } from '../api/client';
// health check no longer displayed — removed DB Connected pill

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.firstName || '';

  const [runs,  setRuns]  = useState(null);
  const [roles, setRoles] = useState(null);
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    // Assessment run count
    get('/assessment-runs')
      .then(rows => setRuns(rows.length))
      .catch(() => setRuns(0));

    // Preferred roles count
    get('/preferred-roles')
      .then(rows => setRoles(rows.length))
      .catch(() => setRoles(0));

    // Constraints summary
    get('/preference-constraints')
      .then(rows => setPrefs(rows[0] || null))
      .catch(() => setPrefs(null));
  }, []);

  const hasRuns = runs && runs > 0;

  const constraintItems = [
    { icon: 'fa-id-card',       title: 'Work authorization',  val: prefs?.work_authorization },
    { icon: 'fa-file-contract', title: 'Employment type',     val: prefs?.employmemt_type },
    { icon: 'fa-laptop',        title: 'Work mode',           val: prefs?.work_mode },
    { icon: 'fa-chart-simple',  title: 'Experience level',    val: prefs?.experience_level },
  ];

  return (
    <div>
      {/* ── Topbar ──────────────────────────────────────────── */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Career Readiness Dashboard</h1>
          <p className="page-sub">
            {firstName ? `Hello, ${firstName}. ` : ''}
            Measure your readiness, discover skill gaps, and get career guidance.
          </p>
        </div>
        <div className="top-actions" />
      </div>

      {/* ── Mini stats ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { label: 'Assessments Run', value: runs,  icon: 'fa-clipboard-check',      color: '#2563eb' },
          { label: 'Roles Analyzed',  value: roles, icon: 'fa-bullseye',             color: '#7c3aed' },
          { label: 'Skill Gaps',      value: '—',   icon: 'fa-triangle-exclamation', color: '#ea580c' },
          { label: 'Readiness Score', value: '—',   icon: 'fa-chart-line',           color: '#059669' },
        ].map(({ label, value, icon, color }) => (
          <div className="mini-card" key={label}>
            <div className="mini-top">
              <span className="mini-ic" style={{ background: `${color}18`, color }}>
                <i className={`fa-solid ${icon}`}></i>
              </span>
              <span className="mini-label">{label}</span>
            </div>
            <div className="metric-number">{value ?? '—'}</div>
            <div className="mini-sub">Total</div>
          </div>
        ))}
      </div>

      {/* ── Main panels ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'start' }}>

        {/* Left: empty state / start CTA */}
        <section className="card empty">
          {hasRuns ? (
            <>
              <div className="big">Assessment on record</div>
              <p className="muted">
                You have {runs} assessment run{runs > 1 ? 's' : ''} saved.
                Resubmit a new assessment any time to update your profile and get fresh results.
              </p>
            </>
          ) : (
            <>
              <div className="big">Start your first assessment</div>
              <p className="muted">
                Career Compass is a career decision support system designed to help you understand
                your current readiness, identify skill gaps, and discover the most suitable career
                paths based on your interests, experience, and goals. By completing a short
                assessment, the system analyzes your profile and provides personalised insights,
                target roles, and learning recommendations to guide your career development.
              </p>
            </>
          )}

          <div className="next-action-card">
            <div className="na-label">Next best action</div>
            <button className="btn btn-white na-btn" onClick={() => navigate('/assessment')}>
              <i className={`fa-solid ${hasRuns ? 'fa-pen' : 'fa-play'}`}></i>
              {hasRuns ? 'Update Assessment' : 'Start Assessment'}
            </button>
            <div className="na-sub">It guides your next career steps</div>
          </div>
        </section>

        {/* Right: constraints summary */}
        <section className="card constraints">
          <h3>Constraints summary</h3>
          {constraintItems.map(({ icon, title, val }) => (
            <div className="constraint-item" key={title}>
              <div className="c-ic"><i className={`fa-solid ${icon}`}></i></div>
              <div>
                <div className="c-title">{title}</div>
                <div className="c-sub">{val || 'Not set'}</div>
              </div>
            </div>
          ))}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
            onClick={() => navigate('/assessment')}
          >
            <i className="fa-solid fa-plus"></i> {hasRuns ? 'New Assessment' : 'Start Assessment'}
          </button>
        </section>

      </div>
    </div>
  );
}
