import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";

// Import components
import Sidebar from "./Sidebar";
import CourseList from "./CourseList";
import CourseStats from "./CourseStats";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");
  const { categoryId } = useParams(); // Extract categoryId from URL if present
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    
    // If a categoryId is provided in the URL, set it as the selected category
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  // Fetch courses based on selected category
  useEffect(() => {
    fetchCourses(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchCourses = async (categoryId = '') => {
    try {
      setLoading(true);
      
      // Build URL with category filter if selected
      const url = categoryId 
        ? `/courses?categoryRef=${categoryId}` 
        : '/courses';
      
      const response = await api.get(url);
      
      if (response.data.success) {
        // New API format with pagination
        setCourses(response.data.data || []);
      } else {
        console.error("Unexpected response format:", response.data);
        setCourses([]);
        setError("Received unexpected data format from server");
      }
      
      setError("");
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again.");
      setCourses([]); // Set empty array to prevent map errors
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    navigate(`/admin/courses/edit/${course._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        setLoading(true);
        await api.delete(`/courses/${id}`);
        toast.success("Course deleted successfully");
        fetchCourses(selectedCategory);
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error(error.response?.data?.message || "Failed to delete course");
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
        categoryRef: currentCourse.categoryRef,
        courseOrders: [
          { id: currentCourse._id, order: targetCourse.order },
          { id: targetCourse._id, order: currentCourse.order }
        ]
      });
      
      toast.success("Courses reordered successfully");
      fetchCourses(selectedCategory);
    } catch (error) {
      console.error('Error reordering courses:', error);
      toast.error("Failed to reorder courses");
    }
  };

  const handleCreateCourse = () => {
    // Navigate to create course page with category pre-selected if one is selected
    if (selectedCategory) {
      navigate(`/admin/courses/create?category=${selectedCategory}`);
    } else {
      navigate('/admin/courses/create');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar activePath="/admin/courses" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory 
                ? `Courses: ${categories.find(c => c._id === selectedCategory)?.name || 'Selected Category'}`
                : 'Course Management'
              }
            </h1>
            <button
              onClick={handleCreateCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Create New Course
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {/* Course Statistics */}
          <CourseStats loading={statsLoading} />
          
          {/* Course List Component */}
          <CourseList 
            courses={courses}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            loading={loading}
            handleReorder={handleReorder}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseManagement; 