const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Badge schema - minted on task acceptance
const BadgeSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String }, // URL to company logo
  skillCategory: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  taskTitle: { type: String, required: true },
  mintedAt: { type: Date, default: Date.now },
});

// Token balance per skill category
const TokenBalanceSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Dev', 'Design', 'Marketing', 'Writing', 'Data', 'Other'],
    required: true,
  },
  balance: { type: Number, default: 0 },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    role: {
      type: String,
      enum: ['freelancer', 'company'],
      required: true,
    },

    // Company-specific fields
    companyName: { type: String }, // Only for role=company
    companyLogo: { type: String }, // URL

    // Freelancer skill economy
    tokenBalances: [TokenBalanceSchema], // Category-specific tokens

    // Overall reputation score (weighted sum across categories)
    reputationScore: { type: Number, default: 0 },

    // Rejection tracking for slashing logic
    recentRejections: { type: Number, default: 0 },
    isSlashed: { type: Boolean, default: false }, // Reputation hit applied

    // Verified badges from accepted tasks
    badges: [BadgeSchema],

    // Profile
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String }], // Self-declared skills
    portfolioUrl: { type: String },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get token balance for a category
UserSchema.methods.getTokenBalance = function (category) {
  const entry = this.tokenBalances.find((t) => t.category === category);
  return entry ? entry.balance : 0;
};

// Add tokens to a category
UserSchema.methods.addTokens = function (category, amount) {
  const entry = this.tokenBalances.find((t) => t.category === category);
  if (entry) {
    entry.balance += amount;
  } else {
    this.tokenBalances.push({ category, balance: amount });
  }
  // Update overall reputation score (sum of all balances)
  this.reputationScore = this.tokenBalances.reduce((sum, t) => sum + t.balance, 0);
};

// Deduct tokens from a category
UserSchema.methods.deductTokens = function (category, amount) {
  const entry = this.tokenBalances.find((t) => t.category === category);
  if (!entry || entry.balance < amount) {
    throw new Error('Insufficient token balance');
  }
  entry.balance -= amount;
  this.reputationScore = this.tokenBalances.reduce((sum, t) => sum + t.balance, 0);
};

// Apply slashing penalty (5+ rejections)
UserSchema.methods.applySlash = function () {
  const SLASH_THRESHOLD = 5;
  const SLASH_PENALTY = 0.10; // 10% reduction

  this.recentRejections += 1;
  if (this.recentRejections >= SLASH_THRESHOLD && !this.isSlashed) {
    // Apply 10% slash to all token balances
    this.tokenBalances.forEach((t) => {
      t.balance = Math.floor(t.balance * (1 - SLASH_PENALTY));
    });
    this.reputationScore = this.tokenBalances.reduce((sum, t) => sum + t.balance, 0);
    this.isSlashed = true;
    this.recentRejections = 0; // Reset after slash
    return true; // Slash was applied
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema);