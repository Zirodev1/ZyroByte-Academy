const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { subscribe } = require('../routes/userRoutes');


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscribed: { type: Boolean, default: false },
    enrollCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course"}],
  });

  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

const User = mongoose.model('User', userSchema)
module.exports = User;