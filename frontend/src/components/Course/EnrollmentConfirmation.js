import React from 'react';
import { Link } from 'react-router-dom';
import './EnrollmentConfirmation.css';

const EnrollmentConfirmation = ({ 
  enrollmentData, 
  onClose, 
  onStartLearning 
}) => {
  if (!enrollmentData) return null;

  const { course, nextSteps } = enrollmentData;

  return (
    <div className="enrollment-confirmation">
      <div className="enrollment-success">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3>Enrollment Successful!</h3>
        <p>You are now enrolled in <strong>{course.title}</strong></p>
      </div>

      <div className="course-preview">
        {course.imageUrl && (
          <div className="course-image">
            <img src={course.imageUrl} alt={course.title} />
          </div>
        )}
        <div className="course-info">
          <h4>{course.title}</h4>
          <div className="course-meta">
            {course.level && <span className="level-badge">{course.level}</span>}
            {course.category && <span className="category-badge">{course.category}</span>}
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h4>What would you like to do next?</h4>
        <div className="action-buttons">
          <button 
            className="start-learning-button" 
            onClick={onStartLearning}
          >
            Start Learning
          </button>
          <Link to={nextSteps.trackProgress} className="view-dashboard-button">
            View Dashboard
          </Link>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentConfirmation; 