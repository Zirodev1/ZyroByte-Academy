const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Search across all content types
exports.searchAll = async (req, res) => {
  try {
    const { query, type, category, level, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Create base search condition
    let searchQuery = {};
    
    // Add text search if query is provided
    if (query) {
      searchQuery = { 
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      };
    }
    
    // Handle content type filtering
    if (type && !['course', 'lesson', 'quiz', 'all'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type parameter. Must be one of: course, lesson, quiz, all' });
    }
    
    // Add category filter for courses
    if (category) {
      searchQuery.category = category;
    }
    
    // Add level filter for courses
    if (level) {
      searchQuery.level = level;
    }
    
    // Define promises for different content types
    let promises = [];
    let results = {};
    
    // Search courses
    if (type === 'course' || type === 'all' || !type) {
      const coursePromise = Course.find(searchQuery)
        .sort({ featured: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('title description imageUrl level category duration featured')
        .exec()
        .then(courses => {
          results.courses = courses;
          return Course.countDocuments(searchQuery);
        })
        .then(count => {
          results.coursesCount = count;
        });
      
      promises.push(coursePromise);
    }
    
    // Search lessons
    if (type === 'lesson' || type === 'all' || !type) {
      const lessonPromise = Lesson.find(query ? { title: { $regex: query, $options: 'i' } } : {})
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('title course order videoUrl')
        .populate('course', 'title')
        .exec()
        .then(lessons => {
          results.lessons = lessons;
          return Lesson.countDocuments(query ? { title: { $regex: query, $options: 'i' } } : {});
        })
        .then(count => {
          results.lessonsCount = count;
        });
      
      promises.push(lessonPromise);
    }
    
    // Search quizzes
    if (type === 'quiz' || type === 'all' || !type) {
      const quizPromise = Quiz.find(query ? { title: { $regex: query, $options: 'i' } } : {})
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('title course lesson')
        .populate('course', 'title')
        .populate('lesson', 'title')
        .exec()
        .then(quizzes => {
          results.quizzes = quizzes;
          return Quiz.countDocuments(query ? { title: { $regex: query, $options: 'i' } } : {});
        })
        .then(count => {
          results.quizzesCount = count;
        });
      
      promises.push(quizPromise);
    }
    
    // Wait for all search operations to complete
    await Promise.all(promises);
    
    // Format pagination info
    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(
        (results.coursesCount || 0 + results.lessonsCount || 0 + results.quizzesCount || 0) / parseInt(limit)
      ),
      limit: parseInt(limit)
    };
    
    res.json({
      success: true,
      pagination,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error performing search', error: error.message });
  }
};

// Get courses with filtering
exports.getCourses = async (req, res) => {
  try {
    const { 
      query, 
      category, 
      level,
      featured, 
      sortBy = 'createdAt', 
      order = 'desc',
      limit = 10, 
      page = 1 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let searchQuery = {};
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      searchQuery.category = category;
    }
    
    // Level filter
    if (level) {
      searchQuery.level = level;
    }
    
    // Featured filter
    if (featured === 'true') {
      searchQuery.featured = true;
    }
    
    // Determine sort order
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    // If sorting by popularity, we'd need an enrollment count (this is a placeholder)
    if (sortBy === 'popular') {
      sortOptions.enrollmentCount = sortOrder;
    }
    
    // Execute query with pagination
    const courses = await Course.find(searchQuery)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select('title description imageUrl level category duration featured createdAt');
    
    const totalItems = await Course.countDocuments(searchQuery);
    
    // Get available categories and levels for filters
    const categories = await Course.distinct('category');
    const levels = await Course.distinct('level');
    
    // Format response
    res.json({
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        limit: parseInt(limit)
      },
      filters: {
        categories,
        levels
      },
      courses
    });
  } catch (error) {
    console.error('Course search error:', error);
    res.status(500).json({ message: 'Error searching courses', error: error.message });
  }
};

// Get lessons with filtering
exports.getLessons = async (req, res) => {
  try {
    const { 
      query, 
      courseId,
      hasVideo, 
      sortBy = 'order', 
      order = 'asc',
      limit = 10, 
      page = 1 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let searchQuery = {};
    
    // Text search
    if (query) {
      searchQuery.title = { $regex: query, $options: 'i' };
    }
    
    // Course filter
    if (courseId) {
      searchQuery.course = courseId;
    }
    
    // Video filter
    if (hasVideo === 'true') {
      searchQuery.videoUrl = { $exists: true, $ne: '' };
    } else if (hasVideo === 'false') {
      searchQuery.videoUrl = { $exists: false };
    }
    
    // Determine sort order
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    // Execute query with pagination
    const lessons = await Lesson.find(searchQuery)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select('title course order videoUrl createdAt')
      .populate('course', 'title imageUrl');
    
    const totalItems = await Lesson.countDocuments(searchQuery);
    
    // Format response
    res.json({
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        limit: parseInt(limit)
      },
      lessons
    });
  } catch (error) {
    console.error('Lesson search error:', error);
    res.status(500).json({ message: 'Error searching lessons', error: error.message });
  }
};

// Get quizzes with filtering
exports.getQuizzes = async (req, res) => {
  try {
    const { 
      query, 
      courseId,
      lessonId,
      limit = 10, 
      page = 1 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let searchQuery = {};
    
    // Text search
    if (query) {
      searchQuery.title = { $regex: query, $options: 'i' };
    }
    
    // Course filter
    if (courseId) {
      searchQuery.course = courseId;
    }
    
    // Lesson filter
    if (lessonId) {
      searchQuery.lesson = lessonId;
    }
    
    // Execute query with pagination
    const quizzes = await Quiz.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('title course lesson createdAt')
      .populate('course', 'title')
      .populate('lesson', 'title');
    
    const totalItems = await Quiz.countDocuments(searchQuery);
    
    // Format response
    res.json({
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        limit: parseInt(limit)
      },
      quizzes
    });
  } catch (error) {
    console.error('Quiz search error:', error);
    res.status(500).json({ message: 'Error searching quizzes', error: error.message });
  }
}; 