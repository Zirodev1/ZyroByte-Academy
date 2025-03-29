const SubModule = require('../models/SubModule');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Get all submodules for a module
exports.getSubModulesByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const subModules = await SubModule.find({ module: moduleId })
      .sort({ order: 1 })
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'quizzes',
        options: { sort: { order: 1 } }
      });
    
    return res.status(200).json({
      success: true,
      count: subModules.length,
      data: subModules
    });
  } catch (error) {
    console.error('Error in getSubModulesByModule:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single submodule
exports.getSubModule = async (req, res) => {
  try {
    const subModule = await SubModule.findById(req.params.id)
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'quizzes',
        options: { sort: { order: 1 } }
      });
    
    if (!subModule) {
      return res.status(404).json({
        success: false,
        message: 'SubModule not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: subModule
    });
  } catch (error) {
    console.error('Error in getSubModule:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new submodule
exports.createSubModule = async (req, res) => {
  try {
    const { title, description, module } = req.body;
    
    // Validate module exists
    const moduleExists = await Module.findById(module);
    if (!moduleExists) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Get the highest order number for submodules in this module
    const lastSubModule = await SubModule.findOne({ module })
      .sort({ order: -1 });
    
    const order = lastSubModule ? lastSubModule.order + 1 : 0;
    
    // Create the submodule
    const subModule = await SubModule.create({
      ...req.body,
      order
    });
    
    return res.status(201).json({
      success: true,
      data: subModule
    });
  } catch (error) {
    console.error('Error in createSubModule:', error);
    
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

// Update a submodule
exports.updateSubModule = async (req, res) => {
  try {
    const subModule = await SubModule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!subModule) {
      return res.status(404).json({
        success: false,
        message: 'SubModule not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: subModule
    });
  } catch (error) {
    console.error('Error in updateSubModule:', error);
    
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

// Delete a submodule
exports.deleteSubModule = async (req, res) => {
  try {
    const subModule = await SubModule.findById(req.params.id);
    
    if (!subModule) {
      return res.status(404).json({
        success: false,
        message: 'SubModule not found'
      });
    }
    
    // Check if there are lessons or quizzes in this submodule
    const lessonsCount = await Lesson.countDocuments({ subModule: req.params.id });
    const quizzesCount = await Quiz.countDocuments({ subModule: req.params.id });
    
    if (lessonsCount > 0 || quizzesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete submodule with ${lessonsCount} lessons and ${quizzesCount} quizzes. Delete these first.`
      });
    }
    
    await subModule.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'SubModule deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteSubModule:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Reorder submodules
exports.reorderSubModules = async (req, res) => {
  try {
    const { moduleId, subModuleOrders } = req.body;
    
    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: 'Module ID is required'
      });
    }
    
    if (!Array.isArray(subModuleOrders)) {
      return res.status(400).json({
        success: false,
        message: 'subModuleOrders must be an array'
      });
    }
    
    // Update each submodule's order
    const updatePromises = subModuleOrders.map(item => {
      return SubModule.findByIdAndUpdate(
        item.id,
        { order: item.order },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({
      success: true,
      message: 'SubModules reordered successfully'
    });
  } catch (error) {
    console.error('Error in reorderSubModules:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 