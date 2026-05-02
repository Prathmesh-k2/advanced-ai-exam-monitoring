import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle, AlertCircle, Camera, Mic, ShieldCheck, Play } from 'lucide-react';

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchExamData();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [id, stream]);

  const fetchExamData = async () => {
    try {
      const res = await api.get(`/exams/${id}`);
      setExam(res.data.exam);
      setQuestions(res.data.questions);
    } catch (err) { console.error(err); }
  };

  const handleOptionChange = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Please allow camera and microphone access to proceed.");
    }
  };

  const handleStartExam = () => {
    if (!stream) {
      setError("Camera and microphone must be enabled.");
      return;
    }
    setExamStarted(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post('/results/submit', { examId: id, answers });
      setResult(res.data);
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (err) { console.error(err); }
  };

  if (!exam) return <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Exam...</div>;

  if (result) {
    return (
      <div className="auth-container">
        <div className="glass-panel auth-card" style={{ textAlign: 'center', maxWidth: '500px', padding: '3rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
             <CheckCircle size={48} color="var(--success)" />
          </div>
          <h2>Exam Completed!</h2>
          <p>Well done! Your examination has been successfully submitted and recorded.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '20px', margin: '2rem 0', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Your Final Score</p>
            <h1 style={{ margin: 0, fontSize: '4rem', color: 'var(--primary)', letterSpacing: '-2px' }}>
              {result.score} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', letterSpacing: '0' }}>/ {result.total}</span>
            </h1>
          </div>
          
          <button onClick={() => navigate('/student')} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="auth-container">
        <div className="glass-panel" style={{ maxWidth: '800px', width: '100%', padding: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', alignItems: 'center' }}>
             <div>
                <h2 style={{ marginBottom: '1.5rem' }}>Secure Exam Access</h2>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>This is an AI-monitored examination. Please ensure you are in a well-lit, quiet room before starting.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0', textAlign: 'left' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                      <ShieldCheck size={20} color="var(--primary)" />
                      <span>Fullscreen mode will be enabled</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                      <Camera size={20} color="var(--primary)" />
                      <span>Live camera feed is required</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                      <Mic size={20} color="var(--primary)" />
                      <span>Audio activity will be tracked</span>
                   </div>
                </div>

                {!stream ? (
                   <button onClick={startCamera} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                      Verify My Hardware
                   </button>
                ) : (
                   <button onClick={handleStartExam} className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: 'var(--success)' }}>
                      <Play size={18} /> I'm Ready, Start Exam
                   </button>
                )}
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '1rem' }}>{error}</p>}
             </div>

             <div style={{ 
                width: '100%', height: '400px', background: '#000', borderRadius: '24px', 
                overflow: 'hidden', position: 'relative', border: '4px solid var(--glass-border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
             }}>
                {stream ? (
                  <video 
                    autoPlay 
                    muted 
                    ref={(el) => { if(el) el.srcObject = stream; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Camera size={48} opacity={0.3} />
                    <p style={{ fontSize: '0.875rem' }}>Camera feed will appear here</p>
                  </div>
                )}
                {stream && (
                   <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(16, 185, 129, 0.8)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }}></div>
                      FEED ACTIVE
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '1300px', display: 'flex', gap: '3rem', padding: '3rem' }}>
      {/* Sidebar Monitoring */}
      <div style={{ width: '320px', position: 'sticky', top: '3rem', height: 'fit-content' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
             <ShieldCheck size={20} color="var(--primary)" />
             <h4 style={{ margin: 0, fontSize: '1rem' }}>AI Proctoring Active</h4>
          </div>
          
          <div style={{ width: '100%', height: '220px', background: '#000', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--glass-border)' }}>
             <video 
                autoPlay 
                muted 
                ref={(el) => { if(el) el.srcObject = stream; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                  Visual Verification Active
               </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                  Audio Monitoring Active
               </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', gap: '0.75rem' }}>
             <AlertCircle size={16} style={{ flexShrink: 0 }} />
             <p style={{ margin: 0 }}>Warning: Do not switch tabs or exit fullscreen. All activities are being recorded.</p>
          </div>
        </div>
      </div>

      {/* Exam Content */}
      <div style={{ flex: 1 }}>
        <div className="glass-panel" style={{ marginBottom: '3rem', borderLeft: '6px solid var(--primary)', borderRadius: '24px', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)' }}>Academic Assessment</span>
             <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Duration: 60 Mins</span>
          </div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>{exam.title}</h1>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>{exam.description}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-panel" style={{ borderRadius: '24px', padding: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {idx + 1}
                 </div>
                 <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '2rem', lineHeight: '1.4' }}>{q.question_text}</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <label key={opt} style={{ 
                          display: 'flex', alignItems: 'center', gap: '1rem', 
                          padding: '1.25rem', borderRadius: '16px', 
                          background: answers[q.id] === opt ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                          border: answers[q.id] === opt ? '2px solid var(--primary)' : '2px solid var(--glass-border)',
                          cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                          <input 
                            type="radio" 
                            name={`q-${q.id}`} 
                            value={opt} 
                            onChange={() => handleOptionChange(q.id, opt)}
                            checked={answers[q.id] === opt}
                            style={{ width: 'auto', marginBottom: 0, accentColor: 'var(--primary)' }}
                          />
                          <span style={{ fontSize: '1rem', fontWeight: answers[q.id] === opt ? 600 : 400 }}>
                            <strong style={{ opacity: 0.5, marginRight: '0.5rem' }}>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
                          </span>
                        </label>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', borderRadius: '18px', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }}>
              Complete & Submit Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
