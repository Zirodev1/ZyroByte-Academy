import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import LessonEditor from '../EditorJS/LessonEditor';

const LessonCreate = () => {
  const { moduleId, subModuleId } = useParams();
  const [loading, setLoading] = useState(false);
  const [parentInfo, setParentInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    editorContent: {},
    type: 'text',
    duration: '',
    videoUrl: '',
    isPublished: false,
    order: 0,
    module: moduleId || '',
    subModule: subModuleId || ''
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('Module ID from params:', moduleId);
    console.log('SubModule ID from params:', subModuleId);
    fetchParentInfo();
  }, [moduleId, subModuleId]);
  
  const fetchParentInfo = async () => {
    try {
      const isSubmodule = !!subModuleId;
      const endpoint = isSubmodule 
        ? `/submodules/${subModuleId}` 
        : `/modules/${moduleId}`;
      
      console.log('Fetching parent info from endpoint:', endpoint);
      console.log('Module ID (raw):', moduleId);
      console.log('SubModule ID (raw):', subModuleId);
      
      const response = await api.get(endpoint);
      console.log('Parent info response:', response.data);
      
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

  const handleEditorChange = (data) => {
    // Only update form when we have valid editor data
    if (data && data.blocks && data.blocks.length > 0) {
      console.log('Editor data updated:', data);
      // Use functional update pattern to avoid race conditions
      setFormData(prevState => ({
        ...prevState,
        editorContent: data,
        content: JSON.stringify(data)
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started:', formData);
    
    // Validate form data
    if (!formData.title) {
      toast.error('Lesson title is required');
      return;
    }
    
    setLoading(true); // Set loading first

    try {
      // Ensure we have module ID as a string
      const moduleIdStr = typeof moduleId === 'object' ? moduleId.toString() : moduleId;
      // Ensure we have subModule ID as a string if it exists
      const subModuleIdStr = subModuleId ? 
        (typeof subModuleId === 'object' ? subModuleId.toString() : subModuleId) : 
        null;
      
      console.log('Module ID (processed):', moduleIdStr);
      console.log('SubModule ID (processed):', subModuleIdStr);
      
      // Create a clean submission object with only the needed fields
      const submissionData = {
        title: formData.title,
        type: formData.type,
        duration: formData.duration || 0,
        videoUrl: formData.videoUrl || '',
        isPublished: formData.isPublished || false,
        // Format content as EditorJS data structure
        content: JSON.stringify(
          formData.editorContent && Object.keys(formData.editorContent).length > 0 
            ? formData.editorContent 
            : {blocks: [{type: 'paragraph', data: {text: ''}}]}
        )
      };
      
      // Set the module and subModule fields correctly
      if (subModuleIdStr) {
        // For submodule lessons, we need both module and subModule
        submissionData.module = moduleIdStr;
        submissionData.subModule = subModuleIdStr;
      } else {
        // For module lessons, we only need module
        submissionData.module = moduleIdStr;
      }
      
      console.log('Final submission data:', submissionData);
      
      // Send the request to create the lesson
      const response = await api.post('/lessons', submissionData);
      console.log('Lesson creation response:', response.data);
      
      toast.success('Lesson created successfully');
      
      // Navigate back to lesson list
      const returnUrl = subModuleId
        ? `/admin/submodules/${subModuleIdStr}/lessons`
        : `/admin/modules/${moduleIdStr}/lessons`;
      
      console.log('Navigating to:', returnUrl);
      navigate(returnUrl);
    } catch (err) {
      console.error("Error creating lesson:", err);
      const errorMessage = err.response?.data?.message || 'Failed to create lesson';
      toast.error(errorMessage);
      setLoading(false); // Only reset loading on error
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">

      
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
              
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Content *
                </label>
                <div className="border border-gray-300 rounded-md min-h-[400px] w-full" id="editor-container">
                  <LessonEditor 
                    initialData={{blocks: []}} 
                    onChange={handleEditorChange} 
                    key="lesson-editor-create"
                    placeholder="Start typing your lesson content here..."
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Use the rich text editor to create your lesson content with images, videos, code snippets, and more.
                </p>
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