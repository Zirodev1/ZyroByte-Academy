import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import api from '../../services/api';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        courses: 0,
        lessons: 0,
        quizzes: 0,
        users: 0,
        categories: 0,
        modules: 0,
        recentActivity: [],
        courseDistribution: [
            { name: 'Frontend', value: 0 },
            { name: 'Backend', value: 0 },
            { name: 'DevOps', value: 0 },
            { name: 'Other', value: 0 }
        ],
        enrollmentTrend: [20, 25, 30, 40, 45, 30, 20]
    });
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                
                // Fetch admin profile
                const userResponse = await api.get('/users/profile');
                setAdminUser(userResponse.data.user);
                
                // Fetch real stats where available
                const [coursesResponse, lessonsResponse, quizzesResponse, usersResponse, categoriesResponse, modulesResponse] = await Promise.all([
                    api.get('/courses'),
                    api.get('/lessons'),
                    api.get('/quizzes'),
                    api.get('/admin/users').catch(() => ({ data: [] })),
                    api.get('/categories').catch(() => ({ data: { data: [] } })),
                    api.get('/api/modules').catch(() => ({ data: { data: [] } }))
                ]);
                
                const courses = coursesResponse.data || [];
                const lessons = lessonsResponse.data || [];
                const quizzes = quizzesResponse.data || [];
                const users = usersResponse.data || [];
                const categories = categoriesResponse.data?.data || [];
                const modules = modulesResponse.data?.data || [];
                
                // Simple category mapping
                const categoryCount = courses.reduce((acc, course) => {
                    const category = course.category || 'Other';
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {});
                
                // Create mock recent activity data
                const recentActivity = generateMockActivity();
                
                setStats({
                    courses: courses.length,
                    lessons: lessons.length,
                    quizzes: quizzes.length,
                    users: users.length || 5, // Fallback if admin/users endpoint is not available
                    categories: categories.length || 0,
                    modules: modules.length || 0,
                    recentActivity,
                    courseDistribution: [
                        { name: 'Frontend', value: categoryCount['Frontend'] || 2 },
                        { name: 'Backend', value: categoryCount['Backend'] || 1 },
                        { name: 'DevOps', value: categoryCount['DevOps'] || 0 },
                        { name: 'Other', value: categoryCount['Other'] || 1 }
                    ],
                    enrollmentTrend: [20, 25, 30, 40, 45, 30, 20]
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const generateMockActivity = () => {
        const activities = [
            { type: 'enrollment', user: 'John Doe', course: 'JavaScript Basics', time: '10 minutes ago' },
            { type: 'completion', user: 'Sarah Smith', course: 'HTML Fundamentals', time: '1 hour ago' },
            { type: 'quiz', user: 'Michael Brown', course: 'CSS Mastery', score: '95%', time: '3 hours ago' },
            { type: 'enrollment', user: 'Emma Wilson', course: 'Node.js Basics', time: '5 hours ago' },
            { type: 'quiz', user: 'James Taylor', course: 'React Framework', score: '88%', time: 'Yesterday' }
        ];
        return activities;
    };

    // Calculate total color classes
    const totalCourses = stats.courseDistribution.reduce((sum, item) => sum + item.value, 0);
    
    // Get first letter of admin's name for avatar
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'A';
    };

    const renderActivityIcon = (type) => {
        switch (type) {
            case 'enrollment': return <span className="activity-icon enrollment">📋</span>;
            case 'completion': return <span className="activity-icon completion">🏆</span>;
            case 'quiz': return <span className="activity-icon quiz">📝</span>;
            default: return <span className="activity-icon">📌</span>;
        }
    };

    const formatToday = () => {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('en-US', options);
    };

    return (
        <div>
            <Header />
            <div className="admin-container">
                <div className="admin-content">
                    <div className="admin-header">
                        <div className="admin-header-left">
                            <h1 className="admin-title">Admin Dashboard</h1>
                            <p className="admin-subtitle">{formatToday()}</p>
                        </div>
                        {adminUser && (
                            <div className="admin-user-info">
                                <div className="admin-greeting">Welcome, {adminUser.name}</div>
                                <div className="admin-avatar">{getInitial(adminUser.name)}</div>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="admin-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading dashboard data...</p>
                        </div>
                    ) : (
                        <>
                            <div className="admin-stats">
                                <div className="stat-card categories">
                                    <div className="stat-icon">📋</div>
                                    <div className="stat-info">
                                        <div className="stat-number">{stats.categories}</div>
                                        <div className="stat-label">Categories</div>
                                    </div>
                                    <Link to="/admin/categories" className="stat-action">Manage</Link>
                                </div>
                                <div className="stat-card courses">
                                    <div className="stat-icon">📚</div>
                                    <div className="stat-info">
                                        <div className="stat-number">{stats.courses}</div>
                                        <div className="stat-label">Courses</div>
                                    </div>
                                    <Link to="/admin/courses" className="stat-action">Manage</Link>
                                </div>
                                <div className="stat-card modules">
                                    <div className="stat-icon">📑</div>
                                    <div className="stat-info">
                                        <div className="stat-number">{stats.modules || 0}</div>
                                        <div className="stat-label">Modules</div>
                                    </div>
                                    <Link to="/admin/courses" className="stat-action">View</Link>
                                </div>
                                <div className="stat-card lessons">
                                    <div className="stat-icon">📝</div>
                                    <div className="stat-info">
                                        <div className="stat-number">{stats.lessons}</div>
                                        <div className="stat-label">Lessons</div>
                                    </div>
                                    <span className="stat-info">Via Modules</span>
                                </div>
                                <div className="stat-card quizzes">
                                    <div className="stat-icon">🧠</div>
                                    <div className="stat-info">
                                        <div className="stat-number">{stats.quizzes}</div>
                                        <div className="stat-label">Quizzes</div>
                                    </div>
                                    <span className="stat-info">Via Modules</span>
                                </div>
                                <div className="stat-card users">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-info">
                                        <div className="stat-number">{stats.users}</div>
                                        <div className="stat-label">Users</div>
                                    </div>
                                    <Link to="/admin/users" className="stat-action">Manage</Link>
                                </div>
                            </div>

                            <div className="admin-dashboard-grid">
                                <div className="admin-panel course-distribution">
                                    <h2 className="panel-title">Course Distribution</h2>
                                    <div className="chart-container">
                                        <div className="pie-chart">
                                            {stats.courseDistribution.map((item, index) => {
                                                // Skip if value is 0
                                                if (item.value === 0) return null;
                                                
                                                // Calculate percentage
                                                const percentage = ((item.value / totalCourses) * 100).toFixed(0);
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className={`pie-segment category-${index + 1}`}
                                                        style={{ 
                                                            transform: `rotate(${index * 90}deg)`,
                                                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI / 2)}% ${50 + 50 * Math.sin(Math.PI / 2)}%)`
                                                        }}
                                                    >
                                                        <span className="segment-label">{percentage}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="chart-legend">
                                            {stats.courseDistribution.map((item, index) => (
                                                <div key={index} className="legend-item">
                                                    <span className={`legend-color category-${index + 1}`}></span>
                                                    <span className="legend-label">{item.name}</span>
                                                    <span className="legend-value">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="admin-panel recent-activity">
                                    <h2 className="panel-title">Recent Activity</h2>
                                    <div className="activity-list">
                                        {stats.recentActivity.map((activity, index) => (
                                            <div key={index} className="activity-item">
                                                {renderActivityIcon(activity.type)}
                                                <div className="activity-details">
                                                    <div className="activity-text">
                                                        <span className="activity-user">{activity.user}</span>
                                                        {activity.type === 'enrollment' && (
                                                            <span> enrolled in <strong>{activity.course}</strong></span>
                                                        )}
                                                        {activity.type === 'completion' && (
                                                            <span> completed <strong>{activity.course}</strong></span>
                                                        )}
                                                        {activity.type === 'quiz' && (
                                                            <span> scored <strong>{activity.score}</strong> on <strong>{activity.course}</strong> quiz</span>
                                                        )}
                                                    </div>
                                                    <div className="activity-time">{activity.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="admin-panel enrollment-trend">
                                    <h2 className="panel-title">Weekly Enrollment Trend</h2>
                                    <div className="trend-chart">
                                        {stats.enrollmentTrend.map((value, index) => (
                                            <div 
                                                key={index} 
                                                className="trend-bar"
                                                style={{ height: `${value * 2}px` }}
                                                title={`Day ${index + 1}: ${value} enrollments`}
                                            />
                                        ))}
                                    </div>
                                    <div className="trend-labels">
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                        <span>Fri</span>
                                        <span>Sat</span>
                                        <span>Sun</span>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-quick-actions">
                                <h2 className="section-title">Quick Actions</h2>
                                <div className="admin-cards">
                                    <div className="admin-card">
                                        <div className="admin-card-header">
                                            <div className="card-icon">📚</div>
                                            <h2 className="admin-card-title">Course Management</h2>
                                        </div>
                                        <div className="admin-card-content">
                                            <p className="admin-card-description">
                                                Create, edit, and delete courses. Manage course content and settings.
                                            </p>
                                        </div>
                                        <div className="admin-card-footer">
                                            <Link to="/admin/courses" className="admin-button">Manage Courses</Link>
                                        </div>
                                    </div>

                                    <div className="admin-card">
                                        <div className="admin-card-header">
                                            <div className="card-icon">📝</div>
                                            <h2 className="admin-card-title">Lesson Management</h2>
                                        </div>
                                        <div className="admin-card-content">
                                            <p className="admin-card-description">
                                                Create and organize lessons for your courses. Add videos and content.
                                            </p>
                                        </div>
                                        <div className="admin-card-footer">
                                            <Link to="/admin/lessons" className="admin-button">Manage Lessons</Link>
                                        </div>
                                    </div>

                                    <div className="admin-card">
                                        <div className="admin-card-header">
                                            <div className="card-icon">🧠</div>
                                            <h2 className="admin-card-title">Quiz Management</h2>
                                        </div>
                                        <div className="admin-card-content">
                                            <p className="admin-card-description">
                                                Create quizzes and assessments for your courses. Set up questions and answers.
                                            </p>
                                        </div>
                                        <div className="admin-card-footer">
                                            <Link to="/admin/quizzes" className="admin-button">Manage Quizzes</Link>
                                        </div>
                                    </div>

                                    <div className="admin-card">
                                        <div className="admin-card-header">
                                            <div className="card-icon">👥</div>
                                            <h2 className="admin-card-title">User Management</h2>
                                        </div>
                                        <div className="admin-card-content">
                                            <p className="admin-card-description">
                                                Manage user accounts, permissions, and subscription status.
                                            </p>
                                        </div>
                                        <div className="admin-card-footer">
                                            <Link to="/admin/users" className="admin-button">Manage Users</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;