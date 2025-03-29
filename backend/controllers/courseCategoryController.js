const CourseCategory = require('../models/CourseCategory');
const Course = require('../models/Course');

// Get all course categories with pagination
exports.getAllCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await CourseCategory.countDocuments();
        const categories = await CourseCategory.find()
            .sort({ featuredOrder: 1, name: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: categories.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving course categories',
            error: error.message
        });
    }
};

// Get category by ID with associated courses
exports.getCategoryById = async (req, res) => {
    try {
        const category = await CourseCategory.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Course category not found'
            });
        }
        
        // Find courses associated with this category
        const courses = await Course.find({ categoryRef: category._id })
            .sort({ order: 1, title: 1 });
        
        res.status(200).json({
            success: true,
            data: {
                category,
                courses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving course category',
            error: error.message
        });
    }
};

// Create new course category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;
        
        // Check if category with same name already exists
        const existingCategory = await CourseCategory.findOne({ name });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'A category with this name already exists'
            });
        }
        
        // Get max featured order to place new category at the end
        const maxOrderCategory = await CourseCategory.findOne()
            .sort({ featuredOrder: -1 });
        
        const newFeaturedOrder = maxOrderCategory ? maxOrderCategory.featuredOrder + 1 : 0;
        
        const newCategory = await CourseCategory.create({
            name,
            description,
            imageUrl,
            featuredOrder: newFeaturedOrder
        });
        
        res.status(201).json({
            success: true,
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating course category',
            error: error.message
        });
    }
};

// Update course category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, imageUrl, featuredOrder } = req.body;
        
        // Check if updating name and if it conflicts with existing category
        if (name) {
            const existingCategory = await CourseCategory.findOne({ 
                name, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'A category with this name already exists'
                });
            }
        }
        
        const updatedCategory = await CourseCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Course category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating course category',
            error: error.message
        });
    }
};

// Delete course category
exports.deleteCategory = async (req, res) => {
    try {
        // Check if there are courses associated with this category
        const associatedCourses = await Course.countDocuments({ categoryRef: req.params.id });
        
        if (associatedCourses > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${associatedCourses} associated courses. Reassign courses first.`
            });
        }
        
        const deletedCategory = await CourseCategory.findByIdAndDelete(req.params.id);
        
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Course category not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Course category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting course category',
            error: error.message
        });
    }
};

// Reorder categories
exports.reorderCategories = async (req, res) => {
    try {
        const { categoryOrders } = req.body;
        
        // categoryOrders should be an array of { id, order } objects
        if (!Array.isArray(categoryOrders)) {
            return res.status(400).json({
                success: false,
                message: 'categoryOrders must be an array'
            });
        }
        
        // Update each category's order
        const updatePromises = categoryOrders.map(item => {
            return CourseCategory.findByIdAndUpdate(
                item.id,
                { featuredOrder: item.order },
                { new: true }
            );
        });
        
        await Promise.all(updatePromises);
        
        res.status(200).json({
            success: true,
            message: 'Categories reordered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reordering categories',
            error: error.message
        });
    }
};

// Get categories with courses
exports.getCategoriesWithCourses = async (req, res) => {
    try {
        const categories = await CourseCategory.find()
            .sort({ featuredOrder: 1, name: 1 });
        
        // Get courses for each category
        const categoriesWithCourses = await Promise.all(
            categories.map(async (category) => {
                const courses = await Course.find({ categoryRef: category._id })
                    .sort({ order: 1, title: 1 })
                    .select('title description imageUrl level');
                
                return {
                    ...category.toObject(),
                    courses
                };
            })
        );
        
        res.status(200).json({
            success: true,
            count: categoriesWithCourses.length,
            data: categoriesWithCourses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving categories with courses',
            error: error.message
        });
    }
};

// Get statistics for a category (student count, completion rate, etc.)
exports.getCategoryStats = async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        // Find the category
        const category = await CourseCategory.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Find all courses in this category
        const courses = await Course.find({ categoryRef: categoryId });
        
        if (!courses.length) {
            return res.status(200).json({
                success: true,
                data: {
                    studentCount: 0,
                    courseCount: 0,
                    completionRate: 0,
                    averageRating: 0
                }
            });
        }
        
        // Count students (this would need to be adjusted based on your actual enrollment model)
        // For now, let's assume we have an Enrollment model
        let studentCount = 0;
        let completedCount = 0;
        let totalRating = 0;
        let ratingCount = 0;
        
        // In a real implementation, you would query your database
        // Here's a placeholder for how it might work:
        /*
        const enrollments = await Enrollment.find({
            courseId: { $in: courses.map(course => course._id) }
        });
        
        studentCount = enrollments.length;
        completedCount = enrollments.filter(e => e.completed).length;
        
        // Get ratings
        const ratings = await Rating.find({
            courseId: { $in: courses.map(course => course._id) }
        });
        
        totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
        ratingCount = ratings.length;
        */
        
        // For demo purposes, generate some random stats
        studentCount = Math.floor(Math.random() * 500) + 50;
        completedCount = Math.floor(Math.random() * studentCount);
        totalRating = (Math.random() * 2 + 3) * courses.length; // Average between 3-5
        ratingCount = courses.length;
        
        const completionRate = studentCount > 0 
            ? Math.round((completedCount / studentCount) * 100) 
            : 0;
            
        const averageRating = ratingCount > 0 
            ? (totalRating / ratingCount).toFixed(1) 
            : "0.0";
        
        res.status(200).json({
            success: true,
            data: {
                studentCount,
                courseCount: courses.length,
                completionRate,
                averageRating
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving category statistics',
            error: error.message
        });
    }
}; 