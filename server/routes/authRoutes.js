const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback } = require('../controllers/authController');

// Start Google OAuth flow
router.get('/google', googleAuth);

// Google redirection after auth
router.get('/google/callback', googleCallback);

module.exports = router;