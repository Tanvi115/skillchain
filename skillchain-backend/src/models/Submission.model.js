const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // The actual submission
    submissionUrl: { type: String, required: true }, // GitHub repo, Figma, etc.
    note: { type: String, maxlength: 1000 }, // Brief explanation

    // Review lifecycle
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },

    // Employer feedback
    reviewNote: { type: String }, // Optional note from employer on accept/reject
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// One submission per freelancer per task
SubmissionSchema.index({ task: 1, freelancer: 1 }, { unique: true });
SubmissionSchema.index({ task: 1, status: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);