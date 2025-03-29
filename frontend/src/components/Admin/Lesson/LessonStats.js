import React from 'react';
import { FaBookOpen, FaUserGraduate, FaClock, FaChartLine } from 'react-icons/fa';

const LessonStats = ({ parentData, lessonCount, totalViews = 0, avgCompletion = 0, loading = false }) => {
  const parentType = parentData?.type === 'module' ? 'Module' : 'Submodule';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FaBookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Lessons</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{lessonCount || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <FaUserGraduate className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Views</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{totalViews}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <FaClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Duration</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{parentData?.totalDuration || '0'} mins</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <FaChartLine className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Avg. Completion</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{avgCompletion}%</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonStats; 