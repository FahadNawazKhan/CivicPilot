import mongoose from "mongoose";


//progress model
const progressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        // Enforce safe UUID / alphanumeric hyphen format to mitigate NoSQL injection attempts
        return /^[a-zA-Z0-9\-_]{2,100}$/.test(v);
      },
      message: props => `${props.value} is not a valid userId format!`
    }
  },
  completedSteps: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  verifiedDocs: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  activeJourneys: {
    type: [String],
    default: []
  },
  documentVault: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
}, {
  timestamps: true
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;