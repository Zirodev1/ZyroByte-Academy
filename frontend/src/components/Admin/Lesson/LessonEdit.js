import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import AdminSidebar from '../adminSidebar';
import LessonEditor from '../EditorJS/LessonEditor';

const LessonEdit = () => {
  const { moduleId, subModuleId, lessonId } = useParams();
  const [loading, setLoading] = useState(true);
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
    submodule: subModuleId || ''
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);
  
  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lessons/${lessonId}`);
      const lessonData = response.data.data;
      
      // Parse content if it's JSON format (EditorJS data)
      let editorContent = {blocks: []};
      let contentValue = lessonData.content || '';
      
      try {
        if (contentValue && typeof contentValue === 'string') {
          // Try to parse the content as JSON
          const parsedContent = JSON.parse(contentValue);
          
          // Validate that it has the EditorJS structure (blocks array)
          if (parsedContent && typeof parsedContent === 'object') {
            // If it has blocks property, it's already EditorJS format
            if (Array.isArray(parsedContent.blocks)) {
              editorContent = parsedContent;
            } 
            // If it doesn't have blocks but is an object, it might be older format
            else if (!parsedContent.blocks && typeof parsedContent === 'object') {
              // Try to convert to EditorJS format
              editorContent = {
                blocks: [
                  {
                    type: 'paragraph',
                    data: {
                      text: contentValue
                    }
                  }
                ]
              };
            }
          }
        } else if (contentValue && typeof contentValue === 'string') {
          // If it's a string but not JSON, create a paragraph block
          editorContent = {
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: contentValue
                }
              }
            ]
          };
        }
      } catch (e) {
        console.warn('Could not parse lesson content as JSON:', e);
        // If parsing fails, create a paragraph with the content
        editorContent = {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: contentValue
              }
            }
          ]
        };
      }
      
      console.log('Parsed editor content:', editorContent);
      
      setFormData({
        title: lessonData.title || '',
        content: contentValue,
        editorContent: editorContent,
        type: lessonData.type || 'text',
        duration: lessonData.duration || '',
        videoUrl: lessonData.videoUrl || '',
        isPublished: lessonData.isPublished || false,
        order: lessonData.order || 0,
        module: lessonData.module || moduleId || '',
        submodule: lessonData.submodule || subModuleId || ''
      });
      
      // Fetch parent info (module or submodule)
      if (lessonData.submodule) {
        fetchParentInfo('submodule', lessonData.submodule);
      } else if (lessonData.module) {
        fetchParentInfo('module', lessonData.module);
      }
    } catch (err) {
      console.error("Error fetching lesson:", err);
      toast.error('Failed to load lesson data');
      navigateBack();
    } finally {
      setLoading(false);
    }
  };
  
  const fetchParentInfo = async (type, id) => {
    try {
      const endpoint = type === 'submodule'
        ? `/submodules/${id}`
        : `/modules/${id}`;
      
      const response = await api.get(endpoint);
      setParentInfo({
        type,
        data: response.data.data
      });
    } catch (err) {
      console.error(`Error fetching ${type} info:`, err);
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
    
    try {
      setLoading(true);
      
      // Prepare submission data - use editorContent for rich text
      const submissionData = {
        ...formData,
        content: formData.editorContent ? JSON.stringify(formData.editorContent) : formData.content
      };
      
      await api.put(`/lessons/${lessonId}`, submissionData);
      toast.success('Lesson updated successfully');
      navigateBack();
    } catch (err) {
      console.error("Error updating lesson:", err);
      toast.error(err.response?.data?.message || 'Failed to update lesson');
      setLoading(false);
    }
  };
  
  const navigateBack = () => {
    const returnUrl = formData.submodule
      ? `/admin/submodules/${formData.submodule}/lessons`
      : `/admin/modules/${formData.module}/lessons`;
    navigate(returnUrl);
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
              <p className="mt-2 text-gray-600">Loading lesson data...</p>
            </div>
          ) : (
            <>
              {/* Header with navigation */}
              <div className="flex items-center mb-6">
                <button
                  onClick={navigateBack}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100"
                  title="Back to Lessons"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Lesson: {formData.title}
                  {parentInfo && <span className="text-lg text-gray-500 ml-2">in {parentInfo.data.title}</span>}
                </h1>
              </div>
              
              {/* Lesson Edit Form */}
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
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Content *
                    </label>
                    <div className="border border-gray-300 rounded-md min-h-[400px] w-full" id="editor-container">
                      <LessonEditor 
                        initialData={Object.keys(formData.editorContent).length > 0 ? formData.editorContent : {blocks: []}} 
                        onChange={handleEditorChange}
                        key={`lesson-editor-${lessonId}`}
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
                        Published
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={navigateBack}
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
                      ) : "Update Lesson"}
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

export default LessonEdit; 