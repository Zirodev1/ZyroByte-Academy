import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/UI/Modal';
import EnrollmentConfirmation from './EnrollmentConfirmation';
import './CourseDetail.css';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [previewMode, setPreviewMode] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [deviceType, setDeviceType] = useState('desktop');
    const [referralSource, setReferralSource] = useState('direct');
  
    // Detect device type on component mount
    useEffect(() => {
      const detectDeviceType = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
          return 'tablet';
        } else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
          return 'mobile';
        }
        return 'desktop';
      };
      
      setDeviceType(detectDeviceType());
      
      // Try to determine referral source
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source') || 'direct';
      setReferralSource(source);
    }, []);
    
    useEffect(() => {
      const fetchCourse = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/courses/${id}`);
          setCourse(response.data);
          
          // Check enrollment status if user is logged in
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const userResponse = await api.get('/users/me', {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Check if user is enrolled in this course
              const enrolledCourses = userResponse.data.enrolledCourses || [];
              const enrolled = enrolledCourses.some(enrollment => 
                enrollment.course === id || enrollment.course._id === id
              );
              
              setIsEnrolled(enrolled);
              setPreviewMode(!enrolled);
            } catch (err) {
              console.log('Error fetching user data:', err);
              // If user data can't be fetched, assume preview mode
              setPreviewMode(true);
            }
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching course:', error);
          setError('Error fetching course');
          setLoading(false);
        }
      };
  
      fetchCourse();
    }, [id]);

    const handleEnroll = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Include analytics data
        const enrollmentRequest = {
          referralSource,
          deviceType
        };

        const response = await api.post(`/courses/${id}/enroll`, enrollmentRequest, {
          headers: { Authorization: `Bearer ${token}`},
        });
        
        setIsEnrolled(true);
        setPreviewMode(false);
        setEnrollmentData(response.data);
        setShowModal(true);
      } catch (error){
        console.log('Error enrolling in course: ', error);
        if (error.response && error.response.status === 400) {
          // User is already enrolled
          setIsEnrolled(true);
          setPreviewMode(false);
          alert(error.response.data.message || 'You are already enrolled in this course');
        } else {
          alert('Error enrolling in course. Please try again.');
        }
      }
    };
    
    const handleStartLearning = () => {
      if (enrollmentData && enrollmentData.nextSteps) {
        navigate(enrollmentData.nextSteps.startLearning);
      } else if (course && course.lessons && course.lessons.length > 0) {
        navigate(`/courses/${id}/lessons`);
      }
      setShowModal(false);
    };
  
    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!course) return <div className="not-found-message">Course not found</div>;
  
    // Get preview content - show only first lesson and quiz
    const previewLessons = previewMode ? course.lessons.slice(0, 1) : course.lessons;
    const previewQuizzes = previewMode ? course.quizzes.slice(0, 1) : course.quizzes;
  
    return (
      <div>
        <Header />
        <main className="course-detail-container">
          <div className="course-header">
            <h2>{course.title}</h2>
            <div className="course-meta">
              <span>Level: {course.level || 'All Levels'}</span>
              <span>Category: {course.category || 'General'}</span>
              <span>Duration: {course.duration || 'Self-paced'}</span>
              {course.enrollmentCount > 0 && (
                <span>Students: {course.enrollmentCount}</span>
              )}
            </div>
            <p className="course-description">{course.description}</p>
            
            {previewMode && (
              <div className="preview-notice">
                <p>You are viewing this course in preview mode. Enroll to access all content.</p>
                <button className="enroll-button" onClick={handleEnroll}>
                  Enroll Now
                </button>
              </div>
            )}
            
            {!isEnrolled && !previewMode && (
              <button className="enroll-button" onClick={handleEnroll}>
                Enroll
              </button>
            )}
            
            {isEnrolled && (
              <div className="enrolled-status">
                <p>You are enrolled in this course</p>
                <Link to={`/courses/${id}/lessons`} className="start-learning-button">
                  Start Learning
                </Link>
              </div>
            )}
          </div>
          
          <div className="course-content">
            <h3>Lessons {previewMode && <span className="preview-badge">Preview</span>}</h3>
            {previewLessons.length > 0 ? (
              <ul className="lessons-list">
                {previewLessons.map((lesson) => (
                  <li key={lesson._id} className="lesson-item">
                    <h4>{lesson.title}</h4>
                    <p>{lesson.description}</p>
                    {isEnrolled && lesson.videoUrl && (
                      <div className="lesson-preview">
                        <Link to={`/courses/${id}/lessons/${lesson._id}`}>
                          View Lesson
                        </Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No lessons available for this course yet.</p>
            )}
            
            {previewMode && course.lessons.length > 1 && (
              <p className="more-content">
                +{course.lessons.length - 1} more lessons available after enrollment
              </p>
            )}
          </div>
          
          <div className="course-quizzes">
            <h3>Quizzes {previewMode && <span className="preview-badge">Preview</span>}</h3>
            {previewQuizzes.length > 0 ? (
              <ul className="quizzes-list">
                {previewQuizzes.map((quiz) => (
                  <li key={quiz._id} className="quiz-item">
                    <h4>{quiz.title}</h4>
                    {isEnrolled && (
                      <Link to={`/courses/${course._id}/quizzes/${quiz._id}`}>
                        Take Quiz
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No quizzes available for this course yet.</p>
            )}
            
            {previewMode && course.quizzes.length > 1 && (
              <p className="more-content">
                +{course.quizzes.length - 1} more quizzes available after enrollment
              </p>
            )}
          </div>
        </main>
        
        {/* Enrollment Confirmation Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Enrollment Successful"
          size="medium"
        >
          <EnrollmentConfirmation
            enrollmentData={enrollmentData}
            onClose={() => setShowModal(false)}
            onStartLearning={handleStartLearning}
          />
        </Modal>
        
        <Footer />
      </div>
    );
  };

export default CourseDetails;