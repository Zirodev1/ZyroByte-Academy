import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaTimes } from 'react-icons/fa';
import Header from '../Header';
import Footer from '../Footer';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Admin.css';

const QuizManagement = () => {
  const { moduleId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    module: moduleId,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });
  const [formMode, setFormMode] = useState('create');
  const [editId, setEditId] = useState(null);
  
  useEffect(() => {
    if (moduleId) {
      fetchModuleInfo();
      fetchQuizzes();
    }
  }, [moduleId]);
  
  const fetchModuleInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/modules/${moduleId}`);
      setModule(response.data.data);
      
      // Get course information
      const courseResponse = await api.get(`/courses/${response.data.data.course}`);
      setCourse(courseResponse.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching module information:', err);
      setError('Error loading module information');
      toast.error('Failed to load module information');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/module/${moduleId}`);
      setQuizzes(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Error loading quizzes');
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...form.questions];
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = parseInt(value);
    }
    
    setForm({
      ...form,
      questions: updatedQuestions
    });
  };
  
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    
    setForm({
      ...form,
      questions: updatedQuestions
    });
  };
  
  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    });
  };
  
  const removeQuestion = (index) => {
    if (form.questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    
    const updatedQuestions = [...form.questions];
    updatedQuestions.splice(index, 1);
    
    setForm({
      ...form,
      questions: updatedQuestions
    });
  };
  
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      module: moduleId,
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
    setFormMode('create');
    setEditId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields again
      if (!form.title || !form.description || !form.questions.length) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const quizData = {
        ...form,
        module: moduleId
      };
      
      if (formMode === 'create') {
        await api.post('/quizzes', quizData);
        toast.success('Quiz created successfully');
      } else {
        await api.put(`/quizzes/${editId}`, quizData);
        toast.success('Quiz updated successfully');
      }
      
      resetForm();
      fetchQuizzes();
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error(err.response?.data?.message || 'Failed to save quiz');
    }
  };
  
  const handleEdit = (quiz) => {
    setFormMode('edit');
    setEditId(quiz._id);
    
    // Make sure all questions have 4 options
    const normalizedQuestions = quiz.questions.map(q => ({
      ...q,
      options: q.options.length === 4 ? q.options : [...q.options, ...Array(4 - q.options.length).fill('')]
    }));
    
    setForm({
      title: quiz.title,
      description: quiz.description,
      module: quiz.module,
      questions: normalizedQuestions
    });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }
    
    try {
      await api.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
      toast.error(err.response?.data?.message || 'Failed to delete quiz');
    }
  };
  
  const handleReorder = async (id, direction) => {
    // Find current quiz's index
    const quizIndex = quizzes.findIndex(quiz => quiz._id === id);
    if (quizIndex === -1) return;
    
    // Get target index
    let targetIndex;
    if (direction === 'up' && quizIndex > 0) {
      targetIndex = quizIndex - 1;
    } else if (direction === 'down' && quizIndex < quizzes.length - 1) {
      targetIndex = quizIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const quizzesCopy = [...quizzes];
    const currentQuiz = quizzesCopy[quizIndex];
    const targetQuiz = quizzesCopy[targetIndex];
    
    // Swap orders
    try {
      await api.post('/quizzes/reorder', {
        moduleId,
        quizOrders: [
          { id: currentQuiz._id, order: targetQuiz.order },
          { id: targetQuiz._id, order: currentQuiz.order }
        ]
      });
      
      toast.success('Quizzes reordered successfully');
      fetchQuizzes();
    } catch (err) {
      console.error('Error reordering quizzes:', err);
      toast.error('Failed to reorder quizzes');
    }
  };
  
  return (
    <div>
      <Header />
      <div className="admin-container">
        <div className="admin-content">
          <div className="admin-header">
            <div className="admin-breadcrumb">
              <Link to="/admin/courses">Courses</Link> {' > '}
              {course ? <Link to={`/admin/courses/${course._id}/modules`}>{course.title}</Link> : 'Loading...'} {' > '}
              {module ? <Link to={`/admin/courses/${course?._id}/modules`}>{module.title}</Link> : 'Loading...'} {' > '} Quizzes
            </div>
            <h1 className="admin-title">Quiz Management</h1>
            <div className="admin-actions">
              <Link to="/admin" className="admin-button">Back to Dashboard</Link>
            </div>
          </div>
          
          {error && <div className="admin-error">{error}</div>}
          
          <div className="admin-form-container">
            <h2>{formMode === 'create' ? 'Create New Quiz' : 'Edit Quiz'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="title">Quiz Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Module 1 Assessment"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Test your knowledge of the module content"
                  rows="3"
                />
              </div>
              
              <div className="questions-container">
                <div className="questions-header">
                  <h3>Questions</h3>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary"
                    onClick={addQuestion}
                  >
                    <FaPlus /> Add Question
                  </button>
                </div>
                
                {form.questions.map((question, qIndex) => (
                  <div key={qIndex} className="question-card">
                    <div className="question-header">
                      <h4>Question {qIndex + 1}</h4>
                      <button
                        type="button"
                        className="btn-icon delete"
                        onClick={() => removeQuestion(qIndex)}
                        title="Remove Question"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`question-${qIndex}`}>Question Text</label>
                      <input
                        type="text"
                        id={`question-${qIndex}`}
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        required
                        className="form-control"
                        placeholder="Enter the question"
                      />
                    </div>
                    
                    <div className="options-container">
                      <label>Options</label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="option-row">
                          <div className="option-radio">
                            <input
                              type="radio"
                              name={`correct-answer-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                              required
                            />
                          </div>
                          <div className="option-input">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              required
                              className="form-control"
                              placeholder={`Option ${oIndex + 1}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {formMode === 'create' ? 'Create Quiz' : 'Update Quiz'}
                </button>
                {formMode === 'edit' && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="admin-list-container">
            <h2>Quizzes ({quizzes.length})</h2>
            {loading ? (
              <div className="admin-loading">Loading quizzes...</div>
            ) : quizzes.length === 0 ? (
              <p>No quizzes found. Create your first quiz above.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Questions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id}>
                      <td>{quiz.order}</td>
                      <td>{quiz.title}</td>
                      <td>{quiz.description}</td>
                      <td>{quiz.questions?.length || 0}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(quiz._id, 'up')}
                          title="Move Up"
                        >
                          <FaArrowUp />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(quiz._id, 'down')}
                          title="Move Down"
                        >
                          <FaArrowDown />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEdit(quiz)}
                          title="Edit Quiz"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(quiz._id)}
                          title="Delete Quiz"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuizManagement;
