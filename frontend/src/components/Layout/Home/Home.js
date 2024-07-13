// src/components/Home/Home.js
import React, {useState, useEffect } from 'react';
import { Link } from'react-router-dom';
import api from '../../../services/api'
import Header from '../../Header';
import Footer from '../../Footer';

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await api.get('/courses/featured');
        setFeaturedCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch featured courses', error);
      }
    }

    fetchFeaturedCourses();
  }, []);

  return (
    <div>
      <Header />
      <main>
        <section className="hero">
          <h1>Welcome to ZyroByte Academy</h1>
          <p>Your one-stop destination to master programming, web development, game development, cybersecurity, and more!</p>
         <Link to="/courses" className="button">Explore Courses</Link>
        </section>
        <section className="featured-courses">
          <h2>Featured Courses</h2>
          <ul>
            {featuredCourses.map(course => (
              <li key={course.id}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <Link to={`/courses/${course._id}`} className="btn">Learn More</Link>
              </li>
            ))}
          </ul>
        </section>
        {/* Add more sections like Testimonials here if needed */}
      </main>
      <Footer />
    </div>
  );
}
