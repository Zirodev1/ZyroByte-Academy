import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', course: '' });
  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [lessonId, setLessonId] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await api.get('/lessons');
        setLessons(response.data);
      } catch (error) {
        console.error('Error fetching lessons', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses', error);
      }
    };

    fetchLessons();
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/lessons/${lessonId}`, form);
      } else {
        await api.post('/lessons', form);
      }
      setForm({ title: '', content: '', course: '' });
      setEditing(false);
      setLessonId(null);
      const response = await api.get('/lessons');
      setLessons(response.data);
    } catch (error) {
      console.error('Error saving lesson', error);
    }
  };

  const handleEdit = (lesson) => {
    setForm({ title: lesson.title, content: lesson.content, course: lesson.course });
    setEditing(true);
    setLessonId(lesson._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/lessons/${id}`);
      const response = await api.get('/lessons');
      setLessons(response.data);
    } catch (error) {
      console.error('Error deleting lesson', error);
    }
  };

  return (
    <div>
      <Header />
      <main>
        <h2>Lesson Management</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="content"
            placeholder="Content"
            value={form.content}
            onChange={handleChange}
            required
          />
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
          <button type="submit">{editing ? 'Update' : 'Create'} Lesson</button>
        </form>
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson._id}>
              <h3>{lesson.title}</h3>
              <p>{lesson.content}</p>
              <button onClick={() => handleEdit(lesson)}>Edit</button>
              <button onClick={() => handleDelete(lesson._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default LessonManagement;