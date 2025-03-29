import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import Header from '../Header';
import Footer from '../Footer';
import './Admin.css';

const SubModuleManagement = () => {
  const { moduleId } = useParams();
  const [subModules, setSubModules] = useState([]);
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formMode, setFormMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module: moduleId
  });
  
  useEffect(() => {
    if (moduleId) {
      fetchModule();
      fetchSubModules();
    }
  }, [moduleId]);
  
  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/modules/${moduleId}`);
      setModule(response.data.data);
      
      // Fetch course info if available
      if (response.data.data.course) {
        const courseResponse = await api.get(`/courses/${response.data.data.course}`);
        setCourse(courseResponse.data.data);
      }
      
      setError('');
    } catch (err) {
      console.error("Error fetching module:", err);
      setError('Failed to load module information');
      toast.error('Error loading module information');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubModules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/submodules/module/${moduleId}`);
      setSubModules(response.data.data);
      setError('');
    } catch (err) {
      console.error("Error fetching submodules:", err);
      setError('Failed to load submodules');
      toast.error('Error loading submodules');
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
      module: moduleId
    });
    setFormMode('create');
    setEditId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        await api.post('/submodules', formData);
        toast.success('Sub-module created successfully');
      } else {
        await api.put(`/submodules/${editId}`, formData);
        toast.success('Sub-module updated successfully');
      }
      
      resetForm();
      fetchSubModules();
    } catch (err) {
      console.error("Error saving sub-module:", err);
      toast.error('Failed to save sub-module');
    }
  };
  
  const handleEdit = (subModule) => {
    setFormMode('edit');
    setEditId(subModule._id);
    setFormData({
      title: subModule.title,
      description: subModule.description,
      module: subModule.module
    });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub-module? This will also delete all associated lessons and quizzes.')) {
      return;
    }
    
    try {
      await api.delete(`/submodules/${id}`);
      toast.success('Sub-module deleted successfully');
      fetchSubModules();
    } catch (err) {
      console.error("Error deleting sub-module:", err);
      toast.error('Failed to delete sub-module');
    }
  };
  
  const handleReorder = async (id, direction) => {
    // Find current submodule
    const subModuleIndex = subModules.findIndex(sub => sub._id === id);
    if (subModuleIndex === -1) return;
    
    // Get current and target order
    const currentSubModule = subModules[subModuleIndex];
    let targetIndex;
    
    if (direction === 'up' && subModuleIndex > 0) {
      targetIndex = subModuleIndex - 1;
    } else if (direction === 'down' && subModuleIndex < subModules.length - 1) {
      targetIndex = subModuleIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const targetSubModule = subModules[targetIndex];
    
    // Prepare the reorder request
    try {
      await api.post('/submodules/reorder', {
        moduleId: moduleId,
        subModuleOrders: [
          { id: currentSubModule._id, order: targetSubModule.order },
          { id: targetSubModule._id, order: currentSubModule.order }
        ]
      });
      
      toast.success('Sub-modules reordered successfully');
      fetchSubModules();
    } catch (err) {
      console.error('Error reordering sub-modules:', err);
      toast.error('Failed to reorder sub-modules');
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
              {course ? (
                <Link to={`/admin/courses/${course._id}/modules`}>{course.title}</Link>
              ) : 'Loading...'} {' > '}
              {module ? (
                <Link to={`/admin/courses/${course?._id}/modules`}>{module.title}</Link>
              ) : 'Loading...'} {' > '} Sub-Modules
            </div>
            <h1 className="admin-title">Sub-Module Management</h1>
            <div className="admin-actions">
              <Link to={`/admin/courses/${course?._id}/modules`} className="admin-button">Back to Modules</Link>
            </div>
          </div>
          
          {error && <div className="admin-error">{error}</div>}
          
          <div className="admin-form-container">
            <h2>{formMode === 'create' ? 'Create New Sub-Module' : 'Edit Sub-Module'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="title">Sub-Module Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="e.g., 1.1 What is HTML?"
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
                  placeholder="Brief description of this sub-module"
                  rows="3"
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {formMode === 'create' ? 'Create Sub-Module' : 'Update Sub-Module'}
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
            <h2>Sub-Modules ({subModules.length})</h2>
            {loading ? (
              <div className="admin-loading">Loading sub-modules...</div>
            ) : subModules.length === 0 ? (
              <p>No sub-modules found. Create your first sub-module above.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Lessons</th>
                    <th>Quizzes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subModules.map((subModule) => (
                    <tr key={subModule._id}>
                      <td>{subModule.order}</td>
                      <td>{subModule.title}</td>
                      <td>{subModule.description}</td>
                      <td>
                        {subModule.lessons?.length || 0}
                        <Link 
                          to={`/admin/submodules/${subModule._id}/lessons`}
                          className="btn-icon add"
                          title="Manage Lessons"
                        >
                          <FaPlus />
                        </Link>
                      </td>
                      <td>
                        {subModule.quizzes?.length || 0}
                        <Link 
                          to={`/admin/submodules/${subModule._id}/quizzes`}
                          className="btn-icon add"
                          title="Manage Quizzes"
                        >
                          <FaPlus />
                        </Link>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(subModule._id, 'up')}
                          disabled={subModules.indexOf(subModule) === 0}
                          title="Move Up"
                        >
                          <FaArrowUp />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleReorder(subModule._id, 'down')}
                          disabled={subModules.indexOf(subModule) === subModules.length - 1}
                          title="Move Down"
                        >
                          <FaArrowDown />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEdit(subModule)}
                          title="Edit Sub-Module"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(subModule._id)}
                          title="Delete Sub-Module"
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

export default SubModuleManagement; 