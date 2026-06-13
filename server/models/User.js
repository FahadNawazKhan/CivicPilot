import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


//Usermodel
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        // Alphanumeric with hyphens/underscores, between 3 and 30 characters
        return /^[a-zA-Z0-9\-_]{3,30}$/.test(v);
      },
      message: props => `${props.value} is not a valid username format! (Must be alphanumeric, 3-30 chars)`
    }
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password before writing to DB
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;