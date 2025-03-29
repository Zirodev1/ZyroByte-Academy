import api from './api';

class SearchService {
  // Global search across all content types
  async searchAll(params) {
    try {
      const response = await api.get('/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error in global search:', error);
      throw error;
    }
  }

  // Search courses with filtering
  async searchCourses(params) {
    try {
      const response = await api.get('/search/courses', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  // Search lessons with filtering
  async searchLessons(params) {
    try {
      const response = await api.get('/search/lessons', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching lessons:', error);
      throw error;
    }
  }

  // Search quizzes with filtering
  async searchQuizzes(params) {
    try {
      const response = await api.get('/search/quizzes', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching quizzes:', error);
      throw error;
    }
  }
}

export default new SearchService(); 