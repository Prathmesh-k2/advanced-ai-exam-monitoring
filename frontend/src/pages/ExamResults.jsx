import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Users, Trophy, Clock } from 'lucide-react';

export default function ExamResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResults, resExam] = await Promise.all([
        api.get(`/results/exam/${id}`),
        api.get(`/exams/${id}`)
      ]);
      setResults(resResults.data);
      setExam(resExam.data.exam);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-container">Loading Results...</div>;

  return (
    <div className="dashboard-container">
      <button 
        onClick={() => navigate('/admin')} 
        className="btn btn-secondary" 
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <h2 style={{ margin: 0 }}>{exam?.title} - Results</h2>
        <p style={{ margin: '0.5rem 0 0 0' }}>{exam?.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Users size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>Participants</p>
            <h3 style={{ margin: 0 }}>{results.length}</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: 'var(--success)' }}>
            <Trophy size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>Avg. Score</p>
            <h3 style={{ margin: 0 }}>
              {results.length > 0 
                ? (results.reduce((acc, r) => acc + (r.score / r.total_questions), 0) / results.length * 100).toFixed(1) 
                : 0}%
            </h3>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1.25rem' }}>Student</th>
              <th style={{ padding: '1.25rem' }}>Score</th>
              <th style={{ padding: '1.25rem' }}>Percentage</th>
              <th style={{ padding: '1.25rem' }}>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No results found for this exam.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 600 }}>{result.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{result.user_email}</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span className="badge">
                      {result.score} / {result.total_questions}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 600, color: (result.score / result.total_questions) >= 0.5 ? 'var(--success)' : 'var(--danger)' }}>
                    {Math.round((result.score / result.total_questions) * 100)}%
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} />
                      {new Date(result.submitted_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
