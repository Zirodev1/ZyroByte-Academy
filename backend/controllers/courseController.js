// backend/controllers/courseController.js
const Course = require('../models/Course');

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedCourses = async (req, res) => {
  console.log('Fetching featured courses');
  try {
    const courses = await Course.find({ featured: true });
    console.log('Courses fetched:', courses);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const userId = req.res.id;
    const courseId = req.params.id;

    const user = await User.findById(userId);
    if(!user) return res.status(404).json( {message: "User not found" });

    if(!user.enrollCourses.includes(courseId)) {
      user.enrollCourses.push(courseId);
      await user.save();
    }

    res.json({ message: "Enrolled successfully"});
  } catch (errer) {
    req.status(500).json({ message: error.message });
  }
};
 
  