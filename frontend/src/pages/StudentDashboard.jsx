import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ClipboardList, PlayCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchExams();
    fetchResults();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchResults = async () => {
    try {
      const res = await api.get('/results/my');
      setResults(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-container">
      <h2>Student Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={22} color="var(--primary)" /> Available Exams
          </h3>
          <div className="grid-cards" style={{ gridTemplateColumns: 'minmax(250px, 1fr)' }}>
            {exams.map(exam => (
              <div key={exam.id} className="glass-panel exam-card">
                <h4>{exam.title}</h4>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>{exam.description}</p>
                <Link to={`/student/exam/${exam.id}`} className="btn btn-primary" style={{ textDecoration: 'none', width: '100%' }}>
                  <PlayCircle size={18} /> Start Exam
                </Link>
              </div>
            ))}
            {exams.length === 0 && <p>No exams available right now.</p>}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>My Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map(result => (
              <div key={result.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{result.exam_title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(result.submitted_at).toLocaleDateString()}
                  </span>
                  <span className="badge" style={{ fontSize: '1rem' }}>
                    {result.score} / {result.total_questions}
                  </span>
                </div>
              </div>
            ))}
            {results.length === 0 && <p>You haven't taken any exams yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
