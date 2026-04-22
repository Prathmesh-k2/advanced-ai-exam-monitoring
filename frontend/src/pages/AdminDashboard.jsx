import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { PlusCircle, Activity, Users, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalExams: 0, totalStudents: 0, totalResults: 0 });
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchExams();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/exams/metrics');
      setMetrics(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <Link to="/admin/create-exam" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <PlusCircle size={18} /> Create New Exam
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Exams</p>
            <h3 style={{ margin: 0 }}>{metrics.totalExams}</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Students</p>
            <h3 style={{ margin: 0 }}>{metrics.totalStudents}</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px', color: 'var(--accent)' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Submissions</p>
            <h3 style={{ margin: 0 }}>{metrics.totalResults}</h3>
          </div>
        </div>
      </div>

      <h3>Manage Exams</h3>
      <div className="grid-cards">
        {exams.map(exam => (
          <div key={exam.id} className="glass-panel exam-card">
            <h4>{exam.title}</h4>
            <p style={{ fontSize: '0.875rem' }}>{exam.description}</p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <Link to={`/admin/exam/${exam.id}/results`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                View Results
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
