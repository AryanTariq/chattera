const Chatt = require("../models/Chatt");
const mongoose = require("mongoose");
const deleteFromCloudinary = require('../utils/deleteFromCloudinary');

// Get chatts
const getChatts = async (req, res) => {
    try {
        // Get all chatts, sort, and populate chatt documents with user author info 
        const chatts = await Chatt.find({ parentId: null }) // Only get parent chatts, replies are fetched separately
            .sort({createdAt: -1})
            .populate('user', 'displayName username email bio avatar banner');

        res.status(200).json(chatts);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}

// Get single chatt along with its parent by ID
const getChatt = async (req, res, next) => {
    const { id } = req.params;

    try {
        const chatt = await Chatt.findById(id)
            .populate('user', 'displayName username email bio avatar banner')
            .populate('parentId');
    
        if (!chatt) {
            return res.status(404).json({
                error: "Chatt not found"
            });
        };

        res.status(200).json(chatt);
    } catch (err) {
        next(err);
    }
};

// Get replies for a chatt
const getReplies = async (req, res, next) => {
    const { id } = req.params;
    const { sort = 'popular' } = req.query;

    try {
        let sortOption;
        switch (sort) {
            case 'newest':  sortOption = { createdAt: -1 };          break;
            case 'oldest':  sortOption = { createdAt:  1 };          break;
            case 'popular':
            default:        sortOption = { likesCount: -1, createdAt: -1 }; break;
        }

        // Use aggregation to sort by likes count
        const replies = await Chatt.aggregate([
            { $match: {
                parentId: new mongoose.Types.ObjectId(id)
            }},
            { $addFields: {
                likesCount: { $size: '$likes' }
            }},
            { $sort: sortOption },
        ]);

        // Populate user field manually after aggregation
        await Chatt.populate(replies, {
            path: 'user',
            select: 'username displayName avatar'
        });

        res.status(200).json(replies);
    } catch (err) {
        next(err);
    }
};

// Create a reply
const createReply = async (req, res, next) => {
    const { id } = req.params; // parent chatt id
    const { text } = req.body;

    try {
        const parent = await Chatt.findById(id);

        if (!parent) {
            return res.status(404).json({ error: 'Chatt not found' });
        }

        // Cannot reply to a reply, parent chatts need to have parentId of null
        if (parent.parentId) {
            return res.status(400).json({
                error: 'You cannot reply to a reply'
            });
        }

        const media = req.files?.map(file => ({
            url: file.path,
            type: file.mimetype.startsWith('video/') ? 'video' : 'image'
        })) || [];

        if (!text?.trim() && media.length === 0) {
            return res.status(400).json({
                errors: { text: 'Please write something or add media' }
            });
        }

        // Create the reply
        const reply = await Chatt.create({
            user: req.user._id,
            text: text || '',
            media,
            parentId: id
        });

        // Increment parent's reply count
        await Chatt.findByIdAndUpdate(id, { $inc: { replyCount: 1 } });

        const populated = await reply.populate(
            'user', 'username displayName email bio avatar'
        );

        res.status(201).json(populated);
    } catch (err) {
        next(err);
    }
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

        // If it's a reply, decrement parent's reply count
        if (chatt.parentId) {
            await Chatt.findByIdAndUpdate(
                chatt.parentId,
                { $inc: { replyCount: -1 } }
            );
        } else {
            // It's a top-level chatt, delete all replies too
            const replies = await Chatt.find({ parentId: chatt._id });

            // Delete media from Cloudinary for each reply
            await Promise.all(replies.map(async (reply) => {
                if (reply.media?.length > 0) {
                    await Promise.all(reply.media.map(item =>
                        deleteFromCloudinary(
                            item.url,
                            item.type === 'video' ? 'video' : 'image'
                        )
                    ));
                }
            }));

            // Delete all replies from MongoDB
            await Chatt.deleteMany({ parentId: chatt._id });
        }

        // Delete this chatt's media from Cloudinary
        if (chatt.media?.length > 0) {
            await Promise.all(chatt.media.map(item =>
                deleteFromCloudinary(
                    item.url,
                    item.type === 'video' ? 'video' : 'image'
                )
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
            { returnDocument: 'after', runValidators: true }
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
    getChattsByUser, createReply, getReplies,
    deleteChatt, editChatt, likeChatt, 
    getLikedChattsByUser 
};