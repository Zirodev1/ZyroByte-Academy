import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import AdminSidebar from "../adminSidebar";
import CourseForm from "./CourseForm";

const CourseCreate = () => {
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
    
    // Check if a category was pre-selected (from URL query)
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category');
    
    if (categoryId) {
      setForm(prev => ({
        ...prev,
        categoryRef: categoryId
      }));
    }
  }, [location]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || []);
      
      // If we have a pre-selected category, update the form with the category name
      const categoryId = form.categoryRef;
      if (categoryId && response.data.data) {
        const selectedCat = response.data.data.find(cat => cat._id === categoryId);
        if (selectedCat) {
          setForm(prev => ({
            ...prev,
            category: selectedCat.name
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
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
      await api.post('/courses', form);
      toast.success("Course created successfully");
      navigate('/admin/courses');
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          </div>
          
          {/* Course Form Component */}
          <CourseForm 
            form={form}
            editing={false}
            loading={loading}
            categories={categories}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            resetForm={() => navigate('/admin/courses')}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCreate; 