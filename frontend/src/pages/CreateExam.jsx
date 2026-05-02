import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Save, Plus } from 'lucide-react';

export default function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examId, setExamId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '', 
    option_a: '', 
    option_b: '', 
    option_c: '', 
    option_d: '', 
    correct_option: 'A'
  });
  
  const navigate = useNavigate();

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/exams', { title, description });
      setExamId(res.data.examId);
    } catch (err) { console.error(err); }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/exams/${examId}/questions`, currentQuestion);
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({ 
        question_text: '', 
        option_a: '', 
        option_b: '', 
        option_c: '', 
        option_d: '', 
        correct_option: 'A'
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '900px' }}>
      <h2 style={{ marginBottom: '2rem' }}>{examId ? 'Construct Examination' : 'Design New Exam'}</h2>
      
      {!examId ? (
        <form onSubmit={handleCreateExam} className="glass-panel" style={{ padding: '3rem', borderRadius: '24px' }}>
          <div className="input-group">
            <label>Exam Title</label>
            <input 
                type="text" 
                placeholder="e.g. Advanced Artificial Intelligence"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
            />
          </div>
          <div className="input-group">
            <label>Detailed Description</label>
            <textarea 
                placeholder="Explain what this exam covers..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows="4" 
                required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
            <Save size={18} /> Initialize Exam & Proceed
          </button>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ borderRadius: '24px', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Exam: {title}</h3>
                <span className="badge">{questions.length} Items</span>
            </div>
            
            <form onSubmit={handleAddQuestion}>
              <div className="input-group">
                <label>Question Statement</label>
                <textarea 
                    value={currentQuestion.question_text} 
                    onChange={e => setCurrentQuestion({...currentQuestion, question_text: e.target.value})} 
                    rows="3" 
                    placeholder="Enter the question here..."
                    required 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Option A</label>
                  <input type="text" value={currentQuestion.option_a} onChange={e => setCurrentQuestion({...currentQuestion, option_a: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Option B</label>
                  <input type="text" value={currentQuestion.option_b} onChange={e => setCurrentQuestion({...currentQuestion, option_b: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Option C</label>
                  <input type="text" value={currentQuestion.option_c} onChange={e => setCurrentQuestion({...currentQuestion, option_c: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Option D</label>
                  <input type="text" value={currentQuestion.option_d} onChange={e => setCurrentQuestion({...currentQuestion, option_d: e.target.value})} required />
                </div>
              </div>

              <div className="input-group">
                <label>Correct Choice</label>
                <select value={currentQuestion.correct_option} onChange={e => setCurrentQuestion({...currentQuestion, correct_option: e.target.value})}>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}><Plus size={18} /> Add This Question</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Finish & Publish Exam</button>
              </div>
            </form>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ margin: 0 }}>Review Questions ({questions.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {questions.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No questions added yet.</p>}
              {questions.map((q, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <span className="badge" style={{ fontSize: '0.6rem' }}>MCQ</span>
                     <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>#{idx + 1}</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{q.question_text}</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Correct: {q.correct_option}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
