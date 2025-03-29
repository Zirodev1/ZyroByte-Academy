import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalHours: 0,
    completedCourses: 0,
    certificates: 0
  });

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
          // Calculate stats
          const totalHours = response.data.user.enrolledCourses.reduce((acc, course) => 
            acc + (course.course.duration || 0), 0);
          const completedCourses = response.data.user.enrolledCourses.filter(course => 
            course.progress === 100).length;
          
          setStats({
            totalHours,
            completedCourses,
            certificates: completedCourses // Assuming one certificate per completed course
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="mt-2 text-gray-600">Here's what's happening with your courses today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Total Learning Hours</h3>
                  <p className="text-2xl font-semibold text-gray-700">{stats.totalHours}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Completed Courses</h3>
                  <p className="text-2xl font-semibold text-gray-700">{stats.completedCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Certificates Earned</h3>
                  <p className="text-2xl font-semibold text-gray-700">{stats.certificates}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 text-center border-b border-gray-200">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitial(user.name)}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Subscription Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscribed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {user.subscribed ? 'Premium Member' : 'Free Account'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Courses Enrolled</p>
                      <p className="text-lg font-medium text-gray-900">{enrolledCourses.length}</p>
                    </div>
                  </div>
                  {!user.subscribed && (
                    <Link 
                      to="/subscription" 
                      className="mt-6 block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Upgrade to Premium
                    </Link>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Navigation</h3>
                </div>
                <nav className="p-6">
                  <ul className="space-y-4">
                    <li>
                      <Link to="/dashboard" className="flex items-center text-blue-600">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/courses" className="flex items-center text-gray-600 hover:text-blue-600">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        All Courses
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile" className="flex items-center text-gray-600 hover:text-blue-600">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="flex items-center text-gray-600 hover:text-blue-600">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                </div>
                <div className="p-6">
                  {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {enrolledCourses.map((enrollment) => (
                        <div key={enrollment.course._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                          <div className="relative h-48">
                            <img 
                              src={enrollment.course.imageUrl || "https://images.unsplash.com/photo-1587620962725-abab7fe55159"} 
                              alt={enrollment.course.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <h3 className="text-lg font-semibold">{enrollment.course.title}</h3>
                              <div className="flex items-center mt-2 text-sm">
                                <span className="mr-4">{enrollment.course.level || 'Beginner'}</span>
                                <span>{enrollment.course.duration || '8 weeks'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{enrollment.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                {enrollment.completedLessons ? enrollment.completedLessons.length : 0} of {4} lessons completed
                              </div>
                            </div>
                            
                            <Link 
                              to={`/courses/${enrollment.course._id}`}
                              className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                            >
                              {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
                      <p className="text-gray-600 mb-6">
                        You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
                      </p>
                      <Link 
                        to="/courses" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;