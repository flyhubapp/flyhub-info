const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

/**
 * @route   POST /api/mail/send-email
 * @desc    Send a generic email
 * @access  Public (Should be protected by API key/Auth middleware in production)
 */
router.post('/send-email', emailController.sendEmail);

module.exports = router;
