import React from "react";
import { Link } from "react-router-dom";
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash, FaList, FaUserGraduate, FaBookOpen, FaChalkboardTeacher, FaPlus, FaQuestionCircle } from "react-icons/fa";

const ModuleList = ({
  modules,
  loading,
  courseId,
  handleReorder,
  handleEdit,
  handleDelete,
  handleAddSubmodule,
  handleAddLesson,
  handleAddQuiz
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">
          Course Modules ({modules.length})
        </h3>
      </div>
      
      {loading && modules.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading modules...</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No modules found. Create a new module to get started.</p>
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
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module, index) => (
                <tr key={module._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {module.order || index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{module.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {module.description.length > 100
                        ? `${module.description.substring(0, 100)}...`
                        : module.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {module.duration ? `${module.duration} mins` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {module.isPublished ? (
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
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/modules/${module._id}/submodules`}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200"
                        title="Manage Submodules"
                      >
                        Submodules ({module.subModuleCount || 0})
                      </Link>
                      <Link
                        to={`/admin/modules/${module._id}/lessons`}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                        title="Manage Lessons"
                      >
                        Lessons ({module.lessonCount || 0})
                      </Link>
                      <Link
                        to={`/admin/modules/${module._id}/quizzes`}
                        className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200"
                        title="Manage Quizzes"
                      >
                        Quizzes ({module.quizCount || 0})
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleReorder(module._id, 'up')}
                        title="Move Up"
                        disabled={index === 0}
                      >
                        <FaArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleReorder(module._id, 'down')}
                        title="Move Down"
                        disabled={index === modules.length - 1}
                      >
                        <FaArrowDown className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEdit(module)}
                        title="Edit Module"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/admin/modules/${module._id}/submodules`}
                        className="text-green-600 hover:text-green-900"
                        title="View Submodules"
                      >
                        <FaList className="w-4 h-4" />
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(module._id)}
                        title="Delete Module"
                      >
                        <FaTrash className="w-4 h-4" />
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

export default ModuleList; 