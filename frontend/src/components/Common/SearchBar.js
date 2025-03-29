import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ placeholder = "Search courses, lessons, and quizzes...", onSearch, initialQuery = '', size = 'medium' }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (onSearch) {
      // If onSearch is provided, use that callback
      onSearch(query);
    } else {
      // Otherwise, navigate to search results page
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form className={`search-bar-container ${size}`} onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search"
      />
      <button 
        type="submit" 
        className="search-button"
        disabled={!query.trim()}
        aria-label="Submit search"
      >
        <i className="search-icon">🔍</i>
      </button>
    </form>
  );
};

export default SearchBar; 