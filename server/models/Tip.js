import mongoose from "mongoose";

const tipSchema = new mongoose.Schema({
  processId: {
    type: String,
    required: true,
    index: true
  },
  officeName: {
    type: String,
    required: true,
    trim: true
  },
  experienceText: {
    type: String,
    required: true,
    trim: true
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  username: {
    type: String,
    default: "Citizen"
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

const Tip = mongoose.model('Tip', tipSchema);

export default Tip;
