const express = require('express');
const router = express.Router();
const { uploadChatt } = require('../config/cloudinary');
const validateID = require("../middleware/validateID");
const requireAuth = require("../middleware/requireAuth");
const { createChatt, getChatts, getChatt,
        getChattsByUser, getReplies, createReply,
        deleteChatt, editChatt, likeChatt, 
        getLikedChattsByUser 
      } = require("../controllers/chattController");

// GET all chatts
router.get('/', getChatts);

// Get chatts by user ID
router.get('/user/:userId', getChattsByUser);

// Get all liked chats by user ID
router.get('/liked/:userId', getLikedChattsByUser);

// Get chatt by ID
router.get('/detail/:id', validateID, getChatt);

// Get replies for a chatt
router.get('/:id/replies', validateID, getReplies);

// Post reply to a chatt
router.post(
    '/:id/replies',
    validateID,
    requireAuth,
    uploadChatt.array('media', 4),
    createReply
);

// Update chatt's like field
router.patch('/like/:id', requireAuth, likeChatt);

// Post chatt
router.post(
    '/', 
    requireAuth, 
    uploadChatt.array('media', 4),
    createChatt
);

// Delete chatt
router.delete('/:id', validateID, requireAuth, deleteChatt);

// Update chatt 
router.patch('/:id', validateID, requireAuth, editChatt);

module.exports = router;