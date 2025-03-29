import React from 'react';
import { FaBookOpen, FaQuestionCircle, FaGraduationCap, FaUsers } from 'react-icons/fa';

const ModuleStats = ({ course, moduleCount, loading = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FaBookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Modules</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{moduleCount || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <FaQuestionCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Quizzes</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{course?.quizCount || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <FaGraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Course Level</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{course?.level || 'Beginner'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <FaUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Enrolled Students</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{course?.studentCount || 0}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleStats; 