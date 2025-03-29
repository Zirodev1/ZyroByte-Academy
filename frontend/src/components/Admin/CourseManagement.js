import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash, FaList } from "react-icons/fa";
import { toast } from "react-toastify";
import Header from "../Header";
import Footer from "../Footer";
import "./Admin.css";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
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
  const [editing, setEditing] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

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
      if (editing) {
        await api.put(`/courses/${courseId}`, form);
        toast.success("Course updated successfully");
      } else {
        await api.post('/courses', form);
        toast.success("Course created successfully");
      }
      
      resetForm();
      fetchCourses(selectedCategory);
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(error.response?.data?.message || (editing ? "Failed to update course" : "Failed to create course"));
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
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
    setEditing(true);
    setCourseId(course._id);
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

  const resetForm = () => {
    setForm({
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
    setEditing(false);
    setCourseId(null);
  };

  return (
    <div>
      <Header />
      <div className="admin-container">
        <div className="admin-content">
          <div className="admin-header">
            <h1 className="admin-title">Course Management</h1>
            <div className="admin-actions">
              <Link to="/admin/categories" className="admin-button secondary">Manage Categories</Link>
              <Link to="/admin" className="admin-button">Back to Dashboard</Link>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="admin-form">
            <h2>{editing ? "Edit Course" : "Create New Course"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Course Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  placeholder="Enter course title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  placeholder="Enter course description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryRef">Category</label>
                  <select
                    id="categoryRef"
                    name="categoryRef"
                    className="form-control"
                    value={form.categoryRef}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="level">Level</label>
                  <select
                    id="level"
                    name="level"
                    className="form-control"
                    value={form.level}
                    onChange={handleChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    className="form-control"
                    placeholder="e.g. 8 weeks"
                    value={form.duration}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="order">Display Order</label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    className="form-control"
                    placeholder="Order in category"
                    value={form.order}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prerequisites">Prerequisites</label>
                <input
                  type="text"
                  id="prerequisites"
                  name="prerequisites"
                  className="form-control"
                  placeholder="What students should know before starting"
                  value={form.prerequisites}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  className="form-control"
                  placeholder="Enter image URL for course thumbnail"
                  value={form.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                  />
                  Featured Course
                </label>
              </div>

              <div className="form-actions">
                {editing && (
                  <button 
                    type="button" 
                    className="admin-button secondary" 
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  className="admin-button" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : (editing ? "Update Course" : "Create Course")}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-list">
            <div className="admin-filter">
              <label htmlFor="categoryFilter">Filter by Category:</label>
              <select
                id="categoryFilter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-control"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <h2>Courses {selectedCategory && '(Filtered by Category)'}</h2>
            {loading && courses.length === 0 ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p>No courses found. Create a new course to get started.</p>
            ) : (
              <div className="course-list">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course._id}>
                        <td>{course.order || 0}</td>
                        <td>{course.title}</td>
                        <td>
                          {course.categoryRef?.name || course.category || 'Uncategorized'}
                        </td>
                        <td>{course.level}</td>
                        <td>{course.featured ? "Yes" : "No"}</td>
                        <td className="actions-cell">
                          <Link 
                            to={`/admin/courses/${course._id}/modules`}
                            className="btn-icon"
                            title="Manage Modules"
                          >
                            <FaList />
                          </Link>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleReorder(course._id, 'up')}
                            title="Move Up"
                          >
                            <FaArrowUp />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleReorder(course._id, 'down')}
                            title="Move Down"
                          >
                            <FaArrowDown />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEdit(course)}
                            title="Edit Course"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-icon delete" 
                            onClick={() => handleDelete(course._id)}
                            title="Delete Course"
                          >
                            <FaTrash />
                          </button>
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
      <Footer />
    </div>
  );
};

export default CourseManagement;
