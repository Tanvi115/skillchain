const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/leaderboard', userController.getLeaderboard || ((req, res) => res.json([])));
router.get('/:id', protect, userController.getUserProfile || ((req, res) => res.status(501).json({ message: 'Coming soon' })));

module.exports = router;