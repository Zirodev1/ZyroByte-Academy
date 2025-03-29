import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

// Import components
import Sidebar from '../Course/Sidebar';
import LessonList from './LessonList';
import LessonStats from './LessonStats';

const LessonManagement = () => {
  const { moduleId, subModuleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [parentInfo, setParentInfo] = useState({
    type: subModuleId ? 'submodule' : 'module',
    id: subModuleId || moduleId,
    data: null
  });
  const [courseInfo, setCourseInfo] = useState(null);
  const [error, setError] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const [avgCompletion, setAvgCompletion] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParentInfo();
    fetchLessons();
  }, [moduleId, subModuleId]);

  const fetchParentInfo = async () => {
    try {
      const isSubmodule = !!subModuleId;
      const endpoint = isSubmodule 
        ? `/submodules/${subModuleId}` 
        : `/modules/${moduleId}`;
      
      const response = await api.get(endpoint);
      const parentData = response.data.data;
      
      setParentInfo({
        type: isSubmodule ? 'submodule' : 'module',
        id: isSubmodule ? subModuleId : moduleId,
        data: parentData
      });

      // Fetch course info if we have module
      if (!isSubmodule && parentData.course) {
        fetchCourseInfo(parentData.course);
      } else if (isSubmodule && parentData.module) {
        // We have a submodule, get its module first
        const moduleResponse = await api.get(`/modules/${parentData.module}`);
        const moduleData = moduleResponse.data.data;
        
        if (moduleData.course) {
          fetchCourseInfo(moduleData.course);
        }
      }
    } catch (err) {
      console.error("Error fetching parent info:", err);
      toast.error('Failed to load content information');
      setError('Failed to load content information');
    }
  };

  const fetchCourseInfo = async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourseInfo(response.data.data);
    } catch (err) {
      console.error("Error fetching course info:", err);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const endpoint = subModuleId 
        ? `/lessons/submodule/${subModuleId}` 
        : `/lessons/module/${moduleId}`;
      
      const response = await api.get(endpoint);
      const lessonData = response.data.data || [];
      setLessons(lessonData);
      
      // Calculate stats from lesson data
      calculateStats(lessonData);
      setError(null);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      toast.error('Failed to load lessons');
      setError('Failed to load lessons');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };
  
  const calculateStats = (lessonData) => {
    if (!lessonData || lessonData.length === 0) {
      setTotalViews(0);
      setAvgCompletion(0);
      return;
    }
    
    // Calculate total views
    const views = lessonData.reduce((sum, lesson) => sum + (lesson.viewCount || 0), 0);
    setTotalViews(views);
    
    // Calculate average completion rate
    const totalCompletionRate = lessonData.reduce((sum, lesson) => sum + (lesson.completionRate || 0), 0);
    const avgRate = lessonData.length > 0 ? Math.round(totalCompletionRate / lessonData.length) : 0;
    setAvgCompletion(avgRate);
  };

  const handleEdit = (lesson) => {
    const baseUrl = subModuleId 
      ? `/admin/submodules/${subModuleId}/lessons/edit/${lesson._id}` 
      : `/admin/modules/${moduleId}/lessons/edit/${lesson._id}`;
    navigate(baseUrl);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/lessons/${id}`);
      toast.success('Lesson deleted successfully');
      fetchLessons();
    } catch (err) {
      console.error("Error deleting lesson:", err);
      toast.error('Failed to delete lesson');
      setLoading(false);
    }
  };
  
  const handleReorder = async (id, direction) => {
    // Find current lesson
    const lessonIndex = lessons.findIndex(lesson => lesson._id === id);
    if (lessonIndex === -1) return;
    
    // Get current and target order
    const currentLesson = lessons[lessonIndex];
    let targetIndex;
    
    if (direction === 'up' && lessonIndex > 0) {
      targetIndex = lessonIndex - 1;
    } else if (direction === 'down' && lessonIndex < lessons.length - 1) {
      targetIndex = lessonIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const targetLesson = lessons[targetIndex];
    
    // Prepare the reorder request
    try {
      const parentIdParam = subModuleId ? { submoduleId: subModuleId } : { moduleId: moduleId };
      
      await api.post('/lessons/reorder', {
        ...parentIdParam,
        lessonOrders: [
          { id: currentLesson._id, order: targetLesson.order },
          { id: targetLesson._id, order: currentLesson.order }
        ]
      });
      
      toast.success('Lessons reordered successfully');
      fetchLessons();
    } catch (err) {
      console.error('Error reordering lessons:', err);
      toast.error('Failed to reorder lessons');
    }
  };
  
  const handlePreview = (lesson) => {
    // Open lesson preview (this could navigate to a preview URL or open a modal)
    if (lesson.previewUrl) {
      window.open(lesson.previewUrl, '_blank');
    } else {
      toast.info('Lesson preview not available');
    }
  };

  const handleCreateLesson = () => {
    const baseUrl = subModuleId 
      ? `/admin/submodules/${subModuleId}/lessons/create` 
      : `/admin/modules/${moduleId}/lessons/create`;
    navigate(baseUrl);
  };
  
  const getBackUrl = () => {
    if (subModuleId) {
      return `/admin/modules/${parentInfo.data?.module}/submodules`;
    } else if (moduleId && courseInfo) {
      return `/admin/courses/${courseInfo._id}/modules`;
    } else {
      return '/admin/courses';
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
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(getBackUrl())}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Lessons: {parentInfo.data?.title || 'Loading...'}
              </h1>
              <p className="text-sm text-gray-500">
                Manage lessons for this {parentInfo.type}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div></div> {/* Empty div for flex spacing */}
            <button
              onClick={handleCreateLesson}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Create New Lesson
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {/* Parent Info Card */}
          {parentInfo.data && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-2">{parentInfo.data.title}</h2>
                <p className="text-gray-700 mb-4">
                  {parentInfo.data.description && parentInfo.data.description.length > 200
                    ? `${parentInfo.data.description.substring(0, 200)}...`
                    : parentInfo.data.description}
                </p>
                <div className="flex space-x-4">
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {parentInfo.type}: {parentInfo.data.title}
                  </span>
                  {courseInfo && (
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Course: {courseInfo.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Lesson Statistics */}
          <LessonStats 
            parentData={parentInfo}
            lessonCount={lessons.length}
            totalViews={totalViews} 
            avgCompletion={avgCompletion}
            loading={statsLoading} 
          />
          
          {/* Lesson List */}
          <LessonList 
            lessons={lessons}
            loading={loading}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleReorder={handleReorder}
            handlePreview={handlePreview}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonManagement; 