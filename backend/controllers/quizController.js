// backend/controllers/quizController.js
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Module = require('../models/Module');
const SubModule = require('../models/SubModule');

exports.getQuizzes = async (req, res) => {
    try {
      const quizzes = await Quiz.find().populate('course lesson');
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getQuizById = async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id).populate('course lesson');
      
      // If user is authenticated, don't include correct answers in response
      if (req.user) {
        // Create a safe version of the quiz without correct answers
        const safeQuiz = {
          ...quiz.toObject(),
          questions: quiz.questions.map(question => ({
            ...question,
            correctAnswer: undefined // Remove correct answer
          }))
        };
        res.json(safeQuiz);
      } else {
        res.json(quiz);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getQuizzesByCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const quizzes = await Quiz.find({ course: courseId })
        .select('title questions course lesson')
        .populate('lesson', 'title');
      
      // If user is authenticated, check if they've attempted these quizzes
      if (req.user) {
        const user = await User.findById(req.user.id);
        const enrollment = user.enrolledCourses.find(
          e => e.course.toString() === courseId
        );
        
        // Map quizzes with attempt status
        const quizzesWithStatus = quizzes.map(quiz => {
          const quizObj = quiz.toObject();
          
          // Only include question count, not the actual questions
          quizObj.questionCount = quiz.questions.length;
          delete quizObj.questions;
          
          // Add attempt status if user is enrolled
          if (enrollment) {
            const attempt = enrollment.quizResults.find(
              r => r.quiz.toString() === quiz._id.toString()
            );
            
            if (attempt) {
              quizObj.attempted = true;
              quizObj.bestScore = attempt.bestScore;
              quizObj.totalScore = attempt.total;
              quizObj.attempts = attempt.attempts;
            } else {
              quizObj.attempted = false;
            }
          }
          
          return quizObj;
        });
        
        res.json(quizzesWithStatus);
      } else {
        // For unauthenticated users, just return basic info
        const basicQuizInfo = quizzes.map(quiz => {
          const quizObj = quiz.toObject();
          quizObj.questionCount = quiz.questions.length;
          delete quizObj.questions;
          return quizObj;
        });
        
        res.json(basicQuizInfo);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.getQuizzesByModule = async (req, res) => {
    try {
      const { moduleId } = req.params;
      
      const quizzes = await Quiz.find({ module: moduleId })
        .sort({ order: 1 });
      
      return res.status(200).json({
        success: true,
        count: quizzes.length,
        data: quizzes
      });
    } catch (error) {
      console.error('Error in getQuizzesByModule:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  exports.getQuizzesBySubModule = async (req, res) => {
    try {
      const { subModuleId } = req.params;
      
      const quizzes = await Quiz.find({ subModule: subModuleId })
        .sort({ order: 1 });
      
      return res.status(200).json({
        success: true,
        count: quizzes.length,
        data: quizzes
      });
    } catch (error) {
      console.error('Error in getQuizzesBySubModule:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  exports.getQuiz = async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id)
        .populate('module')
        .populate('course');
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error in getQuiz:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  exports.createQuiz = async (req, res) => {
    try {
      const { title, description, questions, module, subModule } = req.body;
      
      // If creating a quiz for a submodule
      if (subModule) {
        const subModuleDoc = await SubModule.findById(subModule);
        if (!subModuleDoc) {
          return res.status(404).json({
            success: false,
            message: 'SubModule not found'
          });
        }
        
        // Get the module and course
        const moduleDoc = await Module.findById(subModuleDoc.module);
        if (!moduleDoc) {
          return res.status(404).json({
            success: false,
            message: 'Parent module not found'
          });
        }
        
        const course = moduleDoc.course;
        
        // Get the highest order number for quizzes in this submodule
        const lastQuiz = await Quiz.findOne({ subModule })
          .sort({ order: -1 });
        
        const order = lastQuiz ? lastQuiz.order + 1 : 0;
        
        // Create the quiz
        const quiz = await Quiz.create({
          ...req.body,
          course,
          module: moduleDoc._id, // Ensure we have the parent module ID
          order
        });
        
        // Add the quiz to the submodule's quizzes array
        await SubModule.findByIdAndUpdate(
          subModule,
          { $push: { quizzes: quiz._id } }
        );
        
        return res.status(201).json({
          success: true,
          data: quiz
        });
      } 
      // Otherwise, handle as a module-level quiz
      else if (module) {
        // Validate module exists
        const moduleDoc = await Module.findById(module);
        if (!moduleDoc) {
          return res.status(404).json({
            success: false,
            message: 'Module not found'
          });
        }
        
        // Get the course from the module
        const course = moduleDoc.course;
        
        // Get the highest order number for quizzes in this module
        const lastQuiz = await Quiz.findOne({ module, subModule: null })
          .sort({ order: -1 });
        
        const order = lastQuiz ? lastQuiz.order + 1 : 0;
        
        // Create the quiz
        const quiz = await Quiz.create({
          ...req.body,
          course,
          order
        });
        
        // Add the quiz to the module's quizzes array
        await Module.findByIdAndUpdate(
          module,
          { $push: { quizzes: quiz._id } }
        );
        
        return res.status(201).json({
          success: true,
          data: quiz
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either module or subModule is required'
        });
      }
    } catch (error) {
      console.error('Error in createQuiz:', error);
      
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
  
  exports.updateQuiz = async (req, res) => {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Error in updateQuiz:', error);
      
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
  
  exports.deleteQuiz = async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      // Remove the quiz from the module's quizzes array
      await Module.findByIdAndUpdate(
        quiz.module,
        { $pull: { quizzes: quiz._id } }
      );
      
      await quiz.deleteOne();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteQuiz:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  exports.getUserQuizResults = async (req, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Find the quiz
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Find the course enrollment
      const enrollment = user.enrolledCourses.find(
        enrollment => enrollment.course.toString() === quiz.course.toString()
      );
      
      if (!enrollment) {
        return res.status(404).json({ message: 'Course enrollment not found' });
      }
      
      // Find the quiz result
      const quizResult = enrollment.quizResults.find(
        result => result.quiz.toString() === quizId
      );
      
      if (!quizResult) {
        return res.status(404).json({ message: 'No attempt found for this quiz' });
      }
      
      // Format the response
      const response = {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          courseId: quiz.course,
          lessonId: quiz.lesson
        },
        attempts: quizResult.attempts,
        lastAttempt: quizResult.completedAt,
        score: quizResult.score,
        totalScore: quizResult.total,
        percentage: Math.round((quizResult.score / quizResult.total) * 100),
        bestScore: quizResult.bestScore,
        bestPercentage: Math.round((quizResult.bestScore / quizResult.total) * 100)
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      res.status(500).json({ message: error.message });
    }
  };

  exports.submitQuizAttempt = async (req, res) => {
    try {
      const { quizId, answers } = req.body;
      const userId = req.user.id;
      
      // Find the quiz
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      // Check answers
      let score = 0;
      const results = [];
      
      quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) {
          score++;
        }
        
        results.push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect
        });
      });
      
      const scorePercentage = (score / quiz.questions.length) * 100;
      
      // Save the attempt in the user's quiz history
      await User.findByIdAndUpdate(userId, {
        $push: {
          quizHistory: {
            quiz: quizId,
            score: scorePercentage,
            completedAt: new Date()
          }
        }
      });
      
      return res.status(200).json({
        success: true,
        data: {
          score,
          totalQuestions: quiz.questions.length,
          scorePercentage,
          results
        }
      });
    } catch (error) {
      console.error('Error in submitQuizAttempt:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  exports.reorderQuizzes = async (req, res) => {
    try {
      const { moduleId, quizOrders } = req.body;
      
      if (!moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }
      
      if (!Array.isArray(quizOrders)) {
        return res.status(400).json({
          success: false,
          message: 'quizOrders must be an array'
        });
      }
      
      // Update each quiz's order
      const updatePromises = quizOrders.map(item => {
        return Quiz.findByIdAndUpdate(
          item.id,
          { order: item.order },
          { new: true }
        );
      });
      
      await Promise.all(updatePromises);
      
      return res.status(200).json({
        success: true,
        message: 'Quizzes reordered successfully'
      });
    } catch (error) {
      console.error('Error in reorderQuizzes:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };