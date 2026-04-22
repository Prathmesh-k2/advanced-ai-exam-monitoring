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
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A'
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
      setCurrentQuestion({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      <h2>{examId ? 'Add Questions' : 'Create New Exam'}</h2>
      
      {!examId ? (
        <form onSubmit={handleCreateExam} className="glass-panel">
          <div className="input-group">
            <label>Exam Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" required />
          </div>
          <button type="submit" className="btn btn-primary"><Save size={18} /> Save Exam</button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Exam: {title}</h3>
                <span className="badge">{questions.length} Questions Added</span>
            </div>
            
            <form onSubmit={handleAddQuestion}>
              <div className="input-group">
                <label>Question Text</label>
                <textarea value={currentQuestion.question_text} onChange={e => setCurrentQuestion({...currentQuestion, question_text: e.target.value})} rows="2" required />
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
                <label>Correct Option</label>
                <select value={currentQuestion.correct_option} onChange={e => setCurrentQuestion({...currentQuestion, correct_option: e.target.value})}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary"><Plus size={18} /> Add Question</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Finish Exam Creation</button>
              </div>
            </form>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q, idx) => (
               <div key={idx} className="glass-panel" style={{ padding: '1rem' }}>
                 <strong>Q{idx + 1}: {q.question_text}</strong>
                 <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Correct: {q.correct_option}</p>
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
