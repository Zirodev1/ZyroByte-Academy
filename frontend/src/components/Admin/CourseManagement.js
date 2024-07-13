import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Header from "../Header";
import Footer from "../Footer";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editing, setEditing] = useState(false);
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    const fectchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses", error);
      }
    };

    fectchCourses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        if (editing) {
            await api.put(`/courses/${courseId}`, form);
        }else {
            await api.post('/courses', form);
        }
        setForm({ title: '', description: ''});
        setEditing(false);
        setCourseId(null);
        const response = await api.get('/courses');
        setCourses(response.data)
    } catch (error) {}
  };

  const handleEdit = (course) => {
    setForm({ title: course.title, description: course.description });
    setEditing(true);
    setCourseId(course._id);
  };

  const handleDelete = async (id) => {
    try {
        await api.delete(`/courses/${id}`);
        const response = await api.get('/courses');
        setCourses(response.data);
    } catch (error) {
        console.error('Error deleting course', error);
    }
  }

  return (
    <div>
      <Header />
      <main>
        <h2>Course Management</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <button type="submit">{editing ? 'Update' : 'Create'} Course</button>
        </form>
        <ul>
          {courses.map((course) => (
            <li key={course._id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <button onClick={() => handleEdit(course)}>Edit</button>
              <button onClick={() => handleDelete(course._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default CourseManagement;
