import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';
import './CourseViewer.css';
import LessonRenderer from './LessonRenderer';

const CourseViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseResponse = await api.get(`/courses/${courseId}`);
        const course = courseResponse.data;
        setCourse(course);
        
        // Fetch modules for this course
        const modulesResponse = await api.get(`/courses/${courseId}/modules`);
        const modules = modulesResponse.data;
        setModules(modules);

        // Initialize expanded state for all modules
        const initialExpandedState = {};
        modules.forEach(module => {
          initialExpandedState[module._id] = false;
        });
        setExpandedModules(initialExpandedState);
        
        // Get all lessons
        const lessonsResponse = await api.get(`/courses/${courseId}/lessons`);
        const lessons = lessonsResponse.data;
        setLessons(lessons);

        // Set the current lesson based on URL param or default to first lesson
        let currentLesson;
        if (lessonId) {
          currentLesson = lessons.find(lesson => lesson._id === lessonId);
        }
        
        if (!currentLesson && lessons.length > 0) {
          currentLesson = lessons[0];
          navigate(`/courses/${courseId}/lessons/${currentLesson._id}`);
        }
        
        setCurrentLesson(currentLesson);
        
        // If we have a current lesson, expand its parent module
        if (currentLesson) {
          // Find which module contains this lesson
          for (const module of modules) {
            if (module.lessons && module.lessons.includes(currentLesson._id)) {
              setExpandedModules(prev => ({ ...prev, [module._id]: true }));
            }
            
            // Check submodules too
            if (module.subModules) {
              for (const subModule of module.subModules) {
                if (subModule.lessons && subModule.lessons.includes(currentLesson._id)) {
                  setExpandedModules(prev => ({ 
                    ...prev, 
                    [module._id]: true,
                    [`sub_${subModule._id}`]: true 
                  }));
                }
              }
            }
          }
        }
        
        // Get user's progress if logged in
        const token = localStorage.getItem('token');
        if (token) {
          const progressResponse = await api.get(`/users/me/courses/${courseId}/progress`);
          const userProgress = progressResponse.data;
          setProgress(userProgress.progress || 0);
          setCompletedLessons(userProgress.completedLessons || []);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, lessonId, navigate]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleSubModule = (subModuleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [`sub_${subModuleId}`]: !prev[`sub_${subModuleId}`]
    }));
  };

  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
    navigate(`/courses/${courseId}/lessons/${lesson._id}`);
  };

  const markLessonAsCompleted = async () => {
    if (!currentLesson || completedLessons.includes(currentLesson._id)) {
      return; // Already completed or no lesson selected
    }

    try {
      await api.post(`/courses/${courseId}/lessons/${currentLesson._id}/complete`);
      
      // Update local state
      const updatedCompletedLessons = [...completedLessons, currentLesson._id];
      setCompletedLessons(updatedCompletedLessons);
      
      // Calculate new progress percentage
      const newProgress = Math.round((updatedCompletedLessons.length / lessons.length) * 100);
      setProgress(newProgress);

      // If there's a next lesson, navigate to it
      const currentIndex = lessons.findIndex(lesson => lesson._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        handleLessonClick(nextLesson);
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };

  const calculateModuleProgress = (moduleId) => {
    const moduleLesson = modules.find(m => m._id === moduleId);
    if (!moduleLesson || !moduleLesson.lessons || moduleLesson.lessons.length === 0) return 0;
    
    const moduleLessonIds = moduleLesson.lessons;
    const completedModuleLessons = completedLessons.filter(id => moduleLessonIds.includes(id));
    return Math.round((completedModuleLessons.length / moduleLessonIds.length) * 100);
  };

  const findLessonDetails = (lessonId) => {
    return lessons.find(lesson => lesson._id === lessonId);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Loading course content...</h3>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Not Found</h2>
              <p className="text-gray-600 mb-6">Course or lesson not found.</p>
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-right text-gray-500">{progress}% Complete</div>
                  </div>
                </div>
                
                <div className="p-2">
                  {/* Course modules and lessons */}
                  <nav className="space-y-1">
                    {modules.map((module) => (
                      <div key={module._id} className="border rounded-md mb-2 overflow-hidden">
                        <button 
                          className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50"
                          onClick={() => toggleModule(module._id)}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                              <span className="text-xs font-medium">{calculateModuleProgress(module._id)}%</span>
                            </div>
                            <span className="font-medium text-gray-900">{module.title}</span>
                          </div>
                          <svg 
                            className={`h-5 w-5 text-gray-400 transform ${expandedModules[module._id] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {expandedModules[module._id] && (
                          <div className="border-t border-gray-200 bg-gray-50 p-2">
                            {/* Direct module lessons */}
                            {module.lessons && module.lessons.map((lessonId) => {
                              const lesson = findLessonDetails(lessonId);
                              if (!lesson) return null;
                              
                              const isActive = currentLesson._id === lessonId;
                              const isCompleted = completedLessons.includes(lessonId);
                              
                              return (
                                <button 
                                  key={lessonId}
                                  onClick={() => handleLessonClick(lesson)}
                                  className={`flex items-center w-full p-2 text-sm text-left rounded ${
                                    isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <div className="w-5 h-5 mr-3 flex-shrink-0">
                                    {isCompleted ? (
                                      <svg className="text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="truncate">{lesson.title}</span>
                                </button>
                              );
                            })}
                            
                            {/* Submodules */}
                            {module.subModules && module.subModules.map((subModule) => (
                              <div key={subModule._id} className="mt-2 border rounded overflow-hidden">
                                <button
                                  className="flex items-center justify-between w-full p-2 text-sm text-left hover:bg-gray-100"
                                  onClick={() => toggleSubModule(subModule._id)}
                                >
                                  <span className="ml-3 font-medium">{subModule.title}</span>
                                  <svg 
                                    className={`h-4 w-4 text-gray-400 transform ${expandedModules[`sub_${subModule._id}`] ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                
                                {expandedModules[`sub_${subModule._id}`] && (
                                  <div className="border-t border-gray-200 bg-gray-100 p-2">
                                    {subModule.lessons && subModule.lessons.map((lessonId) => {
                                      const lesson = findLessonDetails(lessonId);
                                      if (!lesson) return null;
                                      
                                      const isActive = currentLesson._id === lessonId;
                                      const isCompleted = completedLessons.includes(lessonId);
                                      
                                      return (
                                        <button 
                                          key={lessonId}
                                          onClick={() => handleLessonClick(lesson)}
                                          className={`flex items-center w-full py-2 px-4 text-sm text-left rounded ${
                                            isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                                          }`}
                                        >
                                          <div className="w-5 h-5 mr-3 flex-shrink-0">
                                            {isCompleted ? (
                                              <svg className="text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                              </svg>
                                            ) : (
                                              <svg className="text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            )}
                                          </div>
                                          <span className="truncate">{lesson.title}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                </div>
                
                {currentLesson.videoUrl && (
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <iframe 
                      src={currentLesson.videoUrl.replace('watch?v=', 'embed/')}
                      title={currentLesson.title}
                      className="w-full h-full absolute"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                
                <div className="p-6">
                  <LessonRenderer content={currentLesson.content} />
                  
                  <div className="mt-8 flex items-center justify-between space-x-4">
                    {lessons.findIndex(l => l._id === currentLesson._id) > 0 && (
                      <button 
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
                          if (currentIndex > 0) {
                            handleLessonClick(lessons[currentIndex - 1]);
                          }
                        }}
                      >
                        <span className="flex items-center">
                          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous Lesson
                        </span>
                      </button>
                    )}
                    
                    <button 
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        completedLessons.includes(currentLesson._id) 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={markLessonAsCompleted}
                      disabled={completedLessons.includes(currentLesson._id)}
                    >
                      {completedLessons.includes(currentLesson._id) ? 'Completed ✓' : 'Mark as Complete'}
                    </button>
                    
                    {lessons.findIndex(l => l._id === currentLesson._id) < lessons.length - 1 && (
                      <button 
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
                          if (currentIndex < lessons.length - 1) {
                            handleLessonClick(lessons[currentIndex + 1]);
                          }
                        }}
                      >
                        <span className="flex items-center">
                          Next Lesson
                          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseViewer; 