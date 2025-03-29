// backend/controllers/lessonController.js
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const SubModule = require("../models/SubModule");
const Course = require("../models/Course");

exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate('course quiz');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course quiz');
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.completeLesson = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.progress[req.params.courseId]) {
        user.progress[req.params.courseId] = { courseId: req.params.courseId, completedLessons: [] };
      }
      user.progress[req.params.courseId].completedLessons.push(req.params.lessonId);
      await user.save();
      res.status(200).send('Lesson completed');
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  

exports.createLesson = async (req, res) => {
  try {
    const { title, module, subModule, isCodingExercise } = req.body;
    
    console.log('Creating lesson with data:', {
      module,
      subModule,
      title 
    });
    
    // If we have a submodule, validate it exists
    if (subModule) {
      // Validate submodule ID format
      if (typeof subModule !== 'string') {
        console.error('Invalid subModule ID format:', subModule);
        return res.status(400).json({
          success: false,
          message: 'Invalid subModule ID format'
        });
      }
      
      console.log('Looking up submodule with ID:', subModule);
      const subModuleDoc = await SubModule.findById(subModule);
      if (!subModuleDoc) {
        console.error('SubModule not found with ID:', subModule);
        return res.status(404).json({
          success: false,
          message: 'SubModule not found'
        });
      }
      
      // Get the course from the submodule's parent module
      console.log('Looking up module with ID:', subModuleDoc.module);
      const moduleDoc = await Module.findById(subModuleDoc.module);
      if (!moduleDoc) {
        console.error('Parent module not found with ID:', subModuleDoc.module);
        return res.status(404).json({
          success: false,
          message: 'Parent module not found'
        });
      }
      
      const course = moduleDoc.course;
      
      // Get the highest order number for lessons in this submodule
      const lastLesson = await Lesson.findOne({ subModule })
        .sort({ order: -1 });
      
      const order = lastLesson ? lastLesson.order + 1 : 0;
      
      console.log('Creating lesson with course:', course);
      // Create the lesson with explicit module and subModule fields
      const lessonData = {
        ...req.body,
        course,
        module: subModuleDoc.module, // Ensure we have the parent module ID
        subModule: subModule, // Explicitly set the subModule
        order
      };
      
      console.log('Creating lesson with data:', lessonData);
      const lesson = await Lesson.create(lessonData);
      
      console.log('Created lesson:', lesson._id);
      
      // Add the lesson to the submodule's lessons array
      const updatedSubModule = await SubModule.findByIdAndUpdate(
        subModule,
        { $push: { lessons: lesson._id } },
        { new: true }
      );
      
      console.log('Added lesson to submodule lessons array, updated submodule:', updatedSubModule._id);
      
      // Verify that the lesson was added to the submodule
      const verifySubModule = await SubModule.findById(subModule);
      console.log('Verified submodule lessons array:', verifySubModule.lessons);
      
      // Check if the lesson was properly added
      if (!verifySubModule.lessons.includes(lesson._id)) {
        console.error('Lesson was not properly added to the submodule lessons array!');
      } else {
        console.log('Lesson was properly added to the submodule lessons array.');
      }
      
      return res.status(201).json({
        success: true,
        data: lesson
      });
    } 
    // Otherwise, handle as a module-level lesson
    else if (module) {
      // Validate module ID format
      if (typeof module !== 'string') {
        console.error('Invalid module ID format:', module);
        return res.status(400).json({
          success: false,
          message: 'Invalid module ID format'
        });
      }
      
      console.log('Looking up module with ID:', module);
      // Validate module exists
      const moduleDoc = await Module.findById(module);
      if (!moduleDoc) {
        console.error('Module not found with ID:', module);
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }
      
      // Get the course from the module
      const course = moduleDoc.course;
      
      // Get the highest order number for lessons in this module (excluding submodule lessons)
      const lastLesson = await Lesson.findOne({ module, subModule: null })
        .sort({ order: -1 });
      
      const order = lastLesson ? lastLesson.order + 1 : 0;
      
      console.log('Creating lesson with course:', course);
      // Create the lesson
      const lesson = await Lesson.create({
        ...req.body,
        course,
        order
      });
      
      console.log('Created lesson:', lesson._id);
      
      // Add the lesson to the module's lessons array
      await Module.findByIdAndUpdate(
        module,
        { $push: { lessons: lesson._id } }
      );
      
      console.log('Added lesson to module lessons array');
      
      return res.status(201).json({
        success: true,
        data: lesson
      });
    } else {
      console.error('No module or subModule provided');
      return res.status(400).json({
        success: false,
        message: 'Either module or subModule is required'
      });
    }
  } catch (error) {
    console.error('Error in createLesson:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        details: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error in updateLesson:', error);
    
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

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // If lesson is associated with a submodule, remove it from the submodule
    if (lesson.subModule) {
      await SubModule.findByIdAndUpdate(
        lesson.subModule,
        { $pull: { lessons: lesson._id } }
      );
    }
    
    // Remove the lesson from the module's lessons array
    await Module.findByIdAndUpdate(
      lesson.module,
      { $pull: { lessons: lesson._id } }
    );
    
    await lesson.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteLesson:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAllLessons = async (req, res) => {
  try {
    const { 
      courseId, 
      query, 
      page = 1, 
      limit = 10, 
      sortBy = 'order', 
      order = 'asc' 
    } = req.query;
    
    const skip = (page - 1) * parseInt(limit);
    
    // Build query
    let searchQuery = {};
    
    // Filter by course
    if (courseId) {
      searchQuery.course = courseId;
    }
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
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
      .populate('course', 'title')
      .select('title description course order videoUrl content');
    
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
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all lessons for a module
exports.getLessonsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const lessons = await Lesson.find({ module: moduleId })
      .sort({ order: 1 });
    
    return res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('Error in getLessonsByModule:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single lesson
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('module')
      .populate('course');
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error in getLesson:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Reorder lessons within a module
exports.reorderLessons = async (req, res) => {
  try {
    const { moduleId, lessonOrders } = req.body;
    
    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: 'Module ID is required'
      });
    }
    
    if (!Array.isArray(lessonOrders)) {
      return res.status(400).json({
        success: false,
        message: 'lessonOrders must be an array'
      });
    }
    
    // Update each lesson's order
    const updatePromises = lessonOrders.map(item => {
      return Lesson.findByIdAndUpdate(
        item.id,
        { order: item.order },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({
      success: true,
      message: 'Lessons reordered successfully'
    });
  } catch (error) {
    console.error('Error in reorderLessons:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add a new method for getting lessons by submodule
exports.getLessonsBySubModule = async (req, res) => {
  try {
    const { subModuleId } = req.params;
    
    const lessons = await Lesson.find({ subModule: subModuleId })
      .sort({ order: 1 });
    
    return res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('Error in getLessonsBySubModule:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
