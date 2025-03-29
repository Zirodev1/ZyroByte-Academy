import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import Sidebar from "../Course/Sidebar";
import CourseList from "../Course/CourseList";

const CategoryCourses = () => {
  const [category, setCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCategoryAndCourses();
    }
  }, [id]);

  const fetchCategoryAndCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch the category details
      const categoryResponse = await api.get(`/categories/${id}`);
      
      if (!categoryResponse.data.success) {
        throw new Error("Failed to load category data");
      }
      
      // Get category from response
      const categoryData = categoryResponse.data.data.category || categoryResponse.data.data;
      setCategory(categoryData);
      
      // Fetch courses for this category
      const coursesResponse = await api.get(`/courses?categoryRef=${id}`);
      
      if (!coursesResponse.data.success) {
        throw new Error("Failed to load courses data");
      }
      
      setCourses(coursesResponse.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching category and courses:", err);
      setError(err.message || "Failed to load data. Please try again.");
      toast.error("Failed to load category data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    // Navigate to course creation with pre-selected category
    navigate(`/admin/courses?category=${id}`);
  };

  // These functions will be passed to CourseList
  const handleEdit = (course) => {
    // Navigate to course edit with the course ID
    navigate(`/admin/courses/edit/${course._id}`);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        setLoading(true);
        await api.delete(`/courses/${courseId}`);
        toast.success("Course deleted successfully");
        
        // Refresh courses
        fetchCategoryAndCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error("Failed to delete course");
        setLoading(false);
      }
    }
  };

  const handleReorder = async (courseId, direction) => {
    // Find current course
    const courseIndex = courses.findIndex(c => c._id === courseId);
    if (courseIndex === -1) return;
    
    // Get current and target order
    const currentCourse = courses[courseIndex];
    let targetIndex;
    
    if (direction === 'up' && courseIndex > 0) {
      targetIndex = courseIndex - 1;
    } else if (direction === 'down' && courseIndex < courses.length - 1) {
      targetIndex = courseIndex + 1;
    } else {
      return; // Can't move further in that direction
    }
    
    const targetCourse = courses[targetIndex];
    
    try {
      await api.post('/courses/reorder', {
        categoryRef: id,
        courseOrders: [
          { id: currentCourse._id, order: targetCourse.order },
          { id: targetCourse._id, order: currentCourse.order }
        ]
      });
      
      toast.success("Courses reordered successfully");
      fetchCategoryAndCourses();
    } catch (error) {
      console.error('Error reordering courses:', error);
      toast.error("Failed to reorder courses");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar activePath="/admin/categories" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          {loading && !category ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading category data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
              <button 
                onClick={() => navigate('/admin/categories')}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Back to Categories
              </button>
            </div>
          ) : (
            <>
              {/* Header with navigation */}
              <div className="flex items-center mb-6">
                <button
                  onClick={() => navigate('/admin/categories')}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100"
                  title="Back to Categories"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{category?.name} Courses</h1>
              </div>
              
              {/* Category Details */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-start">
                  {category?.imageUrl && (
                    <div className="mr-6">
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{category?.name}</h2>
                    <p className="text-gray-700 mb-4">{category?.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4">
                        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {courses.length} Courses
                        </div>
                        {category?.studentCount && (
                          <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            {category.studentCount} Students
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={handleCreateCourse}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                        >
                          <FaPlus className="mr-2" />
                          Add Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Course List */}
              <CourseList 
                courses={courses}
                categories={[category]} // Just pass the current category
                selectedCategory={id}
                setSelectedCategory={() => {}} // No-op since we're in a specific category view
                loading={loading}
                handleReorder={handleReorder}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCourses; 