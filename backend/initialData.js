// backend/initialData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const connectDB = async () => {
  try {
    console.log('Mongo URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const createInitialAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@zyrobyte.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@zyrobyte.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

const createInitialCourses = async () => {
  // Clear existing data
  await Course.deleteMany({});
  await Lesson.deleteMany({});
  await Quiz.deleteMany({});

  // Front End Development Course
  const frontendCourse = new Course({
    title: 'Front End Development',
    description: 'Learn HTML, CSS, JavaScript, and popular front-end frameworks to create beautiful and interactive websites.',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890',
    level: 'Beginner',
    duration: '10 weeks',
    prerequisites: 'Basic computer skills'
  });
  
  await frontendCourse.save();
  
  // Front End Lessons
  const frontendLessons = [
    {
      title: 'Introduction to HTML',
      content: 'Learn the basics of HTML, the building blocks of the web. Understand elements, attributes, and document structure.',
      videoUrl: 'https://www.youtube.com/embed/UB1O30fR-EE',
      order: 1,
      course: frontendCourse._id
    },
    {
      title: 'CSS Fundamentals',
      content: 'Understand how to style web pages using CSS. Learn about selectors, properties, and the box model.',
      videoUrl: 'https://www.youtube.com/embed/yfoY53QXEnI',
      order: 2,
      course: frontendCourse._id
    },
    {
      title: 'JavaScript Basics',
      content: 'Get started with JavaScript programming. Learn about variables, data types, functions, and control flow.',
      videoUrl: 'https://www.youtube.com/embed/hdI2bqOjy3c',
      order: 3,
      course: frontendCourse._id
    },
    {
      title: 'Introduction to React',
      content: 'Understand the basics of React, components, props, and state management.',
      videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
      order: 4,
      course: frontendCourse._id
    }
  ];
  
  const createdFrontendLessons = await Lesson.insertMany(frontendLessons);
  
  // Front End Quizzes
  const frontendQuizzes = [
    {
      title: 'HTML Basics Quiz',
      questions: [
        {
          question: 'What does HTML stand for?',
          options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
          correctAnswer: 'Hyper Text Markup Language'
        },
        {
          question: 'Which tag is used for creating a paragraph in HTML?',
          options: ['<paragraph>', '<p>', '<para>', '<pg>'],
          correctAnswer: '<p>'
        }
      ],
      lesson: createdFrontendLessons[0]._id
    },
    {
      title: 'CSS Quiz',
      questions: [
        {
          question: 'Which property is used to change the background color?',
          options: ['color', 'bgcolor', 'background-color', 'background'],
          correctAnswer: 'background-color'
        },
        {
          question: 'Which CSS property controls the text size?',
          options: ['text-style', 'font-size', 'text-size', 'font-style'],
          correctAnswer: 'font-size'
        }
      ],
      lesson: createdFrontendLessons[1]._id
    }
  ];
  
  await Quiz.insertMany(frontendQuizzes);
  
  // Back End Development Course
  const backendCourse = new Course({
    title: 'Back End Development',
    description: 'Master server-side programming, databases, and APIs to build robust web applications.',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2',
    level: 'Intermediate',
    duration: '12 weeks',
    prerequisites: 'Basic programming knowledge'
  });
  
  await backendCourse.save();
  
  // Back End Lessons
  const backendLessons = [
    {
      title: 'Introduction to Node.js',
      content: 'Learn the basics of Node.js and how to build server-side applications with JavaScript.',
      videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4',
      order: 1,
      course: backendCourse._id
    },
    {
      title: 'Express Framework',
      content: 'Build web applications with Express.js, the most popular Node.js web framework.',
      videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE',
      order: 2,
      course: backendCourse._id
    },
    {
      title: 'MongoDB and Mongoose',
      content: 'Learn how to use MongoDB and Mongoose to store and retrieve data for your web applications.',
      videoUrl: 'https://www.youtube.com/embed/DZBGEVgL2eE',
      order: 3,
      course: backendCourse._id
    }
  ];
  
  const createdBackendLessons = await Lesson.insertMany(backendLessons);
  
  // Back End Quizzes
  const backendQuizzes = [
    {
      title: 'Node.js Basics Quiz',
      questions: [
        {
          question: 'What is Node.js?',
          options: ['A browser', 'A JavaScript runtime', 'A programming language', 'A database'],
          correctAnswer: 'A JavaScript runtime'
        },
        {
          question: 'Which of the following is NOT a core module in Node.js?',
          options: ['http', 'fs', 'path', 'jquery'],
          correctAnswer: 'jquery'
        }
      ],
      lesson: createdBackendLessons[0]._id
    }
  ];
  
  await Quiz.insertMany(backendQuizzes);
  
  // Full Stack Development Course
  const fullstackCourse = new Course({
    title: 'Full Stack Development',
    description: 'Become a complete web developer by mastering both front-end and back-end technologies.',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
    level: 'Advanced',
    duration: '16 weeks',
    prerequisites: 'Basic HTML, CSS, and JavaScript knowledge'
  });
  
  await fullstackCourse.save();
  
  // Cybersecurity Course
  const securityCourse = new Course({
    title: 'Cybersecurity',
    description: 'Learn how to protect applications, networks, and systems from digital attacks.',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
    level: 'Intermediate',
    duration: '8 weeks',
    prerequisites: 'Basic networking knowledge'
  });
  
  await securityCourse.save();
  
  console.log('Initial courses, lessons, and quizzes added');
};

const initializeData = async () => {
  await connectDB();
  await createInitialAdmin();
  await createInitialCourses();
  console.log('Data initialization complete');
  mongoose.connection.close();
};

initializeData();
