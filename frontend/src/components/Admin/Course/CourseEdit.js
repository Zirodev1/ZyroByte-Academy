import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import Sidebar from "./Sidebar";
import CourseForm from "./CourseForm";

const CourseEdit = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "Beginner",
    category: "",
    categoryRef: "",
    duration: "",
    prerequisites: "",
    featured: false,
    order: 0,
    imageUrl: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoaded, setCourseLoaded] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchCourse(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchCourse = async (courseId) => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      
      if (response.data.success) {
        const course = response.data.data;
        setForm({
          title: course.title || "",
          description: course.description || "",
          level: course.level || "Beginner",
          category: course.category || "",
          categoryRef: course.categoryRef?._id || course.categoryRef || "",
          duration: course.duration || "",
          prerequisites: course.prerequisites || "",
          featured: course.featured || false,
          order: course.order || 0,
          imageUrl: course.imageUrl || ""
        });
        setCourseLoaded(true);
      } else {
        toast.error("Failed to load course data");
        navigate('/admin/courses');
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course data");
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    // Special handling for category selection
    if (e.target.name === 'categoryRef' && value) {
      // Find the category name for display purposes
      const selectedCat = categories.find(cat => cat._id === value);
      setForm({
        ...form,
        categoryRef: value,
        category: selectedCat ? selectedCat.name : ''
      });
    } else {
      setForm({ ...form, [e.target.name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/courses/${id}`, form);
      toast.success("Course updated successfully");
      navigate('/admin/courses');
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.message || "Failed to update course");
      setLoading(false);
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
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/admin/courses')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back to Courses"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          </div>
          
          {loading && !courseLoaded ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading course data...</p>
            </div>
          ) : (
            /* Course Form Component */
            <CourseForm 
              form={form}
              editing={true}
              loading={loading}
              categories={categories}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              resetForm={() => navigate('/admin/courses')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEdit; 