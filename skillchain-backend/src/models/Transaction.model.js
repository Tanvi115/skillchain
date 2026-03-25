const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    // Who sent tokens (null for system-minted)
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Who received tokens
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    amount: { type: Number, required: true },
    skillCategory: {
      type: String,
      enum: ['Dev', 'Design', 'Marketing', 'Writing', 'Data', 'Other'],
      required: true,
    },

    // Transaction type
    type: {
      type: String,
      enum: [
        'task_reward',    // Freelancer receives tokens on task acceptance
        'task_deduction', // Company pays tokens when accepting submission
        'slash_penalty',  // Reputation slash deduction
        'initial_grant',  // Onboarding tokens
      ],
      required: true,
    },

    // Reference to related entities
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },

    // Snapshot balances after transaction (for audit trail)
    fromBalanceAfter: { type: Number },
    toBalanceAfter: { type: Number },

    note: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ from: 1, createdAt: -1 });
TransactionSchema.index({ to: 1, createdAt: -1 });
TransactionSchema.index({ task: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);