import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';

const CategoryCourses = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryAndCourses = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/categories/${categoryId}`);
                const categoryData = response.data.data;
                setCategory(categoryData.category);
                setCourses(categoryData.courses || []);
            } catch (err) {
                console.error('Error fetching category and courses:', err);
                setError('Failed to load category courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryAndCourses();
    }, [categoryId]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-lg shadow p-6">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
                        <p className="mt-2 text-gray-600">{category?.description}</p>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(courses) && courses.map((course) => (
                            <div key={course._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48">
                                    <img 
                                        src={course.imageUrl || "https://images.unsplash.com/photo-1587620962725-abab7fe55159"} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <h3 className="text-lg font-semibold">{course.title}</h3>
                                        <div className="flex items-center mt-2 text-sm">
                                            <span className="mr-4">{course.level || 'Beginner'}</span>
                                            <span>{course.duration || '8 weeks'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lg font-semibold text-blue-600">
                                            {course.price === 0 ? 'Free' : `$${course.price}`}
                                        </span>
                                    </div>
                                    
                                    <Link 
                                        to={`/courses/${course._id}`}
                                        className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(!Array.isArray(courses) || courses.length === 0) && (
                        <div className="text-center py-12">
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