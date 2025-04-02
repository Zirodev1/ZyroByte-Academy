import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import AdminSidebar from '../adminSidebar';

const SubmoduleCreate = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module: moduleId
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    if (moduleId) {
      fetchModuleAndCourse();
    }
  }, [moduleId]);
  
  const fetchModuleAndCourse = async () => {
    try {
      setLoading(true);
      // Fetch module data
      const moduleResponse = await api.get(`/modules/${moduleId}`);
      const moduleData = moduleResponse.data.data;
      setModule(moduleData);
      
      // Fetch course info if available
      if (moduleData.course) {
        const courseResponse = await api.get(`/courses/${moduleData.course}`);
        setCourse(courseResponse.data.data);
      }
    } catch (err) {
      console.error("Error fetching module information:", err);
      toast.error('Error loading module information');
      navigate(`/admin/modules/${moduleId}`);
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
      await api.post('/submodules', formData);
      toast.success('Submodule created successfully');
      navigate(`/admin/modules/${moduleId}/submodules`);
    } catch (err) {
      console.error("Error creating submodule:", err);
      toast.error('Failed to create submodule');
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Header with navigation */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(`/admin/modules/${moduleId}/submodules`)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back to Submodules"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Submodule
              {module && <span className="text-lg text-gray-500 ml-2">for {module.title}</span>}
            </h1>
          </div>
          
          {/* Submodule Creation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Submodule Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1.1 HTML Basics"
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
                  placeholder="Brief description of this submodule's content"
                  rows="4"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/modules/${moduleId}/submodules`)}
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
                  ) : "Create Submodule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmoduleCreate; 