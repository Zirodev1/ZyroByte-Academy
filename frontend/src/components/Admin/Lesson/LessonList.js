import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaEye, FaUserGraduate } from 'react-icons/fa';

const LessonList = ({ lessons, loading, handleEdit, handleDelete, handleReorder, handlePreview }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Lessons ({lessons.length})</h3>
      </div>
      
      {loading && lessons.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading lessons...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No lessons found. Create a new lesson to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessons.map((lesson, index) => (
                <tr key={lesson._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lesson.order || index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lesson.type === 'video' ? 'bg-red-100 text-red-800' :
                      lesson.type === 'text' ? 'bg-blue-100 text-blue-800' :
                      lesson.type === 'presentation' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lesson.type ? lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1) : 'Text'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lesson.duration ? `${lesson.duration} mins` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lesson.isPublished ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FaUserGraduate className="mr-1 text-blue-500" />
                      <span>{lesson.viewCount || 0} views</span>
                      <span className="mx-2">•</span>
                      <span className="text-green-600">{lesson.completionRate || 0}% completion</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleReorder(lesson._id, 'up')}
                        title="Move Up"
                        disabled={index === 0}
                      >
                        <FaArrowUp className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleReorder(lesson._id, 'down')}
                        title="Move Down"
                        disabled={index === lessons.length - 1}
                      >
                        <FaArrowDown className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handlePreview(lesson)}
                        title="Preview Lesson"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEdit(lesson)}
                        title="Edit Lesson"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(lesson._id)}
                        title="Delete Lesson"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LessonList; 