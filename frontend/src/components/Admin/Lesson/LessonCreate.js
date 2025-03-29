import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../Course/Sidebar';

const LessonCreate = () => {
  const { moduleId, subModuleId } = useParams();
  const [loading, setLoading] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text',
    duration: '',
    videoUrl: '',
    isPublished: false,
    order: 0,
    module: moduleId || '',
    submodule: subModuleId || ''
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchParentInfo();
  }, [moduleId, subModuleId]);
  
  const fetchParentInfo = async () => {
    try {
      const isSubmodule = !!subModuleId;
      const endpoint = isSubmodule 
        ? `/submodules/${subModuleId}` 
        : `/modules/${moduleId}`;
      
      const response = await api.get(endpoint);
      setParentInfo({
        type: isSubmodule ? 'submodule' : 'module',
        data: response.data.data
      });
    } catch (err) {
      console.error("Error fetching parent info:", err);
      toast.error('Error loading parent information');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await api.post('/lessons', formData);
      toast.success('Lesson created successfully');
      
      // Navigate back to lesson list
      const returnUrl = subModuleId
        ? `/admin/submodules/${subModuleId}/lessons`
        : `/admin/modules/${moduleId}/lessons`;
      navigate(returnUrl);
    } catch (err) {
      console.error("Error creating lesson:", err);
      toast.error(err.response?.data?.message || 'Failed to create lesson');
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
              onClick={() => {
                const returnUrl = subModuleId
                  ? `/admin/submodules/${subModuleId}/lessons`
                  : `/admin/modules/${moduleId}/lessons`;
                navigate(returnUrl);
              }}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back to Lessons"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Lesson
              {parentInfo && <span className="text-lg text-gray-500 ml-2">for {parentInfo.data.title}</span>}
            </h1>
          </div>
          
          {/* Lesson Creation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter lesson title"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="presentation">Presentation</option>
                  <option value="interactive">Interactive</option>
                </select>
              </div>
              
              {formData.type === 'video' && (
                <div className="mb-4">
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/video"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter duration in minutes"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter lesson content or description"
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                    Publish immediately (otherwise saved as draft)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const returnUrl = subModuleId
                      ? `/admin/submodules/${subModuleId}/lessons`
                      : `/admin/modules/${moduleId}/lessons`;
                    navigate(returnUrl);
                  }}
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
                  ) : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonCreate; 