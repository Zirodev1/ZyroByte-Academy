const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    editorContent: { type: mongoose.Schema.Types.Mixed },
    order: { type: Number, default: 0 },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    subModule: { type: mongoose.Schema.Types.ObjectId, ref: 'SubModule' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    isComplete: { type: Boolean, default: false },
    isCodingExercise: { type: Boolean, default: false },
    exerciseInstructions: { type: String },
    initialCode: { type: String },
    solutionCode: { type: String },
    videoUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  lessonSchema.pre('save', function(next) {
    if (this.isNew && !this.order) {
        // If the lesson is linked to a submodule, count by submodule
        if (this.subModule) {
            this.constructor.countDocuments({ subModule: this.subModule }).then(count => {
                this.order = count;
                next();
            }).catch(err => next(err));
        } 
        // Otherwise, count by module (legacy support)
        else if (this.module) {
            this.constructor.countDocuments({ module: this.module }).then(count => {
                this.order = count;
                next();
            }).catch(err => next(err));
        } else {
            next();
        }
    } else {
        this.updatedAt = Date.now();
        next();
    }
  });
  
  // Virtual for getting a lesson's URL
  lessonSchema.virtual('url').get(function() {
    return `/lessons/${this._id}`;
  });
  
  const Lesson = mongoose.model('Lesson', lessonSchema);
  module.exports = Lesson;