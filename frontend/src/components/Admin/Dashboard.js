import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaUserGraduate, FaChalkboardTeacher, FaBookOpen, FaEye, FaUsers } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import Header from '../Header';
import Footer from '../Footer';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    views: { count: 0, change: 0 },
    visits: { count: 0, change: 0 },
    newUsers: { count: 0, change: 0 },
    activeUsers: { count: 0, change: 0 },
  });
  
  const [courseData, setCourseData] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('totalUsers');
  
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would fetch this data from your API
      // For now, let's simulate the data
      
      // Simulate stats with random data
      const mockStats = {
        views: { count: Math.floor(Math.random() * 900000) + 100000, change: (Math.random() * 20 - 10).toFixed(2) },
        visits: { count: Math.floor(Math.random() * 500000) + 50000, change: (Math.random() * 20 - 5).toFixed(2) },
        newUsers: { count: Math.floor(Math.random() * 2000) + 500, change: (Math.random() * 10 - 5).toFixed(2) },
        activeUsers: { count: Math.floor(Math.random() * 300000) + 50000, change: (Math.random() * 10 - 5).toFixed(2) },
      };
      
      setStats(mockStats);
      
      // Simulate user activity data
      const mockUserActivity = [
        { user: 'John Doe', action: 'Completed a course', timestamp: '5m ago', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { user: 'Sarah Smith', action: 'Started a new lesson', timestamp: '10m ago', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
        { user: 'Michael Johnson', action: 'Submitted an exercise', timestamp: '25m ago', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
        { user: 'Emma Wilson', action: 'Passed a quiz', timestamp: '45m ago', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { user: 'Robert Brown', action: 'Enrolled in a course', timestamp: '1h ago', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
      ];
      
      setUserActivity(mockUserActivity);
      
      // Simulate course enrollment data
      const mockCourseData = [
        { name: 'HTML & CSS Basics', enrollments: 2489, completionRate: 78 },
        { name: 'JavaScript Fundamentals', enrollments: 1853, completionRate: 65 },
        { name: 'React for Beginners', enrollments: 1356, completionRate: 54 },
        { name: 'Node.js Development', enrollments: 987, completionRate: 42 },
        { name: 'Full Stack Web Development', enrollments: 754, completionRate: 38 },
      ];
      
      setCourseData(mockCourseData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };
  
  // Prepare chart data
  const userChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Total Users',
        data: [8000, 9200, 10500, 11700, 12600, 14000, 15200],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Active Users',
        data: [5000, 5600, 6200, 6700, 7300, 7800, 8400],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  // Enrollment by device type
  const deviceChartData = {
    labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
    datasets: [
      {
        data: [55, 30, 10, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(201, 203, 207, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Enrollment by country
  const locationChartData = {
    labels: ['United States', 'India', 'Brazil', 'United Kingdom', 'Canada', 'Other'],
    datasets: [
      {
        data: [40, 20, 12, 8, 7, 13],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(201, 203, 207, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Format stats number with K and M for thousands and millions
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 text-sm rounded-md ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 text-sm rounded-md ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setTimeRange('year')}
                className={`px-3 py-1 text-sm rounded-md ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
              >
                Year
              </button>
            </div>
          </div>
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Views Card */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Views</p>
                  <h2 className="text-3xl font-bold">{formatNumber(stats.views.count)}</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaEye className="text-blue-600" />
                </div>
              </div>
              <div className={`mt-2 text-sm ${parseFloat(stats.views.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(stats.views.change) >= 0 ? '+' : ''}{stats.views.change}%
              </div>
            </div>
            
            {/* Visits Card */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Visits</p>
                  <h2 className="text-3xl font-bold">{formatNumber(stats.visits.count)}</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaUsers className="text-purple-600" />
                </div>
              </div>
              <div className={`mt-2 text-sm ${parseFloat(stats.visits.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(stats.visits.change) >= 0 ? '+' : ''}{stats.visits.change}%
              </div>
            </div>
            
            {/* New Users Card */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">New Users</p>
                  <h2 className="text-3xl font-bold">{formatNumber(stats.newUsers.count)}</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaUserGraduate className="text-green-600" />
                </div>
              </div>
              <div className={`mt-2 text-sm ${parseFloat(stats.newUsers.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(stats.newUsers.change) >= 0 ? '+' : ''}{stats.newUsers.change}%
              </div>
            </div>
            
            {/* Active Users Card */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Users</p>
                  <h2 className="text-3xl font-bold">{formatNumber(stats.activeUsers.count)}</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FaChalkboardTeacher className="text-orange-600" />
                </div>
              </div>
              <div className={`mt-2 text-sm ${parseFloat(stats.activeUsers.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(stats.activeUsers.change) >= 0 ? '+' : ''}{stats.activeUsers.change}%
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex flex-wrap items-center mb-4">
                  <h3 className="text-lg font-semibold mr-6">Users Growth</h3>
                  <div className="flex mt-2 sm:mt-0">
                    <button 
                      className={`text-sm px-3 py-1 rounded-l-md ${activeTab === 'totalUsers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setActiveTab('totalUsers')}
                    >
                      Total Users
                    </button>
                    <button 
                      className={`text-sm px-3 py-1 ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setActiveTab('projects')}
                    >
                      Courses
                    </button>
                    <button 
                      className={`text-sm px-3 py-1 rounded-r-md ${activeTab === 'status' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setActiveTab('status')}
                    >
                      Completion Status
                    </button>
                  </div>
                </div>
                <div className="h-72">
                  <Line
                    data={userChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow p-5 h-full">
                <h3 className="text-lg font-semibold mb-4">Traffic by Source</h3>
                <div className="space-y-4 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Google</span>
                      <span>45%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Direct</span>
                      <span>30%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Social Media</span>
                      <span>15%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Referrals</span>
                      <span>10%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Device Type */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4">Traffic by Device</h3>
              <div className="h-64">
                <Doughnut
                  data={deviceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
            
            {/* Location */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4">Users by Location</h3>
              <div className="h-64">
                <Doughnut
                  data={locationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {userActivity.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.action}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link to="/admin/activities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All Activities
                </Link>
              </div>
            </div>
          </div>
          
          {/* Popular Courses Table */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Most Popular Courses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courseData.map((course, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaBookOpen className="text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{course.enrollments.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.completionRate}%` }}></div>
                          </div>
                          <span className="ml-3 text-sm text-gray-900">{course.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link to={`/admin/courses/${index + 1}`} className="text-blue-600 hover:text-blue-900 mr-4">View</Link>
                        <Link to={`/admin/courses/${index + 1}/edit`} className="text-green-600 hover:text-green-900">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard; 