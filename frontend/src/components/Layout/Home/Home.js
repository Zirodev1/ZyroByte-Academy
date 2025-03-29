// src/components/Home/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import Header from '../../Header';
import Footer from '../../Footer';
import './Home.css';

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/courses/featured');
        
        // Check which response format we're getting and handle accordingly
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          // New format
          setFeaturedCourses(response.data.data);
        } else if (Array.isArray(response.data)) {
          // Old format
          setFeaturedCourses(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setFeaturedCourses([]);
        }
      } catch (error) {
        console.error('Failed to fetch featured courses', error);
        setFeaturedCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <div className="home-container">
      <Header />
      
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Welcome to <span className="highlight">ZyroByte Academy</span></h1>
            <p className="hero-subtitle">
              Your journey to becoming a skilled programmer starts here. 
              Learn at your own pace with interactive lessons and hands-on projects.
            </p>
            <div className="hero-buttons">
              <Link to="/courses" className="primary-button">Explore Courses</Link>
              <Link to="/register" className="secondary-button">Sign Up Free</Link>
            </div>
          </div>
          <div className="hero-image-container">
            <img 
              src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2" 
              alt="Coding on a laptop" 
              className="hero-image"
            />
          </div>
        </section>
        
        <section className="features-section">
          <h2 className="section-title">Why Choose ZyroByte Academy?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Comprehensive Curriculum</h3>
              <p>From beginner to advanced, our courses cover everything you need to succeed in tech.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍💻</div>
              <h3>Hands-on Learning</h3>
              <p>Practice coding with interactive exercises and real-world projects.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Learn at Your Pace</h3>
              <p>Access course materials anytime, anywhere, and learn at your own pace.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Earn Certificates</h3>
              <p>Showcase your skills with certificates upon course completion.</p>
            </div>
          </div>
        </section>
        
        <section className="featured-courses-section">
          <h2 className="section-title">Featured Courses</h2>
          
          {isLoading ? (
            <div className="loading-spinner">Loading courses...</div>
          ) : (
            <div className="course-cards">
              {featuredCourses.map(course => (
                <div className="course-card" key={course._id}>
                  <div className="course-image-container">
                    <img 
                      src={course.imageUrl || 'https://images.unsplash.com/photo-1587620962725-abab7fe55159'} 
                      alt={course.title} 
                      className="course-image"
                    />
                    <div className="course-level">{course.level || 'Beginner'}</div>
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <div className="course-details">
                      <span className="course-duration">{course.duration || '8 weeks'}</span>
                      <Link to={`/courses/${course._id}`} className="course-button">View Course</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="courses-cta">
            <Link to="/courses" className="primary-button">View All Courses</Link>
          </div>
        </section>
        
        <section className="testimonial-section">
          <h2 className="section-title">What Our Students Say</h2>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "ZyroByte Academy's courses helped me transition from a complete beginner to a confident 
              developer in just a few months. The structured curriculum and hands-on projects made learning exciting!"
            </p>
            <div className="testimonial-author">Sarah Johnson, Frontend Developer</div>
          </div>
        </section>
        
        <section className="cta-section">
          <h2>Ready to Start Your Learning Journey?</h2>
          <p>Join thousands of students already learning on ZyroByte Academy</p>
          <Link to="/register" className="primary-button">Get Started Today</Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
