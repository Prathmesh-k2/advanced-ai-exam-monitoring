import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, PlayCircle, Trophy, Clock, ChevronRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resExams, resResults] = await Promise.all([
        api.get('/exams'),
        api.get('/results/my')
      ]);
      setExams(resExams.data);
      setResults(resResults.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-container">Loading your dashboard...</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, {user?.name}! 👋</h1>
        <p style={{ margin: 0 }}>Ready to showcase your skills? Pick an exam below to begin.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        {/* Available Exams Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
              <ClipboardList size={24} color="var(--primary)" /> Available Exams
            </h3>
            <span className="badge">{exams.length} Total</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {exams.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem' }}>
                <p>No exams are currently scheduled. Check back later!</p>
              </div>
            ) : (
              exams.map(exam => (
                <div key={exam.id} className="glass-panel exam-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{exam.title}</h4>
                    <p style={{ fontSize: '0.875rem', margin: 0, lineClamp: 3, WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {exam.description}
                    </p>
                  </div>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <Link to={`/student/exam/${exam.id}`} className="btn btn-primary" style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
                      <PlayCircle size={18} /> Start Examination
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Performance Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Trophy size={24} color="var(--accent)" /> Recent Performance
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>You haven't completed any exams yet.</p>
                </div>
              ) : (
                results.slice(0, 5).map(result => (
                  <div key={result.id} className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--success)', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h5 style={{ margin: 0, fontWeight: 600 }}>{result.exam_title}</h5>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {Math.round((result.score / result.total_questions) * 100)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={12} />
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {result.score} / {result.total_questions} Points
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {results.length > 0 && (
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.875rem' }}>
                  View All Results <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))' }}>
             <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Your Stats</h4>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                   <p style={{ fontSize: '0.75rem', margin: 0 }}>Completed</p>
                   <h3 style={{ margin: 0 }}>{results.length}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '0.75rem', margin: 0 }}>Avg. Score</p>
                   <h3 style={{ margin: 0 }}>
                      {results.length > 0 
                        ? Math.round((results.reduce((acc, r) => acc + (r.score / r.total_questions), 0) / results.length) * 100) 
                        : 0}%
                   </h3>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
