import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Header from '../Header';
import Footer from '../Footer';
import './Admin.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [formMode, setFormMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  
  // Fetch categories on component mount and when page changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories?page=${currentPage}&limit=10`);
      
      setCategories(response.data.data);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Error fetching categories');
      console.error('Error fetching categories:', err);
      setLoading(false);
      toast.error('Failed to load categories');
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
      name: '',
      description: '',
      imageUrl: ''
    });
    setFormMode('create');
    setEditId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      } else {
        await api.put(`/categories/${editId}`, formData);
        toast.success('Category updated successfully');
      }
      
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Error submitting category:', err);
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };
  
  const handleEdit = (category) => {
    setFormMode('edit');
    setEditId(category._id);
    setFormData({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || ''
    });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };
  
  const handleReorder = async (id, direction) => {
    // Find current category
    const categoryIndex = categories.findIndex(cat => cat._id === id);
    if (categoryIndex === -1) return;
    
    // Get current and target order
    const currentCategory = categories[categoryIndex];
    let targetIndex;
    
    if (direction === 'up' && categoryIndex > 0) {
      targetIndex = categoryIndex - 1;
    } else if (direction === 'down' && categoryIndex < categories.length - 1) {
      targetIndex = categoryIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const targetCategory = categories[targetIndex];
    
    // Prepare the reorder request
    try {
      await api.post('/categories/reorder', {
        categoryOrders: [
          { id: currentCategory._id, order: targetCategory.featuredOrder },
          { id: targetCategory._id, order: currentCategory.featuredOrder }
        ]
      });
      
      toast.success('Categories reordered successfully');
      fetchCategories();
    } catch (err) {
      console.error('Error reordering categories:', err);
      toast.error('Failed to reorder categories');
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  if (loading && categories.length === 0) {
    return <div className="admin-loading">Loading categories...</div>;
  }
  
  if (error) {
    return <div className="admin-error">{error}</div>;
  }
  
  return (
    <div>
      <Header />
      <div className="admin-container">
        <div className="admin-content">
          <div className="admin-header">
            <div className="admin-breadcrumb">
              <Link to="/admin">Dashboard</Link> {' > '} Course Categories
            </div>
            <h1 className="admin-title">Course Category Management</h1>
            <div className="admin-actions">
              <Link to="/admin" className="admin-button">Back to Dashboard</Link>
            </div>
          </div>
          
          <p className="admin-description">
            Create and manage course categories for organizing your courses.
          </p>
          
          <div className="admin-form-container">
            <h3>{formMode === 'create' ? 'Create New Category' : 'Edit Category'}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="name">Category Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Frontend Development"
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
                  placeholder="Learn everything about frontend development"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {formMode === 'create' ? 'Create Category' : 'Update Category'}
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
            <h3>Categories ({categories.length})</h3>
            {categories.length === 0 ? (
              <p>No categories found. Create your first category above.</p>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category._id}>
                        <td>{category.featuredOrder}</td>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td className="actions-cell">
                          <button 
                            className="btn-icon" 
                            onClick={() => handleReorder(category._id, 'up')}
                            disabled={categories.indexOf(category) === 0}
                          >
                            <FaArrowUp />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleReorder(category._id, 'down')}
                            disabled={categories.indexOf(category) === categories.length - 1}
                          >
                            <FaArrowDown />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEdit(category)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-icon delete" 
                            onClick={() => handleDelete(category._id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryManagement; 