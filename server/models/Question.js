import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    default: "Citizen Expert"
  },
  userId: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedUsers: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'Documents', 'Fees & Payments', 'Timeline', 'Eligibility'],
    default: 'General'
  },
  processId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    default: "Citizen Helper"
  },
  userId: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedUsers: {
    type: [String],
    default: []
  },
  answers: {
    type: [answerSchema],
    default: []
  }
}, {
  timestamps: true
});

// Add text index on title and content for text-based searching
questionSchema.index({ title: 'text', content: 'text' });

const Question = mongoose.model('Question', questionSchema);

export default Question;
