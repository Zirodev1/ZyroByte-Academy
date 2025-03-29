import React from "react";
import { FaUserGraduate, FaChartLine, FaChalkboardTeacher, FaEye } from "react-icons/fa";

const CourseStats = ({ loading = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FaUserGraduate className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Students</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">1,245</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <FaChartLine className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Completion Rate</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">78%</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <FaChalkboardTeacher className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Courses</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">24</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <FaEye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Avg. Course Views</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-semibold">342</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStats; 