import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus } from "react-icons/fa";

// Import components
import Sidebar from "../Course/Sidebar";
import ModuleForm from "./ModuleForm";
import ModuleList from "./ModuleList";
import ModuleStats from "./ModuleStats";

const ModuleManagement = () => {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    order: 0,
    duration: 0,
    isPublished: false
  });
  const [editing, setEditing] = useState(false);
  const [moduleId, setModuleId] = useState(null);
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
      setModules(response.data.data);
      setError("");
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError("Failed to load modules");
      toast.error("Error loading modules");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const moduleData = {
        ...form,
        courseId: courseId
      };

      if (editing) {
        await api.put(`/modules/${moduleId}`, moduleData);
        toast.success("Module updated successfully");
      } else {
        await api.post(`/courses/${courseId}/modules`, moduleData);
        toast.success("Module created successfully");
      }

      resetForm();
      fetchModules();
    } catch (error) {
      console.error("Error saving module:", error);
      toast.error(error.response?.data?.message || (editing ? "Failed to update module" : "Failed to create module"));
      setLoading(false);
    }
  };

  const handleEdit = (module) => {
    setForm({
      title: module.title || "",
      description: module.description || "",
      order: module.order || 0,
      duration: module.duration || 0,
      isPublished: module.isPublished || false
    });
    setEditing(true);
    setModuleId(module._id);

    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module? This will also delete all associated lessons and quizzes.")) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/modules/${id}`);
      toast.success("Module deleted successfully");
      fetchModules();
    } catch (err) {
      console.error("Error deleting module:", err);
      toast.error("Failed to delete module");
      setLoading(false);
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
      
      toast.success("Modules reordered successfully");
      fetchModules();
    } catch (err) {
      console.error('Error reordering modules:', err);
      toast.error("Failed to reorder modules");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      order: modules.length,
      duration: 0,
      isPublished: false
    });
    setEditing(false);
    setModuleId(null);
  };

  const handleCreateModule = () => {
    navigate(`/admin/courses/${courseId}/modules/create`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar activePath="/admin/courses" />

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
                    {course.level && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {course.level}
                      </span>
                    )}
                    {course.category && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {course.category}
                      </span>
                    )}
                    {course.featured && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Module Statistics */}
          <ModuleStats 
            course={course} 
            moduleCount={modules.length} 
            loading={statsLoading} 
          />
          
          {/* Module List */}
          <ModuleList 
            modules={modules}
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

export default ModuleManagement; 