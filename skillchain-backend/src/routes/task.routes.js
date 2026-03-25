const express = require('express');
const router = express.Router();
const taskController = require('../controller/task.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Only import what exists
router.get('/', protect, taskController.getTasks);
router.post('/', protect, authorize('company'), taskController.createTask);

module.exports = router;