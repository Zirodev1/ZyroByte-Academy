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
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseResponse = await api.get(`/courses/${courseId}`);
        const course = courseResponse.data;
        setCourse(course);
        
        // Get lessons
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
  }, [courseId, lessonId, navigate, completedLessons]);

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

  if (loading) {
    return (
      <div>
        <Header />
        <div className="course-viewer-container">
          <div className="loading">Loading course content...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="course-viewer-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div>
        <Header />
        <div className="course-viewer-container">
          <div className="error-message">Course or lesson not found.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="course-viewer-container">
        <div className="course-sidebar">
          <div className="course-info">
            <h2 className="course-title">{course.title}</h2>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-text">{progress}% Complete</div>
            </div>
          </div>
          
          <nav className="lessons-nav">
            <h3>Lessons</h3>
            <ul>
              {lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson._id);
                const isActive = currentLesson && currentLesson._id === lesson._id;
                
                return (
                  <li 
                    key={lesson._id} 
                    className={`lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <button onClick={() => handleLessonClick(lesson)}>
                      {isCompleted && <span className="completion-icon">✓</span>}
                      {lesson.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {course.quizzes && course.quizzes.length > 0 && (
            <div className="course-quizzes">
              <h3>Quizzes</h3>
              <ul>
                {course.quizzes.map((quiz) => (
                  <li key={quiz._id} className="quiz-item">
                    <Link to={`/courses/${courseId}/quizzes/${quiz._id}`}>
                      {quiz.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="lesson-content">
          <div className="lesson-header">
            <h2>{currentLesson.title}</h2>
          </div>
          
          {currentLesson.videoUrl && (
            <div className="video-container">
              <iframe 
                src={currentLesson.videoUrl.replace('watch?v=', 'embed/')}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          <div className="lesson-text">
            <LessonRenderer content={currentLesson.content} />
          </div>
          
          <div className="lesson-navigation">
            {lessons.findIndex(l => l._id === currentLesson._id) > 0 && (
              <button 
                className="nav-button previous"
                onClick={() => {
                  const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
                  if (currentIndex > 0) {
                    handleLessonClick(lessons[currentIndex - 1]);
                  }
                }}
              >
                Previous Lesson
              </button>
            )}
            
            <button 
              className="complete-button"
              onClick={markLessonAsCompleted}
              disabled={completedLessons.includes(currentLesson._id)}
            >
              {completedLessons.includes(currentLesson._id) ? 'Completed' : 'Mark as Complete'}
            </button>
            
            {lessons.findIndex(l => l._id === currentLesson._id) < lessons.length - 1 && (
              <button 
                className="nav-button next"
                onClick={() => {
                  const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
                  if (currentIndex < lessons.length - 1) {
                    handleLessonClick(lessons[currentIndex + 1]);
                  }
                }}
              >
                Next Lesson
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseViewer; 