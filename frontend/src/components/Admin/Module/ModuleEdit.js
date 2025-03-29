import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../Course/Sidebar';

const ModuleEdit = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: ''
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);
  
  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/modules/${moduleId}`);
      const moduleData = response.data.data;
      
      setModule(moduleData);
      setFormData({
        title: moduleData.title || '',
        description: moduleData.description || '',
        course: moduleData.course || ''
      });
      
      // Fetch course information
      if (moduleData.course) {
        fetchCourse(moduleData.course);
      }
    } catch (err) {
      console.error("Error fetching module:", err);
      toast.error('Error loading module information');
      navigate('/admin/courses');
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await api.put(`/modules/${moduleId}`, formData);
      toast.success('Module updated successfully');
      navigate(`/admin/courses/${formData.course}/modules`);
    } catch (err) {
      console.error("Error updating module:", err);
      toast.error('Failed to update module');
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar activePath="/admin/courses" />
      
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
                      Module Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? (
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