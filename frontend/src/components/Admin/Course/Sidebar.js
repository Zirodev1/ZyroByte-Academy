import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaTh,
  FaBookOpen,
  FaListAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt
} from "react-icons/fa";

const Sidebar = ({ activePath }) => {
  const navigate = useNavigate();
  
  // Sidebar navigation items
  const sidebarItems = [
    { name: 'Dashboard', icon: <FaHome className="w-5 h-5" />, path: '/admin' },
    { name: 'Users', icon: <FaUsers className="w-5 h-5" />, path: '/admin/users' },
    { name: 'Categories', icon: <FaTh className="w-5 h-5" />, path: '/admin/categories' },
    { name: 'Courses', icon: <FaBookOpen className="w-5 h-5" />, path: '/admin/courses' },
    { name: 'Instructors', icon: <FaChalkboardTeacher className="w-5 h-5" />, path: '/admin/instructors' },
    { name: 'Settings', icon: <FaCog className="w-5 h-5" />, path: '/admin/settings' },
    { name: 'Help', icon: <FaQuestionCircle className="w-5 h-5" />, path: '/admin/help' },
  ];
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (itemPath) => {
    if (activePath === itemPath) return true;
    
    // Handle child paths
    if (itemPath !== '/admin' && window.location.pathname.startsWith(itemPath)) {
      return true;
    }
    
    return false;
  };
  
  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 z-10">
      <div className="h-16 flex items-center justify-center px-4 border-b">
        <div className="text-xl font-semibold text-blue-600">ZyroByte Admin</div>
      </div>
      <div className="py-4 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center w-full px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md
                  ${isActive(item.path) ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
          <li className="px-4 pt-6">
            <div className="border-t border-gray-200 my-1"></div>
            <button 
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md mt-2"
              onClick={() => {
                // Implement logout logic here
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <FaSignOutAlt className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; 