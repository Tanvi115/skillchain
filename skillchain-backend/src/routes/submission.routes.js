const express = require('express');
const router = express.Router();
const submissionController = require('../controller/submission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Safe imports with fallbacks
router.post('/', protect, authorize('freelancer'), 
  submissionController.createSubmission || ((req, res) => res.status(501).json({ message: 'Coming soon' }))
);

router.get('/mine', protect, authorize('freelancer'), 
  submissionController.getMySubmissions || ((req, res) => res.json([]))
);

module.exports = router;