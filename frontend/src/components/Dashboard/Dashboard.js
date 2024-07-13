import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found');
          return;
        }

        const response = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setCourses(response.data.courses);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Error fetching user profile');
      }
    };

    fetchProfile();
  }, []);

  if (error) return <div>{error}</div>;

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <Header />
      <main>
        <h2>Dashboard</h2>
        <div>
          <h3>User Profile</h3>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Subscribed: {user.subscribed ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <h3>Enrolled Courses</h3>
          <ul>
            {courses.length > 0 ? (
              courses.map((course) => (
                <li key={course._id}>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <p>Progress: {course.progress || 0}%</p>
                </li>
              ))
            ) : (
              <p>No enrolled courses available</p>
            )}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;