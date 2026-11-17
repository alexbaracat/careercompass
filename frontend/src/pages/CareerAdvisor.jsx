import { useNavigate } from 'react-router-dom';

export default function CareerAdvisor() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Career Advisor</h1>
          <p className="page-sub">Get personalised career guidance powered by AI.</p>
        </div>
      </div>
      <div className="card empty" style={{ textAlign:'center', padding:'60px 32px' }}>
        <i className="fa-solid fa-comments" style={{ fontSize:48, color:'#c7dbff', marginBottom:16, display:'block' }}></i>
        <div className="big">Career Advisor</div>
        <p className="muted" style={{ maxWidth:440, margin:'12px auto 24px' }}>
          Your AI career advisor is coming soon. It will help you navigate career decisions, prepare for interviews, and plan your growth path.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/assessment')}>
          <i className="fa-solid fa-clipboard-check"></i> Start Assessment First
        </button>
      </div>
    </div>
  );
}
