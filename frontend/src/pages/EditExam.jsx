import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, ChevronLeft, AlertCircle } from 'lucide-react';

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/exams/${id}`);
      setTitle(res.data.exam.title);
      setDescription(res.data.exam.description);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to load exam details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/exams/${id}`, { title, description });
      setMessage({ type: 'success', text: 'Exam updated successfully!' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Failed to update exam.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="dashboard-container">Loading Exam...</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate('/admin')} className="btn btn-secondary" style={{ marginBottom: '2rem', gap: '0.5rem' }}>
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px' }}>
        <h2 style={{ marginBottom: '2rem' }}>Edit Examination Details</h2>
        
        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} />
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="input-group">
            <label>Exam Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows="5" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '1rem 2rem', width: '100%' }}>
            <Save size={18} /> {saving ? 'Saving Changes...' : 'Update Examination'}
          </button>
        </form>
      </div>
    </div>
  );
}
