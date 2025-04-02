import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import AdminSidebar from '../adminSidebar';
// Import components

import SubmoduleList from './SubmoduleList';
import SubmoduleStats from './SubmoduleStats';

const SubmoduleManagement = () => {
  const { moduleId } = useParams();
  const [submodules, setSubmodules] = useState([]);
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (moduleId) {
      fetchModule();
      fetchSubmodules();
    }
  }, [moduleId]);
  
  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/modules/${moduleId}`);
      const moduleData = response.data.data;
      setModule(moduleData);
      
      // Fetch course info if available
      if (moduleData.course) {
        const courseResponse = await api.get(`/courses/${moduleData.course}`);
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
  
  const fetchSubmodules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/submodules/module/${moduleId}`);
      setSubmodules(response.data.data);
      setError('');
    } catch (err) {
      console.error("Error fetching submodules:", err);
      setError('Failed to load submodules');
      toast.error('Error loading submodules');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (submodule) => {
    navigate(`/admin/submodules/edit/${submodule._id}`);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submodule? This will also delete all associated lessons and quizzes.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/submodules/${id}`);
      toast.success('Submodule deleted successfully');
      fetchSubmodules();
    } catch (err) {
      console.error("Error deleting submodule:", err);
      toast.error('Failed to delete submodule');
      setLoading(false);
    }
  };
  
  const handleReorder = async (id, direction) => {
    // Find current submodule
    const submoduleIndex = submodules.findIndex(sub => sub._id === id);
    if (submoduleIndex === -1) return;
    
    // Get current and target order
    const currentSubmodule = submodules[submoduleIndex];
    let targetIndex;
    
    if (direction === 'up' && submoduleIndex > 0) {
      targetIndex = submoduleIndex - 1;
    } else if (direction === 'down' && submoduleIndex < submodules.length - 1) {
      targetIndex = submoduleIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const targetSubmodule = submodules[targetIndex];
    
    // Prepare the reorder request
    try {
      await api.post('/submodules/reorder', {
        moduleId: moduleId,
        submoduleOrders: [
          { id: currentSubmodule._id, order: targetSubmodule.order },
          { id: targetSubmodule._id, order: currentSubmodule.order }
        ]
      });
      
      toast.success('Submodules reordered successfully');
      fetchSubmodules();
    } catch (err) {
      console.error('Error reordering submodules:', err);
      toast.error('Failed to reorder submodules');
    }
  };

  const handleCreateSubmodule = () => {
    navigate(`/admin/modules/${moduleId}/submodules/create`);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Header with navigation */}
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(`/admin/courses/${course?._id}/modules`)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back to Modules"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {module ? `${module.title}: Submodules` : 'Submodule Management'}
              </h1>
              {module && (
                <p className="text-sm text-gray-500">
                  Manage submodules for this module
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div></div> {/* Empty div for flex spacing */}
            <button
              onClick={handleCreateSubmodule}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Create New Submodule
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {/* Module Info Card */}
          {module && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-2">{module.title}</h2>
                <p className="text-gray-700 mb-4">
                  {module.description && module.description.length > 200
                    ? `${module.description.substring(0, 200)}...`
                    : module.description}
                </p>
                <div className="flex space-x-4">
                  {course && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      Course: {course.title}
                    </span>
                  )}
                  {module.duration && (
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Duration: {module.duration} mins
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Submodule Statistics */}
          <SubmoduleStats 
            module={module} 
            submoduleCount={submodules.length} 
            loading={statsLoading} 
          />
          
          {/* Submodule List */}
          <SubmoduleList 
            submodules={submodules}
            loading={loading}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleReorder={handleReorder}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmoduleManagement; 