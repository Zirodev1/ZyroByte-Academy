import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import Header from '../Header';
import Footer from '../Footer';
import './Admin.css';

const ModuleManagement = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formMode, setFormMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: courseId
  });
  
  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchModules();
    }
  }, [courseId]);
  
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data.data);
      setError('');
    } catch (err) {
      console.error("Error fetching course:", err);
      setError('Failed to load course information');
      toast.error('Error loading course information');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/modules/course/${courseId}`);
      setModules(response.data.data);
      setError('');
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError('Failed to load modules');
      toast.error('Error loading modules');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      course: courseId
    });
    setFormMode('create');
    setEditId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        await api.post('/modules', formData);
        toast.success('Module created successfully');
      } else {
        await api.put(`/modules/${editId}`, formData);
        toast.success('Module updated successfully');
      }
      
      resetForm();
      fetchModules();
    } catch (err) {
      console.error("Error saving module:", err);
      toast.error('Failed to save module');
    }
  };
  
  const handleEdit = (module) => {
    setFormMode('edit');
    setEditId(module._id);
    setFormData({
      title: module.title,
      description: module.description,
      course: module.course
    });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module? This will also delete all associated lessons and quizzes.')) {
      return;
    }
    
    try {
      await api.delete(`/modules/${id}`);
      toast.success('Module deleted successfully');
      fetchModules();
    } catch (err) {
      console.error("Error deleting module:", err);
      toast.error('Failed to delete module');
    }
  };
  
  const handleReorder = async (id, direction) => {
    // Find current module
    const moduleIndex = modules.findIndex(mod => mod._id === id);
    if (moduleIndex === -1) return;
    
    // Get current and target order
    const currentModule = modules[moduleIndex];
    let targetIndex;
    
    if (direction === 'up' && moduleIndex > 0) {
      targetIndex = moduleIndex - 1;
    } else if (direction === 'down' && moduleIndex < modules.length - 1) {
      targetIndex = moduleIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const targetModule = modules[targetIndex];
    
    // Prepare the reorder request
    try {
      await api.post('/modules/reorder', {
        courseId: courseId,
        moduleOrders: [
          { id: currentModule._id, order: targetModule.order },
          { id: targetModule._id, order: currentModule.order }
        ]
      });
      
      toast.success('Modules reordered successfully');
      fetchModules();
    } catch (err) {
      console.error('Error reordering modules:', err);
      toast.error('Failed to reorder modules');
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
              {course ? course.title : 'Loading...'} {' > '} Modules
            </div>
            <h1 className="admin-title">Module Management</h1>
            <div className="admin-actions">
              <Link to="/admin" className="admin-button">Back to Dashboard</Link>
            </div>
          </div>
          
          {error && <div className="admin-error">{error}</div>}
          
          <div className="admin-form-container">
            <h2>{formMode === 'create' ? 'Create New Module' : 'Edit Module'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="title">Module Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Introduction to HTML"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Learn the basics of HTML structure and elements"
                  rows="3"
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {formMode === 'create' ? 'Create Module' : 'Update Module'}
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
            <h2>Modules ({modules.length})</h2>
            {loading ? (
              <div className="admin-loading">Loading modules...</div>
            ) : modules.length === 0 ? (
              <p>No modules found. Create your first module above.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Sub-Modules</th>
                    <th>Lessons</th>
                    <th>Quizzes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module) => (
                    <tr key={module._id}>
                      <td>{module.order}</td>
                      <td>{module.title}</td>
                      <td>{module.description}</td>
                      <td>
                        {module.subModules?.length || 0}
                        <Link 
                          to={`/admin/modules/${module._id}/submodules`}
                          className="btn-icon add"
                          title="Manage Sub-Modules"
                        >
                          <FaPlus />
                        </Link>
                      </td>
                      <td>
                        {module.lessons?.length || 0}
                        <Link 
                          to={`/admin/modules/${module._id}/lessons`}
                          className="btn-icon add"
                          title="Manage Lessons"
                        >
                          <FaPlus />
                        </Link>
                      </td>
                      <td>
                        {module.quizzes?.length || 0}
                        <Link 
                          to={`/admin/modules/${module._id}/quizzes`}
                          className="btn-icon add"
                          title="Manage Quizzes"
                        >
                          <FaPlus />
                        </Link>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(module._id, 'up')}
                          disabled={modules.indexOf(module) === 0}
                          title="Move Up"
                        >
                          <FaArrowUp />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(module._id, 'down')}
                          disabled={modules.indexOf(module) === modules.length - 1}
                          title="Move Down"
                        >
                          <FaArrowDown />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEdit(module)}
                          title="Edit Module"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(module._id)}
                          title="Delete Module"
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

export default ModuleManagement; 