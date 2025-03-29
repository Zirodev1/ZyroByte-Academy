// backend/controllers/courseController.js
const Course = require('../models/Course');
const User = require('../models/User');
const EnrollmentAnalytics = require('../models/EnrollmentAnalytics');

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedCourses = async (req, res) => {
  try {
    const featuredCourses = await Course.find({ featured: true })
      .populate('categoryRef', 'name')
      .sort({ order: 1, createdAt: -1 })
      .limit(6);
    
    return res.status(200).json({
      success: true,
      count: featuredCourses.length,
      data: featuredCourses
    });
  } catch (error) {
    console.error('Error in getFeaturedCourses:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Filter by category if specified
    if (req.query.categoryRef) {
      filter.categoryRef = req.query.categoryRef;
    }
    
    // Filter by level if specified
    if (req.query.level) {
      filter.level = req.query.level;
    }
    
    // Count total matching documents
    const totalCourses = await Course.countDocuments(filter);
    
    // Get the courses with pagination
    const courses = await Course.find(filter)
      .populate('categoryRef', 'name')
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    return res.status(200).json({
      success: true,
      count: courses.length,
      total: totalCourses,
      totalPages: Math.ceil(totalCourses / limit),
      currentPage: page,
      data: courses
    });
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lessons')
      .populate('quizzes')
      .populate('categoryRef', 'name');
      
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error in getCourse:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { course: courseId },
      { new: true }
    );
    
    // Increment enrollment count
    course.enrollmentCount += 1;
    await course.save();
    
    // Track enrollment analytics
    const clientInfo = {
      browser: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || '0.0.0.0',
      device: req.headers['user-agent'] ? 
        (req.headers['user-agent'].includes('Mobile') ? 'Mobile' : 'Desktop') : 'Unknown',
      referralSource: req.headers['referer'] || 'Direct'
    };
    
    await EnrollmentAnalytics.create({
      user: userId,
      course: courseId,
      enrollmentDate: new Date(),
      ...clientInfo
    });
    
    return res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        courseTitle: course.title,
        courseId: course._id
      }
    });
  } catch (error) {
    console.error('Error in enrollCourse:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if any users are enrolled in this course
    const enrolledUsers = await User.countDocuments({ course: req.params.id });
    
    if (enrolledUsers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course with ${enrolledUsers} enrolled users`
      });
    }
    
    await course.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.reorderCourses = async (req, res) => {
  try {
    const { categoryRef, courseOrders } = req.body;
    
    if (!categoryRef) {
      return res.status(400).json({
        success: false,
        message: 'Category reference is required'
      });
    }
    
    if (!Array.isArray(courseOrders)) {
      return res.status(400).json({
        success: false,
        message: 'courseOrders must be an array'
      });
    }
    
    // Update each course's order
    const updatePromises = courseOrders.map(item => {
      return Course.findByIdAndUpdate(
        item.id,
        { order: item.order },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Courses reordered successfully'
    });
  } catch (error) {
    console.error('Error in reorderCourses:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
  