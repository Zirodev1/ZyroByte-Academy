import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';

const CategoryCourses = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch category and its courses
                const response = await api.get(`/categories/${categoryId}`);
                const categoryData = response.data.data;
                setCategory(categoryData.category);
                setCourses(categoryData.courses || []);
                
                // Fetch user enrollments if logged in
                const token = localStorage.getItem('token');
                if (token) {
                    const userResponse = await api.get('/users/profile');
                    if (userResponse.data.user && userResponse.data.user.enrolledCourses) {
                        setEnrollments(userResponse.data.user.enrolledCourses);
                    }
                }
            } catch (err) {
                console.error('Error fetching category and courses:', err);
                setError('Failed to load courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);

    const getEnrollmentForCourse = (courseId) => {
        return enrollments.find(enrollment => 
            enrollment.course._id === courseId || enrollment.course === courseId
        );
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-lg shadow p-6">
                                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                                        <div className="h-8 bg-gray-200 rounded-full w-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const handleCourseClick = (courseId) => {
        const enrollment = getEnrollmentForCourse(courseId);
        
        if (enrollment) {
            // User is already enrolled, take them to the course viewer
            navigate(`/courses/${courseId}/lessons`);
        } else {
            // User is not enrolled, take them to the course detail page
            navigate(`/courses/${courseId}`);
        }
    };

    // Format date function
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
                        <p className="mt-2 text-gray-600">{category?.description}</p>
                    </div>

                    {/* Courses List */}
                    <div className="space-y-4">
                        {Array.isArray(courses) && courses.map((course) => {
                            const enrollment = getEnrollmentForCourse(course._id);
                            const isEnrolled = !!enrollment;
                            const progress = enrollment ? enrollment.progress || 0 : 0;
                            const assignmentsPassed = enrollment ? enrollment.assignmentsPassed || 0 : 0;
                            const totalAssignments = course.totalAssignments || 0;
                            const assignmentsPercentage = totalAssignments > 0 
                                ? Math.round((assignmentsPassed / totalAssignments) * 100) 
                                : 0;
                            
                            return (
                                <div 
                                    key={course._id} 
                                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                                    onClick={() => handleCourseClick(course._id)}
                                >
                                    <div className="p-6 relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                                                <p className="text-sm text-gray-500">{formatDate(course.createdAt)}</p>
                                            </div>
                                            {isEnrolled && (
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium mr-2">Progress</span>
                                                    <div className="w-12 h-12 rounded-full border-4 border-blue-100 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-blue-600">{progress}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {isEnrolled && (
                                            <>
                                                <div className="mt-4 mb-1">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Learning Pace: {course.learningPace || '1x'} (guideline is 1x)</span>
                                                    </div>
                                                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-green-500" 
                                                            style={{ width: `${Math.min(100, (course.learningPace || 1) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Assignments: {assignmentsPassed}/{totalAssignments} Passed</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gray-500" 
                                                            style={{ width: `${assignmentsPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-6">
                                                    <div className="h-16 bg-blue-50 rounded-md">
                                                        <div className="relative h-full">
                                                            <div 
                                                                className="absolute bottom-0 left-0 right-0 bg-blue-100 rounded-b-md"
                                                                style={{ height: '60%' }}
                                                            ></div>
                                                            <div 
                                                                className="absolute bottom-0 left-0 h-1 bg-blue-500"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        
                                        {!isEnrolled && (
                                            <>
                                                <p className="text-gray-600 mt-2 mb-4">{course.description}</p>
                                                <div className="flex items-center text-sm">
                                                    <span className="mr-4">{course.level || 'Beginner'}</span>
                                                    <span>{course.duration || '8 weeks'}</span>
                                                    <span className="mx-4">•</span>
                                                    <span>{course.lessonsCount || '0'} Lessons</span>
                                                </div>
                                                <button 
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                                >
                                                    Enroll Now
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {(!Array.isArray(courses) || courses.length === 0) && (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                            <p className="text-gray-600 mb-6">
                                We couldn't find any courses in this category. Please check back later.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CategoryCourses; 