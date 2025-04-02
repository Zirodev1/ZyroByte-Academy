import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaTh, FaBookOpen, FaListAlt, FaUsers, FaChalkboardTeacher, FaCog, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

const AdminSidebar = () => {

  const [sidebarOpen, setSidebarOpen] = useState(true);
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

    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };
    
    const handleNavigation = (path) => {
      navigate(path);
    };
    

    return (
           
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white shadow-lg h-screen fixed left-0 z-10`}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className={`${sidebarOpen ? 'block' : 'hidden'} text-xl font-semibold text-blue-600`}>ZyroByte Admin</div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h16M4 18h16"} />
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
                  <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>{item.name}</span>
                </button>
              </li>
            ))}
            <li className="px-4 pt-6">
              <div className={`${sidebarOpen ? 'block' : 'hidden'} border-t border-gray-200 my-1`}></div>
              <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md mt-2">
                <FaSignOutAlt className="w-5 h-5 mr-3" />
                <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    )
}

export default AdminSidebar;
