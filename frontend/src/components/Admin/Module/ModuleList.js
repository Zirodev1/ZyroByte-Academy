import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash, FaList, FaUserGraduate, FaBookOpen, FaChalkboardTeacher, FaPlus, FaQuestionCircle } from "react-icons/fa";
import { toast } from "react-toastify";

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
  const navigate = useNavigate();

  const handleEditModule = (e, module) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/modules/edit/${module._id}`);
  };

  const handleDeleteModule = (e, module) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete module "${module.title}"?`)) {
      handleDelete(module._id);
    }
  };

  const handleManageLessons = (e, module) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/modules/${module._id}/lessons`);
  };

  const handleManageQuizzes = (e, module) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/modules/${module._id}/quizzes`);
  };

  const handleManageSubmodules = (e, module) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/modules/${module._id}/submodules`);
  };

  const handleMoveUp = (e, moduleId) => {
    e.preventDefault();
    e.stopPropagation();
    handleReorder(moduleId, 'up');
  };

  const handleMoveDown = (e, moduleId) => {
    e.preventDefault();
    e.stopPropagation();
    handleReorder(moduleId, 'down');
  };
  
  const getStatusBadgeClass = (isPublished) => {
    return isPublished
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Content
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module, index) => (
                <tr key={module._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      {module.order || index + 1}
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <button
                        onClick={(e) => handleMoveUp(e, module._id)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Move up"
                      >
                        <FaArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleMoveDown(e, module._id)}
                        disabled={index === modules.length - 1}
                        className={`p-1 rounded ${index === modules.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Move down"
                      >
                        <FaArrowDown className="w-3 h-3" />
                      </button>
                    </div>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(module.isPublished)}`}>
                      {module.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleManageSubmodules(e, module)}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                        title="Manage Submodules"
                      >
                        <div className="flex items-center">
                          <FaList className="mr-1" />
                          <span>{module.subModuleCount || 0}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleManageLessons(e, module)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                        title="Manage Lessons"
                      >
                        <div className="flex items-center">
                          <FaBookOpen className="mr-1" />
                          <span>{module.lessonCount || 0}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleManageQuizzes(e, module)}
                        className="text-orange-600 hover:text-orange-900 font-medium"
                        title="Manage Quizzes"
                      >
                        <div className="flex items-center">
                          <FaQuestionCircle className="mr-1" />
                          <span>{module.quizCount || 0}</span>
                        </div>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => handleEditModule(e, module)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Module"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteModule(e, module)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Module"
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

export default ModuleList; 