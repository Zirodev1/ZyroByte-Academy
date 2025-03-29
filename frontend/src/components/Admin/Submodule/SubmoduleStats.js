import React from 'react';
import { FaBookOpen, FaQuestionCircle, FaCode, FaLayerGroup } from 'react-icons/fa';

const SubmoduleStats = ({ module, submoduleCount, loading = false }) => {
  // Calculate total content count
  const totalContent = (
    (module?.lessonCount || 0) + 
    (module?.quizCount || 0) + 
    (module?.exerciseCount || 0)
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FaLayerGroup className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Submodules</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{submoduleCount || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <FaBookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Lessons</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{module?.lessonCount || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <FaQuestionCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Quizzes</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{module?.quizCount || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
            <FaCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Coding Exercises</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">{module?.exerciseCount || 0}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmoduleStats; 