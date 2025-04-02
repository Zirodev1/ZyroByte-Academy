import React, { useState } from 'react';
import { FaUserShield, FaChalkboardTeacher, FaUser, FaTimes } from 'react-icons/fa';

const RoleChangeModal = ({ user, onClose, onChangeRole }) => {
  const [selectedRole, setSelectedRole] = useState(user.role || 'user');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole !== user.role) {
      onChangeRole(user._id, selectedRole);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Change User Role</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Change role for <span className="font-semibold">{user.name}</span> ({user.email})
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-6">
            <div 
              className={`p-4 border rounded-lg flex items-center cursor-pointer ${
                selectedRole === 'user' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedRole('user')}
            >
              <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                <FaUser className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">User</p>
                <p className="text-xs text-gray-500">Regular user with student privileges</p>
              </div>
              <input 
                type="radio" 
                name="role" 
                value="user" 
                checked={selectedRole === 'user'} 
                onChange={() => setSelectedRole('user')} 
                className="ml-auto"
              />
            </div>
            
            <div 
              className={`p-4 border rounded-lg flex items-center cursor-pointer ${
                selectedRole === 'instructor' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedRole('instructor')}
            >
              <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                <FaChalkboardTeacher className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Instructor</p>
                <p className="text-xs text-gray-500">Can create and manage courses</p>
              </div>
              <input 
                type="radio" 
                name="role" 
                value="instructor" 
                checked={selectedRole === 'instructor'} 
                onChange={() => setSelectedRole('instructor')} 
                className="ml-auto"
              />
            </div>
            
            <div 
              className={`p-4 border rounded-lg flex items-center cursor-pointer ${
                selectedRole === 'admin' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedRole('admin')}
            >
              <div className="p-2 rounded-full bg-red-100 text-red-800">
                <FaUserShield className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Full access to all system features</p>
              </div>
              <input 
                type="radio" 
                name="role" 
                value="admin" 
                checked={selectedRole === 'admin'} 
                onChange={() => setSelectedRole('admin')} 
                className="ml-auto"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                selectedRole !== user.role 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={selectedRole === user.role}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleChangeModal; 