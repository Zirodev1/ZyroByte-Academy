import React, { useState } from 'react';
import { FaEdit, FaTrash, FaKey, FaUser, FaUserShield, FaChalkboardTeacher, FaCheck, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import RoleChangeModal from './RoleChangeModal';

const UserList = ({ 
  users, 
  loading, 
  onEdit, 
  onDelete, 
  onToggleSubscription, 
  onChangeRole, 
  onResetPassword 
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEditClick = (e, user) => {
    e.preventDefault();
    onEdit(user);
  };

  const handleDeleteClick = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      onDelete(userId);
    }
  };

  const handleResetPasswordClick = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to reset the password for this user?')) {
      onResetPassword(userId);
    }
  };

  const handleToggleSubscriptionClick = (e, userId, currentStatus) => {
    e.preventDefault();
    e.stopPropagation();
    const message = currentStatus 
      ? 'Are you sure you want to cancel this user\'s subscription?' 
      : 'Are you sure you want to subscribe this user?';
    
    if (window.confirm(message)) {
      onToggleSubscription(userId, currentStatus);
    }
  };

  const openRoleModal = (e, user) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (userId, newRole) => {
    onChangeRole(userId, newRole);
    closeRoleModal();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'instructor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="mr-1" />;
      case 'instructor':
        return <FaChalkboardTeacher className="mr-1" />;
      default:
        return <FaUser className="mr-1" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courses
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr 
                  key={user._id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleEditClick(e, user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name} 
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-bold text-gray-500">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={(e) => openRoleModal(e, user)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}
                    >
                      {getRoleIcon(user.role)}
                      {user.role || 'user'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => handleToggleSubscriptionClick(e, user._id, user.subscribed)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.subscribed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.subscribed ? (
                        <>
                          <FaCheck className="mr-1" />
                          Subscribed
                        </>
                      ) : (
                        <>
                          <FaTimes className="mr-1" />
                          Not Subscribed
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.enrolledCourses?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLoginAt) || 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => handleResetPasswordClick(e, user._id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Reset Password"
                      >
                        <FaKey className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleEditClick(e, user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit User"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, user._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <RoleChangeModal
          user={selectedUser}
          onClose={closeRoleModal}
          onChangeRole={handleRoleChange}
        />
      )}
    </div>
  );
};

export default UserList; 