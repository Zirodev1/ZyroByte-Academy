import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import AdminSidebar from "../adminSidebar";
// Import components

import ModuleList from "./ModuleList";
import ModuleStats from "./ModuleStats";

const ModuleManagement = () => {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");
  const { courseId } = useParams();
  const navigate = useNavigate();

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
      setError("");
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Failed to load course information");
      toast.error("Error loading course information");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/modules/course/${courseId}`);
      // Sort modules by order
      const sortedModules = response.data.data.sort((a, b) => a.order - b.order);
      setModules(sortedModules);
      setError("");
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError("Failed to load modules");
      toast.error("Error loading modules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = () => {
    navigate(`/admin/courses/${courseId}/modules/create`);
  };

  const handleEditModule = (module) => {
    navigate(`/admin/modules/edit/${module._id}`);
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      setLoading(true);
      await api.delete(`/modules/${moduleId}`);
      toast.success("Module deleted successfully");
      fetchModules();
    } catch (err) {
      console.error("Error deleting module:", err);
      toast.error(err.response?.data?.message || "Failed to delete module");
      setLoading(false);
    }
  };

  const handleReorderModules = async (moduleId, direction) => {
    // Find current module
    const moduleIndex = modules.findIndex(mod => mod._id === moduleId);
    if (moduleIndex === -1) return;
    
    // Get current and target order
    let targetIndex;
    
    if (direction === 'up' && moduleIndex > 0) {
      targetIndex = moduleIndex - 1;
    } else if (direction === 'down' && moduleIndex < modules.length - 1) {
      targetIndex = moduleIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const currentModule = modules[moduleIndex];
    const targetModule = modules[targetIndex];
    
    try {
      setLoading(true);
      
      // Swap the order of the modules
      const updatedModules = [...modules];
      
      // Create temporary order values to prevent constraint violations
      const tempOrder = -1;
      
      // Update orders in the frontend immediately for better UX
      updatedModules[moduleIndex] = { ...currentModule, order: tempOrder };
      updatedModules[targetIndex] = { ...targetModule, order: currentModule.order };
      updatedModules[moduleIndex] = { ...currentModule, order: targetModule.order };
      
      setModules(updatedModules.sort((a, b) => a.order - b.order));
      
      // Prepare the reorder request to backend
      await api.post('/modules/reorder', {
        courseId,
        moduleOrders: [
          { id: currentModule._id, order: targetModule.order },
          { id: targetModule._id, order: currentModule.order }
        ]
      });
      
      toast.success("Modules reordered successfully");
      fetchModules(); // Refresh the modules to ensure correct order
    } catch (err) {
      console.error('Error reordering modules:', err);
      toast.error("Failed to reorder modules");
      fetchModules(); // Reset to original order on error
    } finally {
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
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/admin/courses')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back to Courses"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {course ? `${course.title}: Modules` : 'Module Management'}
              </h1>
              {course && (
                <p className="text-sm text-gray-500">
                  Manage modules for this course
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div></div> {/* Empty div for flex spacing */}
            <button
              onClick={handleCreateModule}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Create New Module
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {/* Course Info Card */}
          {course && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start">
                {course.imageUrl && (
                  <div className="mr-6">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                  <p className="text-gray-700 mb-4">
                    {course.description && course.description.length > 200
                      ? `${course.description.substring(0, 200)}...`
                      : course.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                      {course.level || 'All Levels'}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                      {course.duration || 'Self-paced'} duration
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">
                      {course.category || 'Uncategorized'} category
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Module Stats */}
          <ModuleStats
            courseId={courseId}
            loading={statsLoading}
          />
          
          {/* Module List */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Course Modules ({modules.length})</h2>
            <ModuleList 
              modules={modules} 
              courseId={courseId}
              handleEdit={handleEditModule}
              handleDelete={handleDeleteModule}
              handleReorder={handleReorderModules}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleManagement; 