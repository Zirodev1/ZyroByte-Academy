import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaCode } from 'react-icons/fa';
import Sidebar from './Course/Sidebar';

const ExerciseManagement = () => {
  const { moduleId, subModuleId } = useParams();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentInfo, setParentInfo] = useState({
    type: subModuleId ? 'submodule' : 'module',
    id: subModuleId || moduleId,
    data: null
  });
  const [courseInfo, setCourseInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParentInfo();
    fetchExercises();
  }, [moduleId, subModuleId]);

  const fetchParentInfo = async () => {
    try {
      const isSubmodule = !!subModuleId;
      const endpoint = isSubmodule 
        ? `/submodules/${subModuleId}` 
        : `/modules/${moduleId}`;
      
      const response = await api.get(endpoint);
      const parentData = response.data.data;
      setParentInfo({
        type: isSubmodule ? 'submodule' : 'module',
        id: isSubmodule ? subModuleId : moduleId,
        data: parentData
      });

      // Fetch course info if we have module
      if (!isSubmodule && parentData.course) {
        fetchCourseInfo(parentData.course);
      } else if (isSubmodule && parentData.module) {
        // We have a submodule, get its module first
        const moduleResponse = await api.get(`/modules/${parentData.module}`);
        const moduleData = moduleResponse.data.data;
        
        if (moduleData.course) {
          fetchCourseInfo(moduleData.course);
        }
      }
    } catch (err) {
      console.error("Error fetching parent info:", err);
      toast.error('Failed to load content information');
    }
  };

  const fetchCourseInfo = async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourseInfo(response.data.data);
    } catch (err) {
      console.error("Error fetching course info:", err);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const endpoint = subModuleId 
        ? `/exercises/submodule/${subModuleId}` 
        : `/exercises/module/${moduleId}`;
      
      const response = await api.get(endpoint);
      setExercises(response.data.data || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = () => {
    const baseUrl = subModuleId 
      ? `/admin/submodules/${subModuleId}/exercises/create` 
      : `/admin/modules/${moduleId}/exercises/create`;
    navigate(baseUrl);
  };

  const getBackUrl = () => {
    if (subModuleId) {
      return `/admin/modules/${parentInfo.data?.module}/submodules`;
    } else if (moduleId && courseInfo) {
      return `/admin/courses/${courseInfo._id}/modules`;
    } else {
      return '/admin/courses';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar activePath="/admin/courses" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Header with navigation */}
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(getBackUrl())}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Coding Exercises: {parentInfo.data?.title || 'Loading...'}
              </h1>
              <p className="text-sm text-gray-500">
                Manage coding exercises for this {parentInfo.type}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div></div> {/* Empty div for flex spacing */}
            <button
              onClick={handleCreateExercise}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Create New Exercise
            </button>
          </div>

          {/* Exercise List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                <FaCode className="inline-block mr-2 text-blue-600" />
                Coding Exercises ({exercises.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading exercises...</p>
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No coding exercises found. Create a new exercise to get started.</p>
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
                        Difficulty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exercises.map((exercise, index) => (
                      <tr key={exercise._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exercise.order || index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{exercise.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {exercise.description && exercise.description.length > 100
                              ? `${exercise.description.substring(0, 100)}...`
                              : exercise.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${exercise.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                              exercise.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                            {exercise.difficulty || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {exercise.language || 'JavaScript'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Exercise"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              title="Delete Exercise"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
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
        </div>
      </div>
    </div>
  );
};

export default ExerciseManagement; 