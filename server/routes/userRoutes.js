const express = require('express');
const router = express.Router();
const { uploadProfile } = require('../config/cloudinary');
const validateID = require("../middleware/validateID");
const requireAuth = require("../middleware/requireAuth");
const { 
    signupUser, loginUser, getUsers, 
    getUser, getUserByUsername, deleteUser, 
    editUser, uploadAvatar, uploadBanner,
    removeAvatar, removeBanner
} = require("../controllers/userController");

// GET all users
router.get('/', getUsers);

// Get user by username
router.get('/u/:username', getUserByUsername)

// Upload user avatar
router.post(
    '/:id/avatar',
    validateID,
    requireAuth,
    uploadProfile.single('avatar'),
    uploadAvatar
);

// Upload user banner
router.post(
    '/:id/banner',
    validateID,
    requireAuth,
    uploadProfile.single('banner'),
    uploadBanner
);

// Remove user avatar
router.delete('/:id/avatar', validateID, requireAuth, removeAvatar);

// Remove user banner
router.delete('/:id/banner', validateID, requireAuth, removeBanner);

// Get user by ID
router.get('/:id', validateID, getUser);

// Signup user
router.post('/signup', signupUser);

// Login user
router.post('/login', loginUser);

// Delete user
router.delete('/:id', validateID, requireAuth, deleteUser);

// Update user 
router.patch('/:id', validateID, requireAuth, editUser);


module.exports = router;