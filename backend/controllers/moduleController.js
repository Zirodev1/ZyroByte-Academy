const Module = require('../models/Module');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const SubModule = require('../models/SubModule');

// Get all modules for a course
exports.getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const modules = await Module.find({ course: courseId })
      .sort({ order: 1 })
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'quizzes',
        options: { sort: { order: 1 } }
      });
    
    // For each module, get its submodules
    const modulesWithSubModules = await Promise.all(
      modules.map(async (module) => {
        const subModules = await SubModule.find({ module: module._id })
          .sort({ order: 1 })
          .populate({
            path: 'lessons',
            options: { sort: { order: 1 } }
          })
          .populate({
            path: 'quizzes',
            options: { sort: { order: 1 } }
          });
        
        // Convert mongoose document to plain object so we can add the submodules
        const moduleObj = module.toObject();
        moduleObj.subModules = subModules;
        
        return moduleObj;
      })
    );
    
    return res.status(200).json({
      success: true,
      count: modulesWithSubModules.length,
      data: modulesWithSubModules
    });
  } catch (error) {
    console.error('Error in getModulesByCourse:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single module
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'quizzes',
        options: { sort: { order: 1 } }
      });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Get submodules for this module
    const subModules = await SubModule.find({ module: module._id })
      .sort({ order: 1 })
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'quizzes',
        options: { sort: { order: 1 } }
      });
    
    // Convert mongoose document to plain object so we can add the submodules
    const moduleObj = module.toObject();
    moduleObj.subModules = subModules;
    
    return res.status(200).json({
      success: true,
      data: moduleObj
    });
  } catch (error) {
    console.error('Error in getModule:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new module
exports.createModule = async (req, res) => {
  try {
    const { title, description, course } = req.body;
    
    // Validate course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Get the highest order number for modules in this course
    const lastModule = await Module.findOne({ course })
      .sort({ order: -1 });
    
    const order = lastModule ? lastModule.order + 1 : 0;
    
    // Create the module
    const module = await Module.create({
      ...req.body,
      order
    });
    
    return res.status(201).json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Error in createModule:', error);
    
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

// Update a module
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Error in updateModule:', error);
    
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

// Delete a module
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Check if there are lessons or quizzes directly in this module
    const lessonsCount = await Lesson.countDocuments({ module: req.params.id, subModule: null });
    const quizzesCount = await Quiz.countDocuments({ module: req.params.id, subModule: null });
    
    // Check for submodules
    const subModules = await SubModule.find({ module: req.params.id });
    
    // Check for lessons and quizzes in submodules
    let subModuleLessonsCount = 0;
    let subModuleQuizzesCount = 0;
    
    for (const subModule of subModules) {
      subModuleLessonsCount += await Lesson.countDocuments({ subModule: subModule._id });
      subModuleQuizzesCount += await Quiz.countDocuments({ subModule: subModule._id });
    }
    
    const totalLessonsCount = lessonsCount + subModuleLessonsCount;
    const totalQuizzesCount = quizzesCount + subModuleQuizzesCount;
    
    if (totalLessonsCount > 0 || totalQuizzesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete module with ${totalLessonsCount} lessons and ${totalQuizzesCount} quizzes. Delete these first.`
      });
    }
    
    // Delete all submodules associated with this module
    await SubModule.deleteMany({ module: req.params.id });
    
    // Delete the module itself
    await module.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Module and all associated submodules deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteModule:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Reorder modules
exports.reorderModules = async (req, res) => {
  try {
    const { courseId, moduleOrders } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    if (!Array.isArray(moduleOrders)) {
      return res.status(400).json({
        success: false,
        message: 'moduleOrders must be an array'
      });
    }
    
    // Update each module's order
    const updatePromises = moduleOrders.map(item => {
      return Module.findByIdAndUpdate(
        item.id,
        { order: item.order },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({
      success: true,
      message: 'Modules reordered successfully'
    });
  } catch (error) {
    console.error('Error in reorderModules:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 