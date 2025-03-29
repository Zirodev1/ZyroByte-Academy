import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/users/profile');
        
        setUser(response.data.user);
        if (response.data.user.enrolledCourses) {
          setEnrolledCourses(response.data.user.enrolledCourses);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="dashboard-container">
          <div className="dashboard-content" style={{ textAlign: 'center', padding: '50px' }}>
            Loading your dashboard...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="dashboard-container">
          <div className="dashboard-content" style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/" className="course-button">Return to Home</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Get first letter of user's name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">My Dashboard</h1>
            <p className="welcome-message">Welcome back, {user.name}!</p>
          </div>
          
          <div className="dashboard-sections">
            <div className="dashboard-sidebar">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">{getInitial(user.name)}</div>
                  <h2 className="profile-name">{user.name}</h2>
                  <p className="profile-email">{user.email}</p>
                </div>
                
                <div className="profile-details">
                  <div className="profile-item">
                    <div className="profile-label">Subscription Status</div>
                    <div className="profile-value">
                      <span className={`subscription-status ${user.subscribed ? 'status-subscribed' : 'status-not-subscribed'}`}>
                        {user.subscribed ? 'Premium Member' : 'Free Account'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="profile-item">
                    <div className="profile-label">Courses Enrolled</div>
                    <div className="profile-value">{enrolledCourses.length}</div>
                  </div>
                </div>
                
                {!user.subscribed && (
                  <Link to="/subscription" className="auth-button" style={{ width: '100%', textAlign: 'center' }}>
                    Upgrade to Premium
                  </Link>
                )}
              </div>
              
              <div className="sidebar-nav">
                <div className="nav-title">Navigation</div>
                <ul className="nav-links">
                  <li>
                    <Link to="/dashboard" className="active">
                      <span className="nav-icon">📊</span> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/courses">
                      <span className="nav-icon">📚</span> All Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile">
                      <span className="nav-icon">👤</span> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings">
                      <span className="nav-icon">⚙️</span> Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="dashboard-main">
              <h2>My Courses</h2>
              
              {enrolledCourses.length > 0 ? (
                <div className="courses-container">
                  {enrolledCourses.map((enrollment) => (
                    <div className="course-card" key={enrollment.course._id}>
                      <div className="course-header">
                        <img 
                          src={enrollment.course.imageUrl || "https://images.unsplash.com/photo-1587620962725-abab7fe55159"} 
                          alt={enrollment.course.title} 
                          className="course-image" 
                        />
                        <div className="course-overlay">
                          <h3 className="course-title">{enrollment.course.title}</h3>
                          <div className="course-info">
                            <span>{enrollment.course.level || 'Beginner'}</span>
                            <span>{enrollment.course.duration || '8 weeks'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="course-body">
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                          <div className="progress-text">
                            <span>{enrollment.progress}% complete</span>
                            <span>
                              {enrollment.completedLessons ? enrollment.completedLessons.length : 0} / 
                              {/* Assuming we know the total lessons count */}
                              {4} lessons
                            </span>
                          </div>
                        </div>
                        
                        <div className="course-actions">
                          <Link to={`/courses/${enrollment.course._id}`} className="course-button">
                            {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-courses">
                  <div className="empty-icon">📚</div>
                  <h3 className="empty-title">No courses yet</h3>
                  <p className="empty-description">
                    You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
                  </p>
                  <Link to="/courses" className="browse-button">Browse Courses</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;