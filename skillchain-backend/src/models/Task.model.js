const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Token reward details
    tokenReward: { type: Number, required: true, min: 1 },
    skillCategory: {
      type: String,
      enum: ['Dev', 'Design', 'Marketing', 'Writing', 'Data', 'Other'],
      required: true,
    },

    // Eligibility filters (gating)
    minimumSkillScore: { type: Number, default: 0 }, // Min overall reputation to apply
    requiredBadges: [{ type: String }], // e.g. ["Google-Dev", "Meta-Design"]
    requiredCategory: { type: String }, // Must have tokens in this category

    // Task lifecycle
    status: {
      type: String,
      enum: ['open', 'in_review', 'completed', 'cancelled'],
      default: 'open',
    },

    // The accepted freelancer (set when submission is accepted)
    acceptedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    acceptedSubmission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', default: null },

    // Task metadata
    deadline: { type: Date },
    tags: [{ type: String }],
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

// Index for filtered discovery
TaskSchema.index({ skillCategory: 1, status: 1, minimumSkillScore: 1 });
TaskSchema.index({ company: 1 });

module.exports = mongoose.model('Task', TaskSchema);