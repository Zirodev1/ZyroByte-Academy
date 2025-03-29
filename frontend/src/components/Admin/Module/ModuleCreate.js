import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../Course/Sidebar';

const ModuleCreate = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: courseId
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);
  
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data.data);
    } catch (err) {
      console.error("Error fetching course:", err);
      toast.error('Error loading course information');
      navigate(`/admin/courses`);
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await api.post('/modules', formData);
      toast.success('Module created successfully');
      navigate(`/admin/courses/${courseId}/modules`);
    } catch (err) {
      console.error("Error creating module:", err);
      toast.error('Failed to create module');
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
          {/* Header with navigation */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back to Modules"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Module
              {course && <span className="text-lg text-gray-500 ml-2">for {course.title}</span>}
            </h1>
          </div>
          
          {/* Module Creation Form */}
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
                  placeholder="Introduction to HTML"
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
                  placeholder="Learn the basics of HTML structure and elements"
                  rows="4"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
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
                      Creating...
                    </span>
                  ) : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCreate; 