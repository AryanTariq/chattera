const Chatt = require("../models/Chatt");
const mongoose = require("mongoose");
const deleteFromCloudinary = require('../utils/deleteFromCloudinary');

// Get chatts
const getChatts = async (req, res) => {
    try {
        // Get all chatts, sort, and populate chatt documents with user author info 
        const chatts = await Chatt.find({})
            .sort({createdAt: -1})
            .populate('user', 'displayName username email bio avatar banner');

        res.status(200).json(chatts);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

// Get single chatt
const getChatt = async (req, res) => {
    const { id } = req.params;
    const chatt = await Chatt.findById(id)
        .populate('user', 'displayName username email bio avatar banner');;
    
    if (!chatt) {
        return res.status(404).json({
            error: `Could not find the specified chatt with id ${id}`
        });
    };

    res.status(200).json(chatt);
};

// Get chatts by user ID
const getChattsByUser = async (req, res, next) => {
    const { userId } = req.params;
    const { sort = "newest" } = req.query;

    try {
        const sortOrder = sort === "oldest" ? 1 : -1;

        const chatts = await Chatt.find({ user: userId })
            .sort({ createdAt: sortOrder })
            .populate('user', 'username displayName avatar');

        res.status(200).json(chatts);
    } catch (err) {
        next(err);
    }
}

// Create chatt
const createChatt = async (req, res, next) => {
    const { text } = req.body;

    try {
        const media = req.files?.map(file => ({
            url: file.path,
            type: file.mimetype.startsWith('video/') ? 'video' : 'image'
        })) || [];

        if (!text?.trim() && media.length === 0) {
            return res.status(400).json({
                errors: { text: 'Please write something or add media' }
            });
        }

        const chatt = await Chatt.create({ user: req.user._id, text: text || '', media });
        const populated = await chatt.populate('user', 'username displayName email bio avatar');

        res.status(200).json(populated);
        
    } catch (err) {
        next(err);
    }
};

// Delete chatt
const deleteChatt = async (req, res, next) => {
    const { id } = req.params;

    try {
        const chatt = await Chatt.findOneAndDelete({ _id: id });

        if (!chatt) {
            return res.status(404).json({ error: 'Chatt not found' });
        }

        // Delete all media from Cloudinary
        if (chatt.media?.length > 0) {
            await Promise.all(chatt.media.map(item =>
                deleteFromCloudinary(item.url, item.type === 'video' ? 'video' : 'image')
            ));
        }

        res.status(200).json(chatt);
    } catch (err) {
        next(err);
    }
};

// Update chatt
const editChatt = async (req, res, next) => {
    const { id } = req.params;

    try {
        const existing = await Chatt.findById(id);

        const text = req.body.text?.trim() || '';
        const media = req.body.media || [];

        if (!text && media.length === 0) {
            return res.status(400).json({
                errors: {
                    text: 'Please write something or add media'
                }
            });
        }

        if (!existing) {
            return res.status(404).json({ error: 'Chatt not found' });
        }

        // Find media items that were removed
        const incomingUrls = (req.body.media || []).map(m => m.url);
        const removedMedia = existing.media.filter(m => !incomingUrls.includes(m.url));

        // Delete removed media from Cloudinary
        await Promise.all(removedMedia.map(item =>
            deleteFromCloudinary(item.url, item.type === 'video' ? 'video' : 'image')
        ));

        const chatt = await Chatt.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { ...req.body, edited: true },
            { new: true, runValidators: true }
        ).populate('user', 'displayName username email bio avatar');

        if (!chatt) {
            return res.status(404).json({ error: 'Chatt not found or you aren\'t the author' });
        }

        res.status(200).json(chatt);
    } catch (err) {
        next(err);
    }
};

// Handle updating chatt when liking it
const likeChatt = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const chatt = await Chatt.findById(id);

        if (!chatt) {
            return res.status(404).json({ error: 'Chatt not found' });
        }

        // Check if the chatt has already been liked
        const alreadyLiked = chatt.likes.some(
            (likeId) => likeId.toString() === userId.toString()
        );

        if (alreadyLiked) {
            // Unlike, remove user from likes array
            chatt.likes = chatt.likes.filter(
                (likeId) => likeId.toString() !== userId.toString()
            );
        } else {
            // Like, add user to likes array
            chatt.likes.push(userId);
        }

        await chatt.save();
        await chatt.populate('user', 'username displayName avatar');

        res.status(200).json(chatt);
    } catch (err) {
        next(err);
    }
};

// Get all liked chatts by user
const getLikedChattsByUser = async (req, res, next) => {
    const { userId } = req.params;
    const { sort = 'newest' } = req.query;

    try {
        const sortOrder = sort === 'oldest' ? 1 : -1;

        const chatts = await Chatt.find({ likes: userId })
            .sort({ createdAt: sortOrder })
            .populate('user', 'username displayName avatar');

        res.status(200).json(chatts);
    } catch (err) {
        next(err);
    }
};

module.exports = { 
    createChatt, getChatts, getChatt, 
    getChattsByUser, deleteChatt, editChatt, 
    likeChatt, getLikedChattsByUser 
};