const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, default: '', maxlength: 200 },
  preferences: {
    interests: [{ type: String, enum: ['adventure', 'food', 'culture', 'beaches', 'nightlife', 'nature', 'history', 'art', 'shopping', 'sports'] }],
    currency: { type: String, default: 'USD' },
  },
  totalTrips: { type: Number, default: 0 },
  savedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
