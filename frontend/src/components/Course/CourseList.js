import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const CourseList = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            const response = await api.get("/courses");
            setCourses(response.data);
        };

        fetchCourses();
    }, []);

    return (
        <div>
            <h2>Available Courses</h2>
            <ul>
                {courses.map((course) => (
                    <li key={course._id}>
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <Link to={`/courses/${course._id}`}>View Course</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default CourseList;