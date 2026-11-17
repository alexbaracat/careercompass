import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiSelect from '../components/MultiSelect';
import { submitAssessment } from '../api/client';
import {
  US_STATES, INDUSTRIES, INDUSTRY_TARGET_ROLES, SKILL_CATEGORIES
} from '../data/assessmentData';

// ── Empty record factories ─────────────────────────────────────
const emptyEdu   = () => ({ degreeLevel:'', degreeName:'', major:'', institution:'', startYear:'', endYear:'', gpa:'', isCurrent:'' });
const emptyRole  = () => ({ industry:'', targetRole:'' });
const emptyLoc   = () => ({ state:'', city:'', priority:'' });
const emptySkill = () => ({ skillCategory:'', selectedSkills:[], skillRows:[] });
const emptyExp   = () => ({ employerName:'', jobTitle:'', employmentType:'', industry:'', startDate:'', endDate:'', isCurrent:'', skills:[] });
const emptyProj  = () => ({ projectTitle:'', projectIndustry:'', projectOrganization:'', projectStartDate:'', projectEndDate:'', skills:[], outcome:'', wordCount:0 });
const emptyCert  = () => ({ certificationName:'', issuingOrganization:'', issueDate:'', expirationDate:'' });
const emptyLang  = () => ({ languageName:'', languageProficiency:'' });

// ── Section header helper ──────────────────────────────────────
function SectionHeader({ icon, title, sub, optional, required }) {
  return (
    <div className="sectionHeader">
      <div className="sectionIcon"><i className={`fa-solid ${icon}`}></i></div>
      <div>
        <h2>{title}{required && <span style={{ color:'#ef4444', marginLeft:4 }}>*</span>}</h2>
        <p className="muted">{sub}</p>
      </div>
      {optional && <span className="sectionBadge optional">Optional</span>}
    </div>
  );
}

// ── Repeat block wrapper ───────────────────────────────────────
function SubCard({ title, onRemove, removable, children }) {
  return (
    <div className="subCard">
      <div className="subCardHead">
        <div className="subCardTitle">{title}</div>
        <button
          className="iconBtn danger"
          type="button"
          onClick={onRemove}
          style={{ visibility: removable ? 'visible' : 'hidden' }}
          tabIndex={removable ? 0 : -1}
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
      {children}
    </div>
  );
}

// ── Field + inputIcon wrapper helpers ─────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="field">
      <label>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function IconInput({ icon, children }) {
  return (
    <div className="inputIcon">
      <i className={`fa-solid ${icon}`}></i>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN ASSESSMENT COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Assessment() {
  const navigate = useNavigate();

  // ── Form state ───────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName:'', lastName:'', currentTitle:'',
    totalYearsExperience:'', currentStatus:'', primaryGoal:'',
    country:'United States', state:'', city:'',
    workAuthorization:'', preferredEmploymentType:'', workMode:'',
    salaryMin:'', salaryMax:'', experienceLevel:'',
    willingToRelocate:'', willingToTravel:'',
  });

  const [educations,     setEducations]     = useState([emptyEdu()]);
  const [targetRoles,    setTargetRoles]    = useState([emptyRole()]);
  const [locations,      setLocations]      = useState([emptyLoc()]);
  const [skillBlocks,    setSkillBlocks]    = useState([emptySkill()]);
  const [experiences,    setExperiences]    = useState([emptyExp()]);
  const [projects,       setProjects]       = useState([emptyProj()]);
  const [certifications, setCertifications] = useState([emptyCert()]);
  const [languages,      setLanguages]      = useState([emptyLang()]);
  const [resumeFile,     setResumeFile]     = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState('');
  const [submitted,      setSubmitted]      = useState(false);
  const [draftSaved,     setDraftSaved]     = useState(false);
  const draftTimer = useRef(null);

  const DRAFT_KEY = 'cq_assessment_draft';

  // ── Load draft on mount ───────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.form)           setForm(d.form);
      if (d.educations)     setEducations(d.educations);
      if (d.targetRoles)    setTargetRoles(d.targetRoles);
      if (d.locations)      setLocations(d.locations);
      if (d.skillBlocks)    setSkillBlocks(d.skillBlocks);
      if (d.experiences)    setExperiences(d.experiences);
      if (d.projects)       setProjects(d.projects);
      if (d.certifications) setCertifications(d.certifications);
      if (d.languages)      setLanguages(d.languages);
    } catch (_) {}
  }, []);

  // ── Save draft ────────────────────────────────────────────────
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        form, educations, targetRoles, locations,
        skillBlocks, experiences, projects, certifications, languages,
      }));
      setDraftSaved(true);
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => setDraftSaved(false), 2500);
    } catch (_) {}
  };

  // ── Generic form field setter ─────────────────────────────────
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // ── Array helpers ─────────────────────────────────────────────
  const addItem    = (setter, factory, max) => () => setter(a => a.length < max ? [...a, factory()] : a);
  const removeItem = (setter, idx)          => setter(a => a.filter((_, i) => i !== idx));
  const updateItem = (setter, idx, patch)   => setter(a => a.map((item, i) => i === idx ? { ...item, ...patch } : item));

  // ── Skill block helpers ───────────────────────────────────────
  const onSkillCategoryChange = (idx, category) => {
    setSkillBlocks(blocks => blocks.map((b, i) => i === idx
      ? { skillCategory: category, selectedSkills: [], skillRows: [] }
      : b
    ));
  };

  const onSkillsSelected = (idx, skills) => {
    setSkillBlocks(blocks => blocks.map((b, i) => {
      if (i !== idx) return b;
      const existingMap = {};
      b.skillRows.forEach(r => { existingMap[r.skillName] = r; });
      const skillRows = skills.map(name => existingMap[name] || { skillName: name, proficiencyLevel: '', confidenceLevel: '' });
      return { ...b, selectedSkills: skills, skillRows };
    }));
  };

  const updateSkillRow = (blockIdx, skillIdx, patch) => {
    setSkillBlocks(blocks => blocks.map((b, i) => {
      if (i !== blockIdx) return b;
      const skillRows = b.skillRows.map((r, j) => j === skillIdx ? { ...r, ...patch } : r);
      return { ...b, skillRows };
    }));
  };

  // ── Word count for project outcome ────────────────────────────
  const onProjectOutcome = (idx, val) => {
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > 200) return;
    updateItem(setProjects, idx, { outcome: val, wordCount: val.trim() ? words.length : 0 });
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validation
    if (!form.firstName.trim()) { setSubmitError('First name is required.'); return; }
    if (!targetRoles[0].targetRole) { setSubmitError('Please select at least 1 target role.'); return; }
    if (!locations[0].state || !locations[0].city || !locations[0].priority) {
      setSubmitError('Please complete at least Preferred Location 1 (state, city, and priority).'); return;
    }
    if (!skillBlocks[0].skillCategory || !skillBlocks[0].selectedSkills.length) {
      setSubmitError('Please select at least 1 skill category and at least 1 skill.'); return;
    }

    setSubmitting(true);
    try {
      await submitAssessment({
        form, educations, targetRoles, locations,
        skillBlocks, experiences, projects, certifications, languages,
      });
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div>
        <div className="topbar">
          <div>
            <h1 className="page-title">Assessment Complete</h1>
            <p className="page-sub">Your profile has been saved. Review your dashboard for next steps.</p>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 12px 28px rgba(34,197,94,.28)',
          }}>
            <i className="fa-solid fa-check" style={{ color: '#fff', fontSize: 28 }}></i>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#172033', marginBottom: 10 }}>
            Assessment submitted!
          </div>
          <p className="muted" style={{ maxWidth: 420, margin: '0 auto 28px' }}>
            Your career profile is saved. Head back to the dashboard to see your stats and start your career journey.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <i className="fa-solid fa-chart-line"></i> Go to Dashboard
            </button>
            <button className="btn" onClick={() => { setSubmitted(false); window.scrollTo({ top: 0 }); }}>
              <i className="fa-solid fa-pen"></i> Edit Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Topbar ───────────────────────────────────────────── */}
      <header className="topbar">
        <div>
          <h1 className="page-title">Assessment</h1>
          <p className="page-sub">Complete the form to generate your readiness score, role-fit analysis, and next-step learning plan.</p>
        </div>
        <div className="top-actions" />
      </header>

      {/* ── Submit error banner ──────────────────────────────── */}
      {submitError && (
        <div className="login-error" style={{ marginBottom: 16 }}>
          <i className="fa-solid fa-circle-exclamation"></i> {submitError}
        </div>
      )}

      {/* ── Form shell ───────────────────────────────────────── */}
      <section className="card formShell">
        <form id="assessmentForm" noValidate onSubmit={handleSubmit}>

          {/* ── 1. USER DETAILS ─────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-user-check" title="User Details"
              sub="Core profile details used as the base input for assessment analysis." />

            <div className="grid3">
              <Field label="First name" required>
                <IconInput icon="fa-user">
                  <input type="text" placeholder="Enter first name" value={form.firstName} onChange={setF('firstName')} required />
                </IconInput>
              </Field>
              <Field label="Last name">
                <IconInput icon="fa-user">
                  <input type="text" placeholder="Enter last name" value={form.lastName} onChange={setF('lastName')} required />
                </IconInput>
              </Field>
              <Field label="Current title">
                <IconInput icon="fa-briefcase">
                  <input type="text" placeholder="Example: Graduate Student / Data Analyst Intern" value={form.currentTitle} onChange={setF('currentTitle')} />
                </IconInput>
              </Field>
            </div>

            <div className="grid3">
              <Field label="Total years of experience">
                <IconInput icon="fa-chart-line">
                  <select value={form.totalYearsExperience} onChange={setF('totalYearsExperience')} required>
                    <option value="">Select years</option>
                    {['0','1','2','3','4','5','6','7','8','9','10+'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </IconInput>
              </Field>
              <Field label="Current status">
                <IconInput icon="fa-user-graduate">
                  <select value={form.currentStatus} onChange={setF('currentStatus')} required>
                    <option value="">Select one</option>
                    <option>Student (Undergraduate)</option>
                    <option>Student (Graduate)</option>
                    <option>Recent graduate</option>
                    <option>Employed</option>
                    <option>Seeking opportunities</option>
                    <option>Career switcher</option>
                  </select>
                </IconInput>
              </Field>
              <Field label="Primary goal">
                <IconInput icon="fa-bullseye">
                  <select value={form.primaryGoal} onChange={setF('primaryGoal')}>
                    <option value="">Select one</option>
                    <option>Internship</option>
                    <option>Full-time</option>
                    <option>Role switch</option>
                    <option>Interview preparation</option>
                    <option>Upskill / roadmap</option>
                  </select>
                </IconInput>
              </Field>
            </div>

            <div className="grid3">
              <Field label="Country">
                <IconInput icon="fa-earth-americas">
                  <input type="text" value="United States" readOnly />
                </IconInput>
              </Field>
              <Field label="State">
                <IconInput icon="fa-map">
                  <select value={form.state} onChange={setF('state')} required>
                    <option value="">Select a state</option>
                    {US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </IconInput>
              </Field>
              <Field label="City">
                <IconInput icon="fa-location-dot">
                  <input type="text" placeholder="Enter city" value={form.city} onChange={setF('city')} required />
                </IconInput>
              </Field>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 2. EDUCATION ────────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-building-columns" title="Education Details"
              sub="Latest education is shown first. You can add up to 2 more education records." />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {educations.map((edu, idx) => (
                  <SubCard
                    key={idx}
                    title={idx === 0 ? 'Latest Education' : `Education ${idx + 1}`}
                    removable={idx > 0}
                    onRemove={() => removeItem(setEducations, idx)}
                  >
                    <div className="grid3">
                      <Field label="Degree level">
                        <IconInput icon="fa-graduation-cap">
                          <select value={edu.degreeLevel} onChange={e => updateItem(setEducations, idx, { degreeLevel: e.target.value })} required>
                            <option value="">Select degree level</option>
                            <option>Associate</option><option>Bachelor's</option>
                            <option>Master's</option><option>Doctorate</option>
                            <option>Diploma / Certificate</option>
                          </select>
                        </IconInput>
                      </Field>
                      <Field label="Degree name">
                        <IconInput icon="fa-scroll">
                          <input type="text" placeholder="Example: MS in ISTM" value={edu.degreeName}
                            onChange={e => updateItem(setEducations, idx, { degreeName: e.target.value })} required />
                        </IconInput>
                      </Field>
                      <Field label="Major">
                        <IconInput icon="fa-book-open">
                          <input type="text" placeholder="Enter major" value={edu.major}
                            onChange={e => updateItem(setEducations, idx, { major: e.target.value })} required />
                        </IconInput>
                      </Field>
                    </div>
                    <div className="grid3">
                      <Field label="Institution">
                        <IconInput icon="fa-school">
                          <input type="text" placeholder="University / College name" value={edu.institution}
                            onChange={e => updateItem(setEducations, idx, { institution: e.target.value })} required />
                        </IconInput>
                      </Field>
                      <Field label="Start year">
                        <IconInput icon="fa-calendar">
                          <input type="number" placeholder="2024" value={edu.startYear}
                            onChange={e => updateItem(setEducations, idx, { startYear: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="End year">
                        <IconInput icon="fa-calendar-check">
                          <input type="number" placeholder="2026" value={edu.endYear}
                            onChange={e => updateItem(setEducations, idx, { endYear: e.target.value })} />
                        </IconInput>
                      </Field>
                    </div>
                    <div className="grid2">
                      <Field label="GPA">
                        <IconInput icon="fa-star">
                          <input type="text" placeholder="Example: 3.8 / 4.0" value={edu.gpa}
                            onChange={e => updateItem(setEducations, idx, { gpa: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Is this your current education?">
                        <div className="toggleGroup">
                          {['Yes','No'].map(v => (
                            <label key={v} className="toggleChip">
                              <input type="radio" name={`isCurrEdu_${idx}`} value={v}
                                checked={edu.isCurrent === v}
                                onChange={() => updateItem(setEducations, idx, { isCurrent: v })} /> {v}
                            </label>
                          ))}
                        </div>
                      </Field>
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setEducations, emptyEdu, 3)}
                disabled={educations.length >= 3}>
                <i className="fa-solid fa-plus"></i> Add another education
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 3. TARGET ROLES ─────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-bullseye" title="Target Roles" required
              sub="Select at least 1 role. You can add up to 3 target roles." />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {targetRoles.map((role, idx) => (
                  <SubCard
                    key={idx}
                    title={`Target Role ${idx + 1}`}
                    removable={idx > 0}
                    onRemove={() => removeItem(setTargetRoles, idx)}
                  >
                    <div className="grid2">
                      <Field label="Industry" required={idx === 0}>
                        <IconInput icon="fa-industry">
                          <select value={role.industry}
                            onChange={e => updateItem(setTargetRoles, idx, { industry: e.target.value, targetRole: '' })}
                            required>
                            <option value="">Select industry</option>
                            {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
                          </select>
                        </IconInput>
                      </Field>
                      <Field label="Target role" required={idx === 0}>
                        <IconInput icon="fa-bullseye">
                          <select value={role.targetRole}
                            onChange={e => updateItem(setTargetRoles, idx, { targetRole: e.target.value })}
                            required disabled={!role.industry}>
                            <option value="">Select role</option>
                            {(INDUSTRY_TARGET_ROLES[role.industry] || []).map(r => <option key={r}>{r}</option>)}
                          </select>
                        </IconInput>
                      </Field>
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setTargetRoles, emptyRole, 3)}
                disabled={targetRoles.length >= 3}>
                <i className="fa-solid fa-plus"></i> Add another target role
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 4. CONSTRAINTS ──────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-sliders" title="Constraints & Work Preferences"
              sub="These preferences help the system create realistic role-fit results." />

            <div className="grid3">
              <Field label="Work authorization">
                <IconInput icon="fa-id-card">
                  <select value={form.workAuthorization} onChange={setF('workAuthorization')} required>
                    <option value="">Select one</option>
                    <option>U.S. Citizen</option><option>Permanent Resident</option>
                    <option>Student (CPT/OPT)</option><option>Need sponsorship</option>
                    <option>Other work authorization</option>
                  </select>
                </IconInput>
              </Field>
              <Field label="Preferred employment type">
                <IconInput icon="fa-suitcase">
                  <select value={form.preferredEmploymentType} onChange={setF('preferredEmploymentType')} required>
                    <option value="">Select type</option>
                    <option>Internship</option><option>Part-time</option>
                    <option>Full-time</option><option>Contract</option>
                  </select>
                </IconInput>
              </Field>
              <Field label="Work mode">
                <IconInput icon="fa-laptop">
                  <select value={form.workMode} onChange={setF('workMode')} required>
                    <option value="">Select mode</option>
                    <option>Remote</option><option>Hybrid</option>
                    <option>On-site</option><option>Flexible</option>
                  </select>
                </IconInput>
              </Field>
            </div>

            <div className="grid3">
              <Field label="Salary expectation min">
                <IconInput icon="fa-dollar-sign">
                  <input type="number" placeholder="60000" value={form.salaryMin} onChange={setF('salaryMin')} />
                </IconInput>
              </Field>
              <Field label="Salary expectation max">
                <IconInput icon="fa-dollar-sign">
                  <input type="number" placeholder="90000" value={form.salaryMax} onChange={setF('salaryMax')} />
                </IconInput>
              </Field>
              <Field label="Experience level">
                <IconInput icon="fa-chart-simple">
                  <select value={form.experienceLevel} onChange={setF('experienceLevel')} required>
                    <option value="">Select level</option>
                    <option>Entry Level</option><option>Early Career</option>
                    <option>Mid Level</option><option>Experienced</option>
                  </select>
                </IconInput>
              </Field>
            </div>

            <div className="grid2">
              <Field label="Willing to relocate?">
                <div className="toggleGroup">
                  {['Yes','No'].map(v => (
                    <label key={v} className="toggleChip">
                      <input type="radio" name="willingToRelocate" value={v}
                        checked={form.willingToRelocate === v}
                        onChange={setF('willingToRelocate')} /> {v}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Willing to travel?">
                <div className="toggleGroup">
                  {['Yes','No'].map(v => (
                    <label key={v} className="toggleChip">
                      <input type="radio" name="willingToTravel" value={v}
                        checked={form.willingToTravel === v}
                        onChange={setF('willingToTravel')} /> {v}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 5. LOCATION PREFERENCES ─────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-location-dot" title="Location Preferences" required
              sub="At least 1 preferred location is required. You can add up to 5 locations." />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {locations.map((loc, idx) => (
                  <SubCard
                    key={idx}
                    title={idx === 0 ? 'Preferred Location 1' : `Preferred Location ${idx + 1}`}
                    removable={idx > 0}
                    onRemove={() => removeItem(setLocations, idx)}
                  >
                    <div className="miniMuted">{idx === 0 ? 'Required location preference.' : 'Optional location preference.'}</div>
                    <div className="grid3">
                      <Field label="State" required={idx === 0}>
                        <IconInput icon="fa-map-pin">
                          <select value={loc.state}
                            onChange={e => updateItem(setLocations, idx, { state: e.target.value })}
                            required={idx === 0}>
                            <option value="">Select a state</option>
                            {US_STATES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </IconInput>
                      </Field>
                      <Field label="City" required={idx === 0}>
                        <IconInput icon="fa-location-dot">
                          <input type="text" placeholder="City" value={loc.city}
                            onChange={e => updateItem(setLocations, idx, { city: e.target.value })}
                            required={idx === 0} />
                        </IconInput>
                      </Field>
                      <Field label="Priority" required={idx === 0}>
                        <IconInput icon="fa-ranking-star">
                          <select value={loc.priority}
                            onChange={e => updateItem(setLocations, idx, { priority: e.target.value })}
                            required={idx === 0}>
                            <option value="">Select priority</option>
                            {['1','2','3','4','5'].map(p => <option key={p}>{p}</option>)}
                          </select>
                        </IconInput>
                      </Field>
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setLocations, emptyLoc, 5)}
                disabled={locations.length >= 5}>
                <i className="fa-solid fa-plus"></i> Add another location
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 6. SKILLS ───────────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-code" title="Skills" required
              sub="Select one or more skill categories. Each selected skill will get its own proficiency and confidence fields." />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {skillBlocks.map((block, bIdx) => (
                  <SubCard
                    key={bIdx}
                    title={`Skill Category ${bIdx + 1}`}
                    removable={bIdx > 0}
                    onRemove={() => removeItem(setSkillBlocks, bIdx)}
                  >
                    <div className="skillCategoryCard">
                      <div className="grid2">
                        <Field label="Skill category" required={bIdx === 0}>
                          <IconInput icon="fa-layer-group">
                            <select value={block.skillCategory}
                              onChange={e => onSkillCategoryChange(bIdx, e.target.value)}
                              required>
                              <option value="">Select category</option>
                              {Object.keys(SKILL_CATEGORIES).map(cat => <option key={cat}>{cat}</option>)}
                            </select>
                          </IconInput>
                        </Field>
                        <Field label="Skills in this category" required={bIdx === 0}>
                          <MultiSelect
                            options={SKILL_CATEGORIES[block.skillCategory] || []}
                            selected={block.selectedSkills}
                            onChange={skills => onSkillsSelected(bIdx, skills)}
                            max={25}
                            placeholder="Select skills"
                          />
                        </Field>
                      </div>

                      {block.skillRows.length > 0 && (
                        <div className="generatedSkillRows">
                          {block.skillRows.map((row, sIdx) => (
                            <div key={row.skillName} className="generatedSkillRow">
                              <div className="generatedSkillName">{row.skillName}</div>
                              <Field label="Proficiency">
                                <IconInput icon="fa-signal">
                                  <select value={row.proficiencyLevel}
                                    onChange={e => updateSkillRow(bIdx, sIdx, { proficiencyLevel: e.target.value })}>
                                    <option value="">Select level</option>
                                    <option>1 - Beginner</option><option>2 - Basic</option>
                                    <option>3 - Intermediate</option><option>4 - Advanced</option>
                                    <option>5 - Strong</option>
                                  </select>
                                </IconInput>
                              </Field>
                              <Field label="Confidence">
                                <IconInput icon="fa-chart-line">
                                  <select value={row.confidenceLevel}
                                    onChange={e => updateSkillRow(bIdx, sIdx, { confidenceLevel: e.target.value })}>
                                    <option value="">Select confidence</option>
                                    <option>1 - Low</option><option>2 - Emerging</option>
                                    <option>3 - Moderate</option><option>4 - High</option>
                                    <option>5 - Very High</option>
                                  </select>
                                </IconInput>
                              </Field>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setSkillBlocks, emptySkill, 12)}
                disabled={skillBlocks.length >= 12}>
                <i className="fa-solid fa-plus"></i> Add another skill category
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 7. EXPERIENCE ───────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-briefcase" title="Experience"
              sub="Optional section. Add your latest experience first, then up to 2 more if needed."
              optional />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {experiences.map((exp, idx) => (
                  <SubCard
                    key={idx}
                    title={idx === 0 ? 'Latest Experience' : `Experience ${idx + 1}`}
                    removable={idx > 0}
                    onRemove={() => removeItem(setExperiences, idx)}
                  >
                    <div className="grid3">
                      <Field label="Employer name">
                        <IconInput icon="fa-building">
                          <input type="text" placeholder="Organization name" value={exp.employerName}
                            onChange={e => updateItem(setExperiences, idx, { employerName: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Job title">
                        <IconInput icon="fa-user-tie">
                          <input type="text" placeholder="Enter role title" value={exp.jobTitle}
                            onChange={e => updateItem(setExperiences, idx, { jobTitle: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Employment type">
                        <IconInput icon="fa-suitcase">
                          <select value={exp.employmentType}
                            onChange={e => updateItem(setExperiences, idx, { employmentType: e.target.value })}>
                            <option value="">Select type</option>
                            <option>Internship</option><option>Part-time</option>
                            <option>Full-time</option><option>Contract</option>
                            <option>Graduate Assistantship</option>
                            <option>Research Assistantship</option><option>Volunteer</option>
                          </select>
                        </IconInput>
                      </Field>
                    </div>
                    <div className="grid3">
                      <Field label="Industry">
                        <IconInput icon="fa-industry">
                          <select value={exp.industry}
                            onChange={e => updateItem(setExperiences, idx, { industry: e.target.value })}>
                            <option value="">Select industry</option>
                            {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
                          </select>
                        </IconInput>
                      </Field>
                      <Field label="Start date">
                        <IconInput icon="fa-calendar">
                          <input type="month" value={exp.startDate}
                            onChange={e => updateItem(setExperiences, idx, { startDate: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="End date">
                        <IconInput icon="fa-calendar-check">
                          <input type="month" value={exp.endDate}
                            onChange={e => updateItem(setExperiences, idx, { endDate: e.target.value })} />
                        </IconInput>
                      </Field>
                    </div>
                    <div className="grid2">
                      <Field label="Is this your current role?">
                        <div className="toggleGroup">
                          {['Yes','No'].map(v => (
                            <label key={v} className="toggleChip">
                              <input type="radio" name={`isCurrExp_${idx}`} value={v}
                                checked={exp.isCurrent === v}
                                onChange={() => updateItem(setExperiences, idx, { isCurrent: v })} /> {v}
                            </label>
                          ))}
                        </div>
                      </Field>
                      <Field label="Skills used in this experience">
                        <MultiSelect
                          options={Object.values(SKILL_CATEGORIES).flat().filter((v,i,a)=>a.indexOf(v)===i)}
                          selected={exp.skills}
                          onChange={skills => updateItem(setExperiences, idx, { skills })}
                          max={10}
                          placeholder="Select options"
                        />
                      </Field>
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setExperiences, emptyExp, 3)}
                disabled={experiences.length >= 3}>
                <i className="fa-solid fa-plus"></i> Add another experience
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 8. PROJECTS ─────────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-folder-open" title="Projects"
              sub="Related projects to your target role. You can add up to 3 in total."
              optional />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {projects.map((proj, idx) => (
                  <SubCard
                    key={idx}
                    title={`Related Project ${idx + 1}`}
                    removable={idx > 0}
                    onRemove={() => removeItem(setProjects, idx)}
                  >
                    <div className="grid3">
                      <Field label="Project title">
                        <IconInput icon="fa-diagram-project">
                          <input type="text" placeholder="Enter project title" value={proj.projectTitle}
                            onChange={e => updateItem(setProjects, idx, { projectTitle: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Industry">
                        <IconInput icon="fa-industry">
                          <select value={proj.projectIndustry}
                            onChange={e => updateItem(setProjects, idx, { projectIndustry: e.target.value })}>
                            <option value="">Select industry</option>
                            {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
                          </select>
                        </IconInput>
                      </Field>
                      <Field label="Organization name">
                        <IconInput icon="fa-building">
                          <input type="text" placeholder="University / Company / Team" value={proj.projectOrganization}
                            onChange={e => updateItem(setProjects, idx, { projectOrganization: e.target.value })} />
                        </IconInput>
                      </Field>
                    </div>
                    <div className="grid3">
                      <Field label="Start date">
                        <IconInput icon="fa-calendar">
                          <input type="month" value={proj.projectStartDate}
                            onChange={e => updateItem(setProjects, idx, { projectStartDate: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="End date">
                        <IconInput icon="fa-calendar-check">
                          <input type="month" value={proj.projectEndDate}
                            onChange={e => updateItem(setProjects, idx, { projectEndDate: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Skills used in this project">
                        <MultiSelect
                          options={Object.values(SKILL_CATEGORIES).flat().filter((v,i,a)=>a.indexOf(v)===i)}
                          selected={proj.skills}
                          onChange={skills => updateItem(setProjects, idx, { skills })}
                          max={12}
                          placeholder="Select options"
                        />
                      </Field>
                    </div>
                    <div className="grid1">
                      <Field label={<>Project outcome <span className="miniMuted">(Max 200 words)</span></>}>
                        <textarea
                          className="textArea"
                          placeholder="Mention final result, impact, or deliverable"
                          value={proj.outcome}
                          onChange={e => onProjectOutcome(idx, e.target.value)}
                        />
                        <div className="countLabel">{proj.wordCount} / 200 words</div>
                      </Field>
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setProjects, emptyProj, 3)}
                disabled={projects.length >= 3}>
                <i className="fa-solid fa-plus"></i> Add another project
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 9. CERTIFICATIONS ───────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-award" title="Certifications"
              sub="Related certifications to your target role. You can add up to 3 in total."
              optional />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {certifications.map((cert, idx) => (
                  <SubCard
                    key={idx}
                    title={`Related Certification ${idx + 1}`}
                    removable={idx > 0}
                    onRemove={() => removeItem(setCertifications, idx)}
                  >
                    <div className="grid2">
                      <Field label="Certification name">
                        <IconInput icon="fa-award">
                          <input type="text" placeholder="Example: AWS Cloud Practitioner" value={cert.certificationName}
                            onChange={e => updateItem(setCertifications, idx, { certificationName: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Issuing organization">
                        <IconInput icon="fa-certificate">
                          <input type="text" placeholder="AWS / Microsoft / Google" value={cert.issuingOrganization}
                            onChange={e => updateItem(setCertifications, idx, { issuingOrganization: e.target.value })} />
                        </IconInput>
                      </Field>
                    </div>
                    <div className="grid2">
                      <Field label="Issue date">
                        <IconInput icon="fa-calendar">
                          <input type="month" value={cert.issueDate}
                            onChange={e => updateItem(setCertifications, idx, { issueDate: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Expiration date">
                        <IconInput icon="fa-calendar-check">
                          <input type="month" value={cert.expirationDate}
                            onChange={e => updateItem(setCertifications, idx, { expirationDate: e.target.value })} />
                        </IconInput>
                      </Field>
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setCertifications, emptyCert, 3)}
                disabled={certifications.length >= 3}>
                <i className="fa-solid fa-plus"></i> Add another certification
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 10. LANGUAGE ────────────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-language" title="Language Preference"
              sub="Optional section. Add languages if relevant."
              optional />

            <div className="repeatWrap">
              <div className="repeatContainer">
                {languages.map((lang, idx) => (
                  <SubCard
                    key={idx}
                    title={`Language ${idx + 1}`}
                    removable={idx > 0}
                    onRemove={() => removeItem(setLanguages, idx)}
                  >
                    <div className="grid2">
                      <Field label="Language">
                        <IconInput icon="fa-language">
                          <input type="text" placeholder="Example: English" value={lang.languageName}
                            onChange={e => updateItem(setLanguages, idx, { languageName: e.target.value })} />
                        </IconInput>
                      </Field>
                      <Field label="Proficiency">
                        <IconInput icon="fa-signal">
                          <select value={lang.languageProficiency}
                            onChange={e => updateItem(setLanguages, idx, { languageProficiency: e.target.value })}>
                            <option value="">Select level</option>
                            <option>Basic</option><option>Intermediate</option>
                            <option>Advanced</option><option>Native / Fluent</option>
                          </select>
                        </IconInput>
                      </Field>
                    </div>
                  </SubCard>
                ))}
              </div>
              <button className="addBtn" type="button"
                onClick={addItem(setLanguages, emptyLang, 10)}>
                <i className="fa-solid fa-plus"></i> Add another language
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* ── 11. RESUME UPLOAD ───────────────────────────── */}
          <div className="formSection">
            <SectionHeader icon="fa-file-arrow-up" title="Resume Upload"
              sub="Optional but recommended for stronger future analysis."
              optional />

            <div className="grid2">
              <div className="field">
                <label>Upload resume</label>
                <label className="uploadBox" htmlFor="resumeInput">
                  <i className="fa-solid fa-file-arrow-up"></i>
                  <span className="uploadLabel">
                    {resumeFile ? resumeFile.name : 'Choose file'}
                  </span>
                  <input
                    id="resumeInput"
                    className="uploadInput"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files[0] || null)}
                  />
                </label>
              </div>

              <div className="tipCard">
                <div className="tipTitle"><i className="fa-solid fa-circle-info"></i> Assessment note</div>
                <p>Required sections are enough to generate results. Optional sections improve the quality of the recommendation and analysis.</p>
              </div>
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────── */}
          <div className="formFooter">
            <button className="btn" type="button" onClick={() => navigate('/')}>
              <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {draftSaved && (
                <span style={{ fontSize: 13, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="fa-solid fa-circle-check"></i> Draft saved
                </span>
              )}
              <button className="btn" type="button" onClick={saveDraft}>
                <i className="fa-solid fa-floppy-disk"></i> Save Draft
              </button>
              <button className="btn btnPrimary" type="submit" disabled={submitting}>
                {submitting
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting…</>
                  : <><i className="fa-solid fa-wand-magic-sparkles"></i> Submit Assessment</>
                }
              </button>
            </div>
          </div>

        </form>
      </section>
    </div>
  );
}
