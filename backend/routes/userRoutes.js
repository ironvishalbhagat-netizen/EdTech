const express = require('express');
const router = express.Router();
const { updateProfile, getUserProfile } = require('../controllers/userController'); // getUserProfile import kiya

// Profile data fetch karne ka route
router.get('/profile/:userId', getUserProfile);

// Profile update karne ka route
router.put('/update/:userId', updateProfile);

module.exports = router;