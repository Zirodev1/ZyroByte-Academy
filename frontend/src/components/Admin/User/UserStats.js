import React, { useMemo } from 'react';
import { FaUsers, FaUserShield, FaChalkboardTeacher, FaCrown } from 'react-icons/fa';

const UserStats = ({ users, loading }) => {
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        admins: 0,
        instructors: 0,
        subscribedUsers: 0,
        newUsersThisMonth: 0
      };
    }

    const currentDate = new Date();
    const thisMonth = currentDate.getMonth();
    const thisYear = currentDate.getFullYear();

    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => 
        user.lastLoginAt && new Date(user.lastLoginAt) > new Date(currentDate - 30 * 24 * 60 * 60 * 1000)
      ).length,
      admins: users.filter(user => user.role === 'admin').length,
      instructors: users.filter(user => user.role === 'instructor').length,
      subscribedUsers: users.filter(user => user.subscribed).length,
      newUsersThisMonth: users.filter(user => {
        const createDate = new Date(user.createdAt);
        return createDate.getMonth() === thisMonth && createDate.getFullYear() === thisYear;
      }).length
    };
  }, [users]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <FaUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              <span className="text-green-600 font-semibold">+{stats.newUsersThisMonth}</span> new this month
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <FaCrown className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Subscribed Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.subscribedUsers}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              <span className="text-gray-600 font-semibold">
                {Math.round((stats.subscribedUsers / (stats.totalUsers || 1)) * 100)}%
              </span> of all users
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-800">
              <FaUserShield className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              <span className="text-gray-600 font-semibold">
                {Math.round((stats.admins / (stats.totalUsers || 1)) * 100)}%
              </span> of all users
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800">
              <FaChalkboardTeacher className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Instructors</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.instructors}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              <span className="text-gray-600 font-semibold">
                {Math.round((stats.instructors / (stats.totalUsers || 1)) * 100)}%
              </span> of all users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats; 