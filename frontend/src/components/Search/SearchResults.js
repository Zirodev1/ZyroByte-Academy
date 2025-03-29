import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import SearchBar from './SearchBar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialType = queryParams.get('type') || 'all';
  
  const [searchResults, setSearchResults] = useState({
    courses: [],
    lessons: [],
    quizzes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialType);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });
  
  // Execute search when query changes
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeTab, 1);
    }
  }, [initialQuery, activeTab]);

  const performSearch = async (query, type, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/search', {
        params: {
          query,
          type,
          page,
          limit: 10
        }
      });
      
      setSearchResults(response.data.results);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please try again.');
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    performSearch(query, activeTab);
  };

  const handleTabChange = (type) => {
    setActiveTab(type);
  };

  const handlePageChange = (page) => {
    performSearch(initialQuery, activeTab, page);
  };

  return (
    <>
      <Header />
      <div className="search-results-container">
        <div className="search-header">
          <h1>Search Results</h1>
          <SearchBar initialQuery={initialQuery} onSearch={handleSearch} />
        </div>
        
        <div className="search-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            All
          </button>
          <button 
            className={`tab-button ${activeTab === 'course' ? 'active' : ''}`}
            onClick={() => handleTabChange('course')}
          >
            Courses
          </button>
          <button 
            className={`tab-button ${activeTab === 'lesson' ? 'active' : ''}`}
            onClick={() => handleTabChange('lesson')}
          >
            Lessons
          </button>
          <button 
            className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => handleTabChange('quiz')}
          >
            Quizzes
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <p>Loading results...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : (
          <div className="results-content">
            {/* Course Results */}
            {(activeTab === 'all' || activeTab === 'course') && searchResults.courses && (
              <div className="result-section">
                <h2>Courses {searchResults.courses.length > 0 && `(${searchResults.coursesCount})`}</h2>
                {searchResults.courses.length === 0 ? (
                  <p>No courses found matching your search.</p>
                ) : (
                  <div className="results-grid">
                    {searchResults.courses.map(course => (
                      <div key={course._id} className="result-card">
                        {course.imageUrl && (
                          <div className="card-image">
                            <img src={course.imageUrl} alt={course.title} />
                          </div>
                        )}
                        <div className="card-content">
                          <h3>{course.title}</h3>
                          <p>{course.description.substring(0, 100)}...</p>
                          <div className="card-meta">
                            <span>{course.level}</span>
                            <span>{course.category}</span>
                          </div>
                          <Link to={`/courses/${course._id}`} className="view-button">
                            View Course
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Lesson Results */}
            {(activeTab === 'all' || activeTab === 'lesson') && searchResults.lessons && (
              <div className="result-section">
                <h2>Lessons {searchResults.lessons.length > 0 && `(${searchResults.lessonsCount})`}</h2>
                {searchResults.lessons.length === 0 ? (
                  <p>No lessons found matching your search.</p>
                ) : (
                  <div className="results-list">
                    {searchResults.lessons.map(lesson => (
                      <div key={lesson._id} className="list-item">
                        <h3>{lesson.title}</h3>
                        {lesson.course && (
                          <p>From course: {lesson.course.title}</p>
                        )}
                        <Link 
                          to={`/courses/${lesson.course._id}/lessons/${lesson._id}`} 
                          className="view-button"
                        >
                          View Lesson
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Quiz Results */}
            {(activeTab === 'all' || activeTab === 'quiz') && searchResults.quizzes && (
              <div className="result-section">
                <h2>Quizzes {searchResults.quizzes.length > 0 && `(${searchResults.quizzesCount})`}</h2>
                {searchResults.quizzes.length === 0 ? (
                  <p>No quizzes found matching your search.</p>
                ) : (
                  <div className="results-list">
                    {searchResults.quizzes.map(quiz => (
                      <div key={quiz._id} className="list-item">
                        <h3>{quiz.title}</h3>
                        {quiz.course && (
                          <p>From course: {quiz.course.title}</p>
                        )}
                        <Link 
                          to={`/courses/${quiz.course._id}/quizzes/${quiz._id}`} 
                          className="view-button"
                        >
                          Take Quiz
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="page-button"
                >
                  Previous
                </button>
                
                <span className="page-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button 
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="page-button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchResults; 