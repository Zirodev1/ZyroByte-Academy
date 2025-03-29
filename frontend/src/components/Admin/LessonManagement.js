import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Header from '../Header';
import Footer from '../Footer';
import LessonEditor from './EditorJS/LessonEditor';
import './Admin.css';

const LessonManagement = () => {
  const { moduleId, subModuleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [module, setModule] = useState(null);
  const [subModule, setSubModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for regular lesson
  const [form, setForm] = useState({ 
    title: '', 
    editorContent: {}, 
    module: moduleId,
    subModule: subModuleId,
    videoUrl: '',
    isCodingExercise: false
  });
  
  // Form state for coding exercise
  const [exerciseForm, setExerciseForm] = useState({
    title: '',
    exerciseInstructions: '',
    initialCode: '',
    solutionCode: '',
    module: moduleId,
    subModule: subModuleId,
    isCodingExercise: true
  });
  
  const [formType, setFormType] = useState('lesson'); // 'lesson' or 'exercise'
  const [editing, setEditing] = useState(false);
  const [lessonId, setLessonId] = useState(null);

  useEffect(() => {
    if (subModuleId) {
      fetchSubModule();
      fetchLessons();
    } else if (moduleId) {
      fetchModule();
      fetchLessons();
    }
  }, [moduleId, subModuleId]);

  const fetchModule = async () => {
    try {
      const response = await api.get(`/modules/${moduleId}`);
      setModule(response.data.data);
      
      // Fetch course info
      if (response.data.data.course) {
        const courseResponse = await api.get(`/courses/${response.data.data.course}`);
        setCourse(courseResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching module:', err);
      setError('Error loading module details');
      toast.error('Failed to load module details');
    }
  };

  const fetchSubModule = async () => {
    try {
      const response = await api.get(`/submodules/${subModuleId}`);
      setSubModule(response.data.data);
      
      // Fetch module info
      if (response.data.data.module) {
        const moduleResponse = await api.get(`/modules/${response.data.data.module}`);
        setModule(moduleResponse.data.data);
        
        // Fetch course info
        if (moduleResponse.data.data.course) {
          const courseResponse = await api.get(`/courses/${moduleResponse.data.data.course}`);
          setCourse(courseResponse.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching submodule:', err);
      setError('Error loading submodule details');
      toast.error('Failed to load submodule details');
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      
      let url;
      if (subModuleId) {
        url = `/lessons/submodule/${subModuleId}`;
      } else {
        url = `/lessons/module/${moduleId}`;
      }
      
      const response = await api.get(url);
      setLessons(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError('Error loading lessons');
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (formType === 'lesson') {
      setForm({ ...form, [name]: val });
    } else {
      setExerciseForm({ ...exerciseForm, [name]: val });
    }
  };

  const handleEditorChange = (data) => {
    // Store the Editor.js data object
    setForm({ 
      ...form, 
      editorContent: data
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = formType === 'lesson' ? form : exerciseForm;
      
      if (subModuleId) {
        submissionData.subModule = subModuleId;
        submissionData.module = module._id;
      } else {
        submissionData.module = moduleId;
        submissionData.subModule = null;
      }
      
      if (editing) {
        await api.put(`/lessons/${lessonId}`, submissionData);
        toast.success('Lesson updated successfully');
      } else {
        await api.post('/lessons', submissionData);
        toast.success(formType === 'lesson' ? 'Lesson created successfully' : 'Coding exercise created successfully');
      }
      
      resetForm();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(error.response?.data?.message || (editing ? 'Failed to update lesson' : 'Failed to create lesson'));
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditing(true);
    setLessonId(lesson._id);
    
    if (lesson.isCodingExercise) {
      setFormType('exercise');
      setExerciseForm({
        title: lesson.title || '',
        exerciseInstructions: lesson.exerciseInstructions || '',
        initialCode: lesson.initialCode || '',
        solutionCode: lesson.solutionCode || '',
        module: lesson.module,
        subModule: lesson.subModule,
        isCodingExercise: true
      });
    } else {
      setFormType('lesson');
      // Parse the editor content if it exists
      const editorContent = lesson.editorContent || {};
      
      setForm({
        title: lesson.title || '',
        editorContent: editorContent,
        module: lesson.module,
        subModule: lesson.subModule,
        videoUrl: lesson.videoUrl || '',
        isCodingExercise: false
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      await api.delete(`/lessons/${id}`);
      toast.success('Lesson deleted successfully');
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const handleReorder = async (id, direction) => {
    // Find current lesson's index
    const lessonIndex = lessons.findIndex(lesson => lesson._id === id);
    if (lessonIndex === -1) return;
    
    // Get target index
    let targetIndex;
    if (direction === 'up' && lessonIndex > 0) {
      targetIndex = lessonIndex - 1;
    } else if (direction === 'down' && lessonIndex < lessons.length - 1) {
      targetIndex = lessonIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const lessonsCopy = [...lessons];
    const currentLesson = lessonsCopy[lessonIndex];
    const targetLesson = lessonsCopy[targetIndex];
    
    // Swap orders
    try {
      const requestData = subModuleId 
        ? { 
            subModuleId,
            lessonOrders: [
              { id: currentLesson._id, order: targetLesson.order },
              { id: targetLesson._id, order: currentLesson.order }
            ]
          }
        : {
            moduleId,
            lessonOrders: [
              { id: currentLesson._id, order: targetLesson.order },
              { id: targetLesson._id, order: currentLesson.order }
            ]
          };
          
      await api.post('/lessons/reorder', requestData);
      
      toast.success('Lessons reordered successfully');
      fetchLessons();
    } catch (err) {
      console.error('Error reordering lessons:', err);
      toast.error('Failed to reorder lessons');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      editorContent: {},
      module: moduleId,
      subModule: subModuleId,
      videoUrl: '',
      isCodingExercise: false
    });
    
    setExerciseForm({
      title: '',
      exerciseInstructions: '',
      initialCode: '',
      solutionCode: '',
      module: moduleId,
      subModule: subModuleId,
      isCodingExercise: true
    });
    
    setFormType('lesson');
    setEditing(false);
    setLessonId(null);
  };

  const getBreadcrumb = () => {
    if (subModuleId && subModule) {
      return (
        <div className="admin-breadcrumb">
          <Link to="/admin/courses">Courses</Link> {' > '}
          {course ? <Link to={`/admin/courses/${course._id}/modules`}>{course.title}</Link> : 'Loading...'} {' > '}
          {module ? <Link to={`/admin/courses/${course?._id}/modules`}>{module.title}</Link> : 'Loading...'} {' > '}
          {subModule ? <Link to={`/admin/modules/${module?._id}/submodules`}>{subModule.title}</Link> : 'Loading...'} {' > '} Lessons
        </div>
      );
    } else {
      return (
        <div className="admin-breadcrumb">
          <Link to="/admin/courses">Courses</Link> {' > '}
          {course ? <Link to={`/admin/courses/${course._id}/modules`}>{course.title}</Link> : 'Loading...'} {' > '}
          {module ? <Link to={`/admin/courses/${course?._id}/modules`}>{module.title}</Link> : 'Loading...'} {' > '} Lessons
        </div>
      );
    }
  };

  const getBackLink = () => {
    if (subModuleId && module) {
      return `/admin/modules/${module?._id}/submodules`;
    } else if (course) {
      return `/admin/courses/${course?._id}/modules`;
    } else {
      return '/admin';
    }
  };

  return (
    <div>
      <Header />
      <div className="admin-container">
        <div className="admin-content">
          <div className="admin-header">
            {getBreadcrumb()}
            <h1 className="admin-title">Lesson Management</h1>
            <div className="admin-actions">
              <Link to={getBackLink()} className="admin-button">Back</Link>
            </div>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-controls">
            <div className="admin-tabs">
              <button 
                className={`admin-tab ${formType === 'lesson' ? 'active' : ''}`}
                onClick={() => setFormType('lesson')}
              >
                Regular Lesson
              </button>
              <button 
                className={`admin-tab ${formType === 'exercise' ? 'active' : ''}`}
                onClick={() => setFormType('exercise')}
              >
                Coding Exercise
              </button>
            </div>
          </div>

          {formType === 'lesson' ? (
            <div className="admin-form">
              <h2>{editing ? "Edit Lesson" : "Create New Lesson"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Lesson Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="Enter lesson title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="videoUrl">Video URL (Optional)</label>
                  <input
                    type="text"
                    id="videoUrl"
                    name="videoUrl"
                    className="form-control"
                    placeholder="Enter YouTube or Vimeo URL"
                    value={form.videoUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Lesson Content</label>
                  <LessonEditor 
                    data={form.editorContent} 
                    onChange={handleEditorChange} 
                  />
                </div>

                <div className="form-buttons">
                  {editing && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                  >
                    {loading ? "Saving..." : (editing ? "Update Lesson" : "Create Lesson")}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="admin-form">
              <h2>{editing ? "Edit Coding Exercise" : "Create New Coding Exercise"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="exercise-title">Exercise Title</label>
                  <input
                    type="text"
                    id="exercise-title"
                    name="title"
                    className="form-control"
                    placeholder="Enter exercise title"
                    value={exerciseForm.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="exerciseInstructions">Instructions</label>
                  <textarea
                    id="exerciseInstructions"
                    name="exerciseInstructions"
                    className="form-control"
                    placeholder="Enter instructions for the exercise"
                    value={exerciseForm.exerciseInstructions}
                    onChange={handleChange}
                    rows="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="initialCode">Initial Code</label>
                  <textarea
                    id="initialCode"
                    name="initialCode"
                    className="form-control code-editor"
                    placeholder="Enter the starter code for students"
                    value={exerciseForm.initialCode}
                    onChange={handleChange}
                    rows="8"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="solutionCode">Solution Code</label>
                  <textarea
                    id="solutionCode"
                    name="solutionCode"
                    className="form-control code-editor"
                    placeholder="Enter the solution code"
                    value={exerciseForm.solutionCode}
                    onChange={handleChange}
                    rows="8"
                    required
                  />
                </div>

                <div className="form-buttons">
                  {editing && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                  >
                    {loading ? "Saving..." : (editing ? "Update Exercise" : "Create Exercise")}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-list-container">
            <h2>Lessons & Exercises ({lessons.length})</h2>
            {loading && lessons.length === 0 ? (
              <div className="admin-loading">Loading lessons...</div>
            ) : lessons.length === 0 ? (
              <p>No lessons found. Create your first lesson above.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson._id} className={lesson.isCodingExercise ? 'coding-exercise' : ''}>
                      <td>{lesson.order}</td>
                      <td>{lesson.title}</td>
                      <td>{lesson.isCodingExercise ? 'Coding Exercise' : 'Lesson'}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(lesson._id, 'up')}
                          title="Move Up"
                        >
                          <FaArrowUp />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(lesson._id, 'down')}
                          title="Move Down"
                        >
                          <FaArrowDown />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEdit(lesson)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(lesson._id)}
                          title="Delete"
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

export default LessonManagement;