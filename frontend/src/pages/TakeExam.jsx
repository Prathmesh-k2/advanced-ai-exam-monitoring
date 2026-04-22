import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle } from 'lucide-react';

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchExamData();
  }, [id]);

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

  const handleSubmit = async () => {
    try {
      const res = await api.post('/results/submit', { examId: id, answers });
      setResult(res.data);
    } catch (err) { console.error(err); }
  };

  if (!exam) return <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Exam...</div>;

  if (result) {
    return (
      <div className="auth-container">
        <div className="glass-panel auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Exam Submitted Successfully!</h2>
          <p>Your results have been recorded.</p>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', margin: '2rem 0' }}>
            <h1 style={{ margin: 0, fontSize: '3rem', color: 'var(--primary)' }}>
              {result.score} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/ {result.total}</span>
            </h1>
          </div>
          <button onClick={() => navigate('/student')} className="btn btn-primary">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      <div className="glass-panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>{exam.title}</h2>
        <p style={{ margin: 0 }}>{exam.description}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q, idx) => (
          <div key={q.id} className="glass-panel">
            <h4 style={{ marginBottom: '1rem' }}>{idx + 1}. {q.question_text}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <label key={opt} style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', 
                  padding: '1rem', borderRadius: '8px', 
                  background: answers[q.id] === opt ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: answers[q.id] === opt ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}>
                  <input 
                    type="radio" 
                    name={`q-${q.id}`} 
                    value={opt} 
                    onChange={() => handleOptionChange(q.id, opt)}
                    checked={answers[q.id] === opt}
                    style={{ width: 'auto', marginBottom: 0 }}
                  />
                  <span>
                    <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}
