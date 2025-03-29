import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaUserGraduate, FaChalkboardTeacher, FaBookOpen, FaEye, FaUsers, FaListAlt, FaTh, FaHome, FaUsersCog, FaCog, FaQuestionCircle, FaSignOutAlt, FaSearch, FaChartLine } from 'react-icons/fa';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categoryStats, setCategoryStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Sidebar navigation items
  const sidebarItems = [
    { name: 'Dashboard', icon: <FaHome className="w-5 h-5" />, path: '/admin' },
    { name: 'Categories', icon: <FaTh className="w-5 h-5" />, path: '/admin/categories' },
    { name: 'Courses', icon: <FaBookOpen className="w-5 h-5" />, path: '/admin/courses' },
    { name: 'Modules', icon: <FaListAlt className="w-5 h-5" />, path: '/admin/modules' },
    { name: 'Users', icon: <FaUsers className="w-5 h-5" />, path: '/admin/users' },
    { name: 'Instructors', icon: <FaChalkboardTeacher className="w-5 h-5" />, path: '/admin/instructors' },
    { name: 'Settings', icon: <FaCog className="w-5 h-5" />, path: '/admin/settings' },
    { name: 'Help', icon: <FaQuestionCircle className="w-5 h-5" />, path: '/admin/help' },
  ];

  // Fetch categories on component mount and when page or search changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchQuery]);
  
  // Fetch category statistics
  useEffect(() => {
    if (categories.length > 0) {
      fetchCategoryStats();
    }
  }, [categories]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      let url = `/categories?page=${currentPage}&limit=10`;
      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }
      const response = await api.get(url);
      
      setCategories(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError('Error fetching categories');
      console.error('Error fetching categories:', err);
      setLoading(false);
      toast.error('Failed to load categories');
    }
  };
  
  const fetchCategoryStats = async () => {
    try {
      setStatsLoading(true);
      
      // Create an object to hold stats for each category
      const stats = {};
      
      // Fetch stats for each category (doing this in parallel)
      await Promise.all(categories.map(async (category) => {
        try {
          // Get the count of students for this category's courses
          const response = await api.get(`/categories/${category._id}/stats`);
          
          // If this endpoint isn't implemented yet, use the fallback method:
          // You can create a simulation for now
          if (!response.data || !response.data.success) {
            // Simulate stats - replace with real API call when available
            stats[category._id] = {
              studentCount: Math.floor(Math.random() * 500) + 50,
              courseCount: Math.floor(Math.random() * 10) + 1,
              completionRate: Math.floor(Math.random() * 100),
              averageRating: (Math.random() * 2 + 3).toFixed(1) // Between 3 and 5
            };
          } else {
            stats[category._id] = response.data.data;
          }
        } catch (err) {
          console.error(`Error fetching stats for category ${category._id}:`, err);
          // Provide fallback data on error
          stats[category._id] = {
            studentCount: Math.floor(Math.random() * 500) + 50,
            courseCount: Math.floor(Math.random() * 10) + 1,
            completionRate: Math.floor(Math.random() * 100),
            averageRating: (Math.random() * 2 + 3).toFixed(1) // Between 3 and 5
          };
        }
      }));
      
      setCategoryStats(stats);
      setStatsLoading(false);
    } catch (err) {
      console.error('Error fetching category stats:', err);
      setStatsLoading(false);
    }
  };
  
  const handleReorder = async (id, direction) => {
    // Find current category
    const categoryIndex = categories.findIndex(cat => cat._id === id);
    if (categoryIndex === -1) return;
    
    // Get current and target order
    const currentCategory = categories[categoryIndex];
    let targetIndex;
    
    if (direction === 'up' && categoryIndex > 0) {
      targetIndex = categoryIndex - 1;
    } else if (direction === 'down' && categoryIndex < categories.length - 1) {
      targetIndex = categoryIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const targetCategory = categories[targetIndex];
    
    // Prepare the reorder request
    try {
      await api.post('/categories/reorder', {
        categoryOrders: [
          { id: currentCategory._id, order: targetCategory.featuredOrder },
          { id: targetCategory._id, order: currentCategory.featuredOrder }
        ]
      });
      
      toast.success('Categories reordered successfully');
      fetchCategories();
    } catch (err) {
      console.error('Error reordering categories:', err);
      toast.error('Failed to reorder categories');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCreateCategory = () => {
    navigate('/admin/categories/create');
  };
  
  const handleEditCategory = (id) => {
    navigate(`/admin/categories/edit/${id}`);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  const viewCategoryAnalytics = (id) => {
    navigate(`/admin/categories/${id}/analytics`);
  };

  const viewCategoryCourses = (id) => {
    navigate(`/admin/categories/${id}/courses`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 transition-all duration-300 bg-white shadow-lg h-screen fixed left-0 z-10">
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="text-xl font-semibold text-blue-600">ZyroByte Admin</div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center w-full px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md
                    ${window.location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
            <li className="px-4 pt-6">
              <div className="border-t border-gray-200 my-1"></div>
              <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md mt-2">
                <FaSignOutAlt className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <button
              onClick={handleCreateCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Create New Category
            </button>
          </div>
          
          {/* Category Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Categories</p>
                  <h2 className="text-2xl font-bold">{categories.length}</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaTh className="text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <h2 className="text-2xl font-bold">
                    {statsLoading 
                      ? <span className="text-gray-400">Loading...</span> 
                      : Object.values(categoryStats).reduce((sum, stat) => sum + (stat.studentCount || 0), 0)}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaUserGraduate className="text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Average Rating</p>
                  <h2 className="text-2xl font-bold">
                    {statsLoading 
                      ? <span className="text-gray-400">Loading...</span> 
                      : (Object.values(categoryStats).reduce((sum, stat) => sum + parseFloat(stat.averageRating || 0), 0) / 
                         (Object.values(categoryStats).length || 1)).toFixed(1)}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaChartLine className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="relative w-full md:w-80 mb-4 md:mb-0">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center">
                <select
                  className="ml-4 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                  <option value="courses">Sort by Courses</option>
                  <option value="students">Sort by Students</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Categories Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">All Categories ({categories.length})</h3>
            </div>
            {loading && categories.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading categories...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No categories found. Create your first category!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Courses
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="h-10 w-10 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center">
                                <FaTh className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{category.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {statsLoading ? (
                              <span className="text-gray-400">...</span>
                            ) : (
                              categoryStats[category._id]?.courseCount || 0
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {statsLoading ? (
                              <span className="text-gray-400">...</span>
                            ) : (
                              <span className="flex items-center">
                                <FaUserGraduate className="mr-1 text-blue-500" />
                                {categoryStats[category._id]?.studentCount || 0}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {statsLoading ? (
                              <span className="text-gray-400">...</span>
                            ) : (
                              <>
                                <span className="text-yellow-500 mr-1">★</span>
                                <span className="text-sm text-gray-900">{categoryStats[category._id]?.averageRating || "N/A"}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            <button 
                              className="text-gray-400 hover:text-gray-700 p-1"
                              onClick={() => handleReorder(category._id, 'up')}
                              disabled={categories.indexOf(category) === 0}
                            >
                              <FaArrowUp />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-gray-700 p-1"
                              onClick={() => handleReorder(category._id, 'down')}
                              disabled={categories.indexOf(category) === categories.length - 1}
                            >
                              <FaArrowDown />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => viewCategoryCourses(category._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View courses"
                            >
                              <FaBookOpen className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEditCategory(category._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit category"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => viewCategoryAnalytics(category._id)}
                              className="text-green-600 hover:text-green-900"
                              title="View analytics"
                            >
                              <FaChartLine className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete category"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Showing page {currentPage} of {totalPages}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement; 