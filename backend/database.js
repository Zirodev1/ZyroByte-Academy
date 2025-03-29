const mongoose = require('mongoose');
require('dotenv').config();

// Use the environment variable for MongoDB URI
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, "MongoDB connection error:"));
db.once('open', function(){
    console.log("Connected to the database");
});

module.exports = db;