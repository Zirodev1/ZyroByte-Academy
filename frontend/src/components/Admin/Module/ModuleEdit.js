import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import AdminSidebar from '../adminSidebar';

const ModuleEdit = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    order: 0,
    duration: 0,
    isPublished: false
  });
  const [formError, setFormError] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);
  
  const fetchModule = async () => {
    try {
      setLoading(true);
      console.log("Fetching module with ID:", moduleId);
      const response = await api.get(`/modules/${moduleId}`);
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response format from API");
      }
      
      const moduleData = response.data.data;
      console.log("Module data:", moduleData);
      
      setModule(moduleData);
      setFormData({
        title: moduleData.title || '',
        description: moduleData.description || '',
        course: moduleData.course || '',
        order: moduleData.order || 0,
        duration: moduleData.duration || 0,
        isPublished: moduleData.isPublished || false
      });
      
      // Fetch course information
      if (moduleData.course) {
        fetchCourse(moduleData.course);
      }
    } catch (err) {
      console.error("Error fetching module:", err);
      const errorMessage = err.response?.data?.message || 'Error loading module information';
      toast.error(errorMessage);
      
      // Navigate back after error
      setTimeout(() => {
        navigate('/admin/courses');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCourse = async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data.data);
    } catch (err) {
      console.error("Error fetching course:", err);
      toast.error('Error loading course information');
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.order < 0) {
      errors.order = 'Order must be a positive number';
    }
    
    if (formData.duration < 0) {
      errors.duration = 'Duration must be a positive number';
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) || 0 : value
    });
    
    // Clear validation error when field is changed
    if (formError[name]) {
      setFormError({
        ...formError,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      setSaving(true);
      console.log("Updating module with data:", formData);
      
      const response = await api.put(`/modules/${moduleId}`, formData);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }
      
      toast.success('Module updated successfully');
      
      // Navigate back to module management
      navigate(`/admin/courses/${formData.course}/modules`);
    } catch (err) {
      console.error("Error updating module:", err);
      const errorMessage = err.response?.data?.message || 'Failed to update module';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading module data...</p>
            </div>
          ) : (
            <>
              {/* Header with navigation */}
              <div className="flex items-center mb-6">
                <button
                  onClick={() => navigate(`/admin/courses/${formData.course}/modules`)}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100"
                  title="Back to Modules"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Module
                  {course && <span className="text-lg text-gray-500 ml-2">in {course.title}</span>}
                </h1>
              </div>
              
              {/* Module Edit Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Module Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formError.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {formError.title && (
                      <p className="mt-1 text-sm text-red-500">{formError.title}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formError.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      rows="4"
                    />
                    {formError.description && (
                      <p className="mt-1 text-sm text-red-500">{formError.description}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap -mx-2 mb-4">
                    <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        min="0"
                        value={formData.order}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formError.order ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formError.order && (
                        <p className="mt-1 text-sm text-red-500">{formError.order}</p>
                      )}
                    </div>
                    
                    <div className="w-full md:w-1/2 px-2">
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        min="0"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formError.duration ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {formError.duration && (
                        <p className="mt-1 text-sm text-red-500">{formError.duration}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Publish module (make visible to students)</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/courses/${formData.course}/modules`)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : "Update Module"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleEdit; 