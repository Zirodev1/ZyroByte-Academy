import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    quizzesTaken: 0,
    avgQuizScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    interests: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/users/profile');
        
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          bio: userData.bio || '',
          interests: userData.interests || [],
        });

        // Calculate statistics from enrolled courses
        if (userData.enrolledCourses && userData.enrolledCourses.length > 0) {
          const totalCourses = userData.enrolledCourses.length;
          const completedCourses = userData.enrolledCourses.filter(
            course => course.progress === 100
          ).length;
          
          let totalLessons = 0;
          let completedLessons = 0;
          let quizzesTaken = 0;
          let totalQuizScore = 0;
          
          userData.enrolledCourses.forEach(enrollment => {
            // Count lessons
            if (enrollment.completedLessons) {
              completedLessons += enrollment.completedLessons.length;
            }
            
            // Count total lessons (we'd need to fetch this from the API in a real app)
            // For now, let's estimate based on the progress
            if (enrollment.progress > 0) {
              const estimatedTotalLessons = Math.ceil(
                (enrollment.completedLessons?.length || 0) / (enrollment.progress / 100)
              );
              totalLessons += estimatedTotalLessons;
            }
            
            // Quiz data
            if (enrollment.quizResults) {
              quizzesTaken += enrollment.quizResults.length;
              totalQuizScore += enrollment.quizResults.reduce(
                (sum, quiz) => sum + (quiz.score / quiz.total) * 100, 0
              );
            }
          });
          
          setStats({
            totalCourses,
            completedCourses,
            totalLessons,
            completedLessons,
            quizzesTaken,
            avgQuizScore: quizzesTaken > 0 
              ? Math.round(totalQuizScore / quizzesTaken) 
              : 0,
          });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleInterestChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      interests: value.split(',').map(interest => interest.trim()),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/users/profile', formData);
      setUser({
        ...user,
        ...formData,
      });
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  // Get first letter of user's name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <div className="profile-content loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
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
        <div className="profile-container">
          <div className="profile-content error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/" className="button primary-button">Return to Home</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-header-top">
              <div className="profile-avatar-large">{getInitial(user.name)}</div>
              <div className="profile-info">
                <h1 className="profile-name-large">{user.name}</h1>
                <div className="profile-meta">
                  <span className="profile-email-display">{user.email}</span>
                  <span className="profile-join-date">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="profile-bio">{user.bio || 'No bio added yet'}</p>
              </div>
            </div>
            
            <div className="profile-stats-overview">
              <div className="stat-item">
                <div className="stat-value">{stats.totalCourses}</div>
                <div className="stat-label">Courses</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.completedLessons}</div>
                <div className="stat-label">Lessons</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.quizzesTaken}</div>
                <div className="stat-label">Quizzes</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.avgQuizScore}%</div>
                <div className="stat-label">Avg. Score</div>
              </div>
            </div>
          </div>

          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
            <button 
              className={`tab-button ${activeTab === 'learning' ? 'active' : ''}`}
              onClick={() => setActiveTab('learning')}
            >
              Learning Stats
            </button>
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Account Settings
            </button>
          </div>

          <div className="profile-tab-content">
            {activeTab === 'profile' && (
              <div className="tab-panel">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="bio">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Tell us a bit about yourself"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="interests">Interests (comma separated)</label>
                      <input
                        type="text"
                        id="interests"
                        name="interests"
                        value={formData.interests.join(', ')}
                        onChange={handleInterestChange}
                        placeholder="e.g. JavaScript, React, Node.js"
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="button secondary-button"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="button primary-button"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-details-view">
                    <div className="profile-section">
                      <h3 className="section-title">About Me</h3>
                      <p className="section-content">{user.bio || 'No bio added yet'}</p>
                    </div>
                    
                    <div className="profile-section">
                      <h3 className="section-title">Interests</h3>
                      <div className="interests-list">
                        {user.interests && user.interests.length > 0 ? (
                          user.interests.map((interest, index) => (
                            <span key={index} className="interest-tag">{interest}</span>
                          ))
                        ) : (
                          <p className="empty-message">No interests added yet</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="profile-section">
                      <h3 className="section-title">Subscription</h3>
                      <div className={`subscription-badge ${user.subscribed ? 'premium' : 'free'}`}>
                        {user.subscribed ? 'Premium Member' : 'Free Account'}
                      </div>
                      {!user.subscribed && (
                        <Link to="/subscription" className="button primary-button upgrade-button">
                          Upgrade to Premium
                        </Link>
                      )}
                    </div>
                    
                    <button 
                      className="button edit-profile-button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'achievements' && (
              <div className="tab-panel">
                <h2 className="tab-title">Your Achievements</h2>
                
                <div className="achievements-container">
                  <div className="achievement-card unlocked">
                    <div className="achievement-icon">🚀</div>
                    <h3 className="achievement-title">First Steps</h3>
                    <p className="achievement-description">Completed your first lesson</p>
                  </div>
                  
                  <div className="achievement-card unlocked">
                    <div className="achievement-icon">📝</div>
                    <h3 className="achievement-title">Quiz Whiz</h3>
                    <p className="achievement-description">Scored 100% on a quiz</p>
                  </div>
                  
                  <div className="achievement-card">
                    <div className="achievement-icon locked">🏆</div>
                    <h3 className="achievement-title">Course Champion</h3>
                    <p className="achievement-description">Complete an entire course</p>
                  </div>
                  
                  <div className="achievement-card">
                    <div className="achievement-icon locked">⭐</div>
                    <h3 className="achievement-title">Perfect Week</h3>
                    <p className="achievement-description">Study every day for a week</p>
                  </div>
                  
                  <div className="achievement-card">
                    <div className="achievement-icon locked">🔥</div>
                    <h3 className="achievement-title">Streak Master</h3>
                    <p className="achievement-description">Maintain a 30-day learning streak</p>
                  </div>
                  
                  <div className="achievement-card">
                    <div className="achievement-icon locked">🎖️</div>
                    <h3 className="achievement-title">Knowledge Explorer</h3>
                    <p className="achievement-description">Enroll in 5 different courses</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'learning' && (
              <div className="tab-panel">
                <h2 className="tab-title">Learning Statistics</h2>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3 className="stat-card-title">Course Progress</h3>
                    <div className="stat-graph">
                      <div className="progress-circle" style={{
                        background: `conic-gradient(#0056b3 ${(stats.completedCourses / stats.totalCourses) * 100}%, #eee 0%)`
                      }}>
                        <div className="progress-inner">
                          <span className="progress-percentage">
                            {stats.totalCourses ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="progress-details">
                        <div className="progress-detail-item">
                          <span className="detail-label">Completed:</span>
                          <span className="detail-value">{stats.completedCourses}</span>
                        </div>
                        <div className="progress-detail-item">
                          <span className="detail-label">In Progress:</span>
                          <span className="detail-value">{stats.totalCourses - stats.completedCourses}</span>
                        </div>
                        <div className="progress-detail-item">
                          <span className="detail-label">Total:</span>
                          <span className="detail-value">{stats.totalCourses}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3 className="stat-card-title">Lesson Completion</h3>
                    <div className="stat-graph">
                      <div className="progress-circle" style={{
                        background: `conic-gradient(#0056b3 ${(stats.completedLessons / stats.totalLessons) * 100}%, #eee 0%)`
                      }}>
                        <div className="progress-inner">
                          <span className="progress-percentage">
                            {stats.totalLessons ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="progress-details">
                        <div className="progress-detail-item">
                          <span className="detail-label">Completed:</span>
                          <span className="detail-value">{stats.completedLessons}</span>
                        </div>
                        <div className="progress-detail-item">
                          <span className="detail-label">Remaining:</span>
                          <span className="detail-value">{stats.totalLessons - stats.completedLessons}</span>
                        </div>
                        <div className="progress-detail-item">
                          <span className="detail-label">Total:</span>
                          <span className="detail-value">{stats.totalLessons}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3 className="stat-card-title">Quiz Performance</h3>
                    <div className="quiz-stats">
                      <div className="quiz-stat-item">
                        <div className="quiz-stat-value">{stats.quizzesTaken}</div>
                        <div className="quiz-stat-label">Quizzes Taken</div>
                      </div>
                      <div className="quiz-stat-item">
                        <div className="quiz-stat-value">{stats.avgQuizScore}%</div>
                        <div className="quiz-stat-label">Average Score</div>
                      </div>
                    </div>
                    <div className="quiz-performance-bar">
                      <div className="performance-level" style={{width: `${stats.avgQuizScore}%`}}></div>
                    </div>
                    <div className="performance-scale">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3 className="stat-card-title">Learning Activity</h3>
                    <div className="activity-calendar">
                      <div className="calendar-placeholder">
                        <p>Activity calendar will be displayed here</p>
                        <p>Coming soon!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="tab-panel">
                <h2 className="tab-title">Account Settings</h2>
                
                <div className="settings-section">
                  <h3 className="settings-title">Email Notifications</h3>
                  <div className="settings-option">
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="settings-text">
                      <span className="settings-label">Course Updates</span>
                      <span className="settings-description">Receive notifications about new content in your enrolled courses</span>
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="settings-text">
                      <span className="settings-label">Achievement Notifications</span>
                      <span className="settings-description">Get notified when you earn new achievements</span>
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="settings-text">
                      <span className="settings-label">Marketing Emails</span>
                      <span className="settings-description">Receive promotional content and special offers</span>
                    </div>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h3 className="settings-title">Account Security</h3>
                  <button className="button secondary-button">Change Password</button>
                  <button className="button secondary-button">Two-Factor Authentication</button>
                </div>
                
                <div className="settings-section danger-zone">
                  <h3 className="settings-title">Danger Zone</h3>
                  <button className="button danger-button">Delete Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile; 