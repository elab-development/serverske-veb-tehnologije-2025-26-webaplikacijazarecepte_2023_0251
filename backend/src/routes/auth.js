const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

// Rate limiter for auth endpoints -- max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Previse pokusaja. Pokusajte ponovo za 15 minuta.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for login/register -- max 5 per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Previse pokusaja prijave. Pokusajte ponovo za 15 minuta.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', loginLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/me', authenticate, authController.me);

module.exports = router;
