import { useNavigate } from 'react-router-dom';

export default function MockInterview() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="page-title">Mock Interview</h1>
          <p className="page-sub">Practice your interview skills with AI-powered simulations.</p>
        </div>
      </div>
      <div className="card empty" style={{ textAlign:'center', padding:'60px 32px' }}>
        <i className="fa-solid fa-microphone-lines" style={{ fontSize:48, color:'#c7dbff', marginBottom:16, display:'block' }}></i>
        <div className="big">Mock Interview</div>
        <p className="muted" style={{ maxWidth:440, margin:'12px auto 24px' }}>
          AI-powered mock interviews are coming soon. Practice behavioral and technical questions tailored to your target roles.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/assessment')}>
          <i className="fa-solid fa-clipboard-check"></i> Start Assessment First
        </button>
      </div>
    </div>
  );
}
