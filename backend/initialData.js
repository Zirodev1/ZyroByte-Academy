// backend/initialData.js
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

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

const createInitialCourses = async () => {
  const courses = [
    {
      title: 'Full Stack Development',
      description: 'Master both front-end and back-end development.',
      featured: true,
    },
    {
      title: 'Front End Development',
      description: 'Learn HTML, CSS, JavaScript, and popular front-end frameworks.',
      featured: true,
    },
    {
      title: 'Back End Development',
      description: 'Become proficient in server-side development and databases.',
      featured: true,
    },
    {
      title: 'Cybersecurity',
      description: 'Understand the essentials of protecting applications and networks.',
      featured: true,
    },
  ];

  await Course.insertMany(courses);
  console.log('Initial courses added');
};

const initializeData = async () => {
  await connectDB();
  await createInitialCourses();
  mongoose.connection.close();
};

initializeData();
