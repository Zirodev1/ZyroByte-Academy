// backend/controllers/userController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const user = new User({ name, email, password });
    await user.save();
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Log login activity
    user.activityLog.push({
      type: 'login',
      timestamp: Date.now(),
      details: { ip: req.ip }
    });
    
    // Update last active timestamp
    user.lastActive = Date.now();
    
    // Update streak
    updateUserStreak(user);
    
    await user.save();
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description imageUrl level duration category'
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, bio, interests } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (interests !== undefined) user.interests = interests;
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        interests: user.interests,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is already enrolled
    const user = await User.findById(userId);
    const alreadyEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === courseId
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Add course to user's enrolled courses
    user.enrolledCourses.push({
      course: courseId,
      progress: 0,
      completedLessons: [],
      quizResults: [],
      startedLessons: [],
      dateEnrolled: Date.now(),
      lastAccessed: Date.now()
    });
    
    // Log enrollment activity
    user.activityLog.push({
      type: 'enrollment',
      timestamp: Date.now(),
      details: { 
        courseId,
        courseTitle: course.title
      }
    });
    
    // Update last active timestamp
    user.lastActive = Date.now();
    
    // Update streak
    updateUserStreak(user);
    
    await user.save();
    
    res.status(200).json({
      message: 'Successfully enrolled in course',
      enrollment: user.enrolledCourses[user.enrolledCourses.length - 1]
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId, completed, timeSpent } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the course enrollment
    const courseIndex = user.enrolledCourses.findIndex(
      enrollment => enrollment.course.toString() === courseId
    );
    
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course enrollment not found' });
    }
    
    // Get the course enrollment
    const enrollment = user.enrolledCourses[courseIndex];
    
    // Update last accessed timestamp for the course
    enrollment.lastAccessed = Date.now();
    
    // Update completed lessons
    if (completed) {
      // Add lesson to completed lessons if not already there
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
        
        // Log lesson completion activity
        user.activityLog.push({
          type: 'lesson_completion',
          timestamp: Date.now(),
          details: { 
            courseId,
            lessonId
          }
        });
        
        // Check if course is completed
        const course = await Course.findById(courseId);
        const totalLessons = await Lesson.countDocuments({ course: courseId });
        
        if (enrollment.completedLessons.length === totalLessons) {
          // Log course completion activity
          user.activityLog.push({
            type: 'course_completion',
            timestamp: Date.now(),
            details: { 
              courseId,
              courseTitle: course.title
            }
          });
        }
      }
    } else {
      // Remove lesson from completed lessons
      enrollment.completedLessons = enrollment.completedLessons.filter(
        id => id.toString() !== lessonId
      );
    }
    
    // Update or add to started lessons
    const startedLessonIndex = enrollment.startedLessons.findIndex(
      sl => sl.lesson.toString() === lessonId
    );
    
    if (startedLessonIndex === -1) {
      // Lesson hasn't been started before
      enrollment.startedLessons.push({
        lesson: lessonId,
        startedAt: Date.now(),
        lastAccessed: Date.now(),
        timeSpent: timeSpent || 0
      });
    } else {
      // Update existing started lesson
      const startedLesson = enrollment.startedLessons[startedLessonIndex];
      startedLesson.lastAccessed = Date.now();
      if (timeSpent) {
        startedLesson.timeSpent += timeSpent;
        user.totalTimeSpent += timeSpent;
      }
    }
    
    // Calculate progress percentage
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedCount = enrollment.completedLessons.length;
    
    enrollment.progress = 
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    
    // Update last active timestamp
    user.lastActive = Date.now();
    
    // Update streak
    updateUserStreak(user);
    
    await user.save();
    
    res.status(200).json({
      message: 'Progress updated successfully',
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.submitQuizResults = async (req, res) => {
  try {
    const { courseId, quizId, answers, score, total } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!courseId || !quizId || !answers || score === undefined || total === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the course enrollment
    const courseIndex = user.enrolledCourses.findIndex(
      enrollment => enrollment.course.toString() === courseId
    );
    
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course enrollment not found' });
    }
    
    // Get the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if the quiz belongs to the course
    if (quiz.course.toString() !== courseId) {
      return res.status(400).json({ message: 'Quiz does not belong to this course' });
    }
    
    // Get the course enrollment
    const enrollment = user.enrolledCourses[courseIndex];
    
    // Check if the quiz result already exists
    const quizResultIndex = enrollment.quizResults.findIndex(
      result => result.quiz.toString() === quizId
    );
    
    if (quizResultIndex === -1) {
      // First attempt
      enrollment.quizResults.push({
        quiz: quizId,
        score,
        total,
        answers,
        bestScore: score,
        attempts: 1,
        completedAt: Date.now()
      });
    } else {
      // Subsequent attempt
      const quizResult = enrollment.quizResults[quizResultIndex];
      quizResult.score = score;
      quizResult.total = total;
      quizResult.answers = answers;
      quizResult.attempts += 1;
      quizResult.completedAt = Date.now();
      
      // Update best score if current score is higher
      if (score > quizResult.bestScore) {
        quizResult.bestScore = score;
      }
    }
    
    // Log quiz completion activity
    user.activityLog.push({
      type: 'quiz_completion',
      timestamp: Date.now(),
      details: { 
        courseId,
        quizId,
        score,
        total,
        percentage: Math.round((score / total) * 100)
      }
    });
    
    // Update last accessed timestamp for the course
    enrollment.lastAccessed = Date.now();
    
    // Update last active timestamp
    user.lastActive = Date.now();
    
    // Update streak
    updateUserStreak(user);
    
    await user.save();
    
    res.status(200).json({
      message: 'Quiz results submitted successfully',
      result: quizResultIndex === -1 ? 
        enrollment.quizResults[enrollment.quizResults.length - 1] : 
        enrollment.quizResults[quizResultIndex]
    });
  } catch (error) {
    console.error('Error submitting quiz results:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description imageUrl level duration category'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate overall stats
    const totalCourses = user.enrolledCourses.length;
    
    let totalCompletedLessons = 0;
    let totalLessons = 0;
    let totalQuizzes = 0;
    let totalQuizScore = 0;
    let totalCoursesCompleted = 0;
    
    // Get course-specific stats
    for (const enrollment of user.enrolledCourses) {
      totalCompletedLessons += enrollment.completedLessons.length;
      
      // Calculate total lessons for this course
      const courseLessons = await Lesson.countDocuments({ course: enrollment.course._id });
      totalLessons += courseLessons;
      
      // Calculate if course is completed
      if (enrollment.progress === 100) {
        totalCoursesCompleted += 1;
      }
      
      // Add up quiz results
      totalQuizzes += enrollment.quizResults.length;
      for (const result of enrollment.quizResults) {
        totalQuizScore += (result.score / result.total) * 100;
      }
    }
    
    // Calculate average quiz score
    const avgQuizScore = totalQuizzes > 0 ? Math.round(totalQuizScore / totalQuizzes) : 0;
    
    // Get activity data for recent days
    const now = new Date();
    const last7Days = Array(7).fill().map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    });
    
    const dailyActivity = last7Days.map(date => {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const activities = user.activityLog.filter(
        activity => activity.timestamp >= startOfDay && activity.timestamp <= endOfDay
      );
      
      return {
        date,
        count: activities.length,
        details: {
          login: activities.filter(a => a.type === 'login').length,
          lesson_completion: activities.filter(a => a.type === 'lesson_completion').length,
          quiz_completion: activities.filter(a => a.type === 'quiz_completion').length
        }
      };
    });
    
    const stats = {
      totalCourses,
      totalCoursesCompleted,
      completionRate: totalCourses > 0 ? Math.round((totalCoursesCompleted / totalCourses) * 100) : 0,
      totalLessons,
      totalCompletedLessons,
      lessonCompletionRate: totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0,
      totalQuizzes,
      avgQuizScore,
      streak: user.streak,
      totalTimeSpent: user.totalTimeSpent,
      lastActive: user.lastActive,
      dailyActivity
    };
    
    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();
    
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the course enrollment
    const enrollment = user.enrolledCourses.find(
      enrollment => enrollment.course.toString() === courseId
    );
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Course enrollment not found' });
    }
    
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get all lessons for the course
    const lessons = await Lesson.find({ course: courseId })
      .sort({ order: 1 })
      .select('title order videoUrl');
    
    // Get all quizzes for the course
    const quizzes = await Quiz.find({ course: courseId })
      .select('title questions');
    
    // Map lesson completion status
    const lessonStatus = lessons.map(lesson => {
      const isCompleted = enrollment.completedLessons.some(
        id => id.toString() === lesson._id.toString()
      );
      
      const startedLesson = enrollment.startedLessons.find(
        sl => sl.lesson.toString() === lesson._id.toString()
      );
      
      return {
        _id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        hasVideo: !!lesson.videoUrl,
        isCompleted,
        startedAt: startedLesson?.startedAt || null,
        lastAccessed: startedLesson?.lastAccessed || null,
        timeSpent: startedLesson?.timeSpent || 0
      };
    });
    
    // Map quiz status
    const quizStatus = quizzes.map(quiz => {
      const result = enrollment.quizResults.find(
        result => result.quiz.toString() === quiz._id.toString()
      );
      
      return {
        _id: quiz._id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        attempted: !!result,
        bestScore: result?.bestScore || 0,
        totalScore: result?.total || quiz.questions.length,
        attempts: result?.attempts || 0,
        lastAttempt: result?.completedAt || null
      };
    });
    
    // Calculate progress stats
    const totalLessons = lessons.length;
    const completedLessons = enrollment.completedLessons.length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Prepare response
    const progressData = {
      courseId,
      courseTitle: course.title,
      courseDescription: course.description,
      enrollmentDate: enrollment.dateEnrolled,
      lastAccessed: enrollment.lastAccessed,
      progress,
      completedLessons,
      totalLessons,
      lessonStatus,
      quizStatus,
      isCompleted: progress === 100
    };
    
    // Update last accessed timestamps
    enrollment.lastAccessed = Date.now();
    user.lastActive = Date.now();
    
    // Update streak
    updateUserStreak(user);
    
    await user.save();
    
    res.json(progressData);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update user learning streak
const updateUserStreak = (user) => {
  const now = new Date();
  
  // Create a date without time information for today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // If lastStreakDate doesn't exist, initialize it and streak
  if (!user.lastStreakDate) {
    user.lastStreakDate = today;
    user.streak = 1;
    return;
  }
  
  // Create a date without time information for last streak date
  const lastStreakDay = new Date(user.lastStreakDate);
  const lastDate = new Date(lastStreakDay.getFullYear(), lastStreakDay.getMonth(), lastStreakDay.getDate());
  
  // Calculate difference in days
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day, do nothing
    return;
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    user.streak += 1;
    user.lastStreakDate = today;
  } else {
    // Streak broken, reset
    user.streak = 1;
    user.lastStreakDate = today;
  }
};

// Admin user management endpoints
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users' 
    });
  }
};