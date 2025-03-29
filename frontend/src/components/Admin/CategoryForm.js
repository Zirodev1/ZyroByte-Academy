import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaUserGraduate, FaChalkboardTeacher, FaBookOpen, FaEye, FaUsers, FaListAlt, FaTh, FaHome, FaUsersCog, FaCog, FaQuestionCircle, FaSignOutAlt, FaImage } from 'react-icons/fa';

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

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

  useEffect(() => {
    if (id) {
      setFormMode('edit');
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      console.log(`Fetching category with ID: ${id}`);
      
      // Make sure we're using the correct API endpoint
      const response = await api.get(`/categories/${id}`);
      console.log('Category data received:', response.data);
      
      // The API response structure has the category nested inside data.category
      const responseData = response.data;
      
      if (!responseData || !responseData.success) {
        console.error('Invalid API response:', responseData);
        toast.error('Failed to load category: Invalid response');
        setLoading(false);
        return;
      }
      
      // Extract the category data from the nested structure
      const category = responseData.data.category || responseData.data;
      
      console.log('Extracted category data:', category);
      
      if (!category || typeof category !== 'object') {
        console.error('Invalid category data received:', category);
        toast.error('Received invalid category data');
        setLoading(false);
        return;
      }
      
      // Update the form with the received data
      setFormData({
        name: category.name || '',
        description: category.description || '',
        imageUrl: category.imageUrl || ''
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching category:', err);
      
      // More detailed error information
      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data);
        toast.error(`Failed to load category (${err.response.status}): ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        toast.error('No response received from server. Check your connection.');
      } else {
        console.error('Error message:', err.message);
        toast.error(`Error: ${err.message}`);
      }
      
      setLoading(false);
      // Stay on the form page but display error state
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploadingImage(true);
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData(prevState => ({
        ...prevState,
        imageUrl: response.data.imageUrl
      }));
      
      toast.success('Image uploaded successfully');
      setUploadingImage(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }
    
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        await api.post('/categories', formData);
        toast.success('Category created successfully');
      } else {
        console.log(`Updating category ${id} with data:`, formData);
        const response = await api.put(`/categories/${id}`, formData);
        console.log('Update response:', response.data);
        toast.success('Category updated successfully');
      }
      
      setLoading(false);
      navigate('/admin/categories');
    } catch (err) {
      console.error('Error saving category:', err);
      
      if (err.response) {
        console.error('Error details:', err.response.status, err.response.data);
        toast.error(`Failed to save category (${err.response.status}): ${err.response.data.message || 'Unknown error'}`);
      } else {
        toast.error('Failed to save category: ' + (err.message || 'Unknown error'));
      }
      
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleNavigation = (path) => {
    navigate(path);
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
                    ${window.location.pathname.includes(item.path) ? 'bg-blue-50 text-blue-600' : ''}`}
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
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/admin/categories')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {formMode === 'create' ? 'Create New Category' : 'Edit Category'}
            </h1>
          </div>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading category data...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Category Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Web Development"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        placeholder="Provide a detailed description of this category"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Image
                      </label>
                      <div className="flex items-start space-x-4">
                        <div className="w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg overflow-hidden relative flex items-center justify-center">
                          {formData.imageUrl ? (
                            <img 
                              src={formData.imageUrl} 
                              alt="Category Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaImage className="text-gray-400 w-10 h-10" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                              {uploadingImage ? 'Uploading...' : 'Browse'}
                            </label>
                            <p className="ml-2 text-xs text-gray-500">
                              JPEG, PNG or GIF, Max 2MB
                            </p>
                          </div>
                          <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            placeholder="Or enter image URL directly"
                            className="mt-3 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/categories')}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingImage}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${
                        (loading || uploadingImage) ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      <FaSave className="mr-2" />
                      {formMode === 'create' ? 'Create Category' : 'Update Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryForm; 