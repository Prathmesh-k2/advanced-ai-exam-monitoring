import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { PlusCircle, Users, FileText, Calendar, Mail, Search, ChevronRight, Edit3, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalExams: 0, totalStudents: 0 });
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMetrics, resExams, resStudents] = await Promise.all([
        api.get('/exams/metrics'),
        api.get('/exams'),
        api.get('/users/students')
      ]);
      setMetrics(resMetrics.data);
      setExams(resExams.data);
      setStudents(resStudents.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    window.alert("DEBUG: Delete button clicked for exam " + id);
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchData();
      alert("Exam deleted successfully!");
    } catch (err) { 
      console.error(err); 
      alert("Failed to delete exam: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Workspace...</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
           <h1 style={{ marginBottom: '0.5rem' }}>Management Console</h1>
           <p style={{ margin: 0 }}>Oversee examinations and monitor student registrations.</p>
        </div>
        <Link to="/admin/create-exam" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
          <PlusCircle size={18} /> Create New Exam
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '20px', color: 'var(--primary)' }}>
            <FileText size={32} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Exams</p>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{metrics.totalExams}</h2>
          </div>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', color: 'var(--success)' }}>
            <Users size={32} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Students</p>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{metrics.totalStudents}</h2>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--glass-border)', zIndex: 0 }}></div>
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          className="btn btn-secondary" 
          style={{ 
            padding: '1rem 3rem', borderRadius: '30px', position: 'relative', zIndex: 1,
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.05)', color: 'var(--text-primary)'
          }}
        >
          {showDetails ? 'Hide Detailed Records' : 'Explore Detailed Records'}
        </button>
      </div>

      {showDetails && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', animation: 'fadeIn 0.5s ease' }}>
          {/* Manage Exams Section */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                 <h3 style={{ margin: 0 }}>Active Examinations</h3>
              </div>
              <span className="badge" style={{ padding: '0.5rem 1rem' }}>{exams.length} Records Found</span>
            </div>
            
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {exams.map(exam => (
                <div key={exam.id} className="glass-panel exam-card" style={{ padding: '2.5rem', borderRadius: '24px', position: 'relative' }}>
                  {/* Absolute Positioned Actions */}
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                     <Link to={`/admin/edit-exam/${exam.id}`} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--glass-bg)' }}>
                        <Edit3 size={16} />
                     </Link>
                     <div 
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDelete(exam.id);
                       }} 
                       className="btn btn-secondary" 
                       style={{ padding: '0.5rem', borderRadius: '10px', color: 'var(--danger)', background: 'var(--glass-bg)', cursor: 'pointer' }}
                     >
                        <Trash2 size={16} />
                     </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingRight: '4rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{exam.title}</h4>
                    <span className="badge" style={{ fontSize: '0.7rem', opacity: 0.7 }}>ID: #{exam.id}</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', minHeight: '4rem', lineHeight: '1.6' }}>{exam.description}</p>
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <Link to={`/admin/exam/${exam.id}/results`} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', textDecoration: 'none', borderRadius: '10px', width: '100%', justifyContent: 'center' }}>
                      Analyze Results <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Students Section */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></div>
                 <h3 style={{ margin: 0 }}>Registered Students</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                 <Search size={16} color="var(--text-secondary)" />
                 <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Search Students...</span>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1.5rem 2rem' }}>Student Details</th>
                    <th style={{ padding: '1.5rem 2rem' }}>Contact Info</th>
                    <th style={{ padding: '1.5rem 2rem' }}>Registration</th>
                    <th style={{ padding: '1.5rem 2rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No students registered yet.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{student.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <Mail size={16} />
                            {student.email}
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem 2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Calendar size={16} />
                            {new Date(student.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                           <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>View Profile</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
