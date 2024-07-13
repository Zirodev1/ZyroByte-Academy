import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [error, setError] = useState('');
  
    useEffect(() => {
      const fetchCourse = async () => {
        try {
          const response = await api.get(`/courses/${id}`);
          setCourse(response.data);
        } catch (error) {
          console.error('Error fetching course:', error);
          setError('Error fetching course');
        }
      };
  
      fetchCourse();
    }, [id]);

    const handleEnroll = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            await api.post(`/courses/${id}/enroll`, {}, {
                headers: { Authorization: `Bearer ${token}`},
            });
            alert('Enrolled successfully!');
        }catch (error){
            console.log('Error enrolling in course: ', error);
            alert('Error enrolling in course');
        }
    }
  
    if (error) return <div>{error}</div>;
  
    if (!course) return <div>Loading...</div>;
  
    return (
      <div>
        <Header />
        <main>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <button onClick={handleEnroll}>Enroll</button>
          <div>
            <h3>Lessons</h3>
            <ul>
              {course.lessons.map((lesson) => (
                <li key={lesson._id}>
                  <h4>{lesson.title}</h4>
                  <p>{lesson.content}</p>
                  {lesson.videoUrl && <video src={lesson.videoUrl} controls />}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Quizzes</h3>
            <ul>
              {course.quizzes.map((quiz) => (
                <li key={quiz._id}>
                  <h4>{quiz.title}</h4>
                  <Link to={`/courses/${course._id}/quizzes/${quiz._id}`}>Take Quiz</Link>
                </li>
              ))}
            </ul>
          </div>
        </main>
        <Footer />
      </div>
    );
  };

export default CourseDetails;