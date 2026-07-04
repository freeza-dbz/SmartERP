import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false, // Never send password in query results
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'sales', 'hr', 'inventory', 'user'],
    default: 'user',
  },
  // Link to the full employee profile
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: Date,
}, {
  timestamps: true,
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with a cost factor of 12
  this.password = await bcrypt.hash(this.password, 12);

  // If this is not a new document, set the passwordChangedAt property
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // ensure token is created after password change
  }
  next();
});

// Instance method to check for correct password
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Export as ES module because other files are ES modules
const User = mongoose.model('User', userSchema);
export default User;