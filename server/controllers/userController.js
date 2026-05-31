const User = require("../models/User");
const mongoose = require("mongoose");
const token = require("../utils/generateToken");
const generateToken = require("../utils/generateToken");
const deleteFromCloudinary = require('../utils/deleteFromCloudinary');

// Signup user (create user)
const signupUser = async (req, res, next) => {
    const { username, password, email, bio, avatar} = req.body;

    try {
        const user = await User.create({ username, password, email, bio, avatar});

        // Generate JWT token for auth
        const token = generateToken(user._id);
        
        res.status(201).json({
            _id: user._id,
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            banner: user.banner,
            createdAt: user.createdAt,
            token
        });
    } catch (err) {
        next(err);
    };
};

const loginUser = async (req, res, next) => {
    const { nameOrEmail, password } = req.body;
    
    try {
        const user = await User.login(nameOrEmail, password);

        // Generate JWT token for auth
        const token = generateToken(user._id);
        
        res.status(201).json({
            _id: user._id,
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            banner: user.banner,
            createdAt: user.createdAt,
            token
        });
    } catch (err) {
        next(err);
    }
} 

// Get users
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).sort({createdAt: -1});
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
}

// Get single user by ID
const getUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
        return res.status(404).json({
            error: `Could not find the specified user with id ${id}`
        });
    };

    res.status(200).json(user);
};

// Get single user by username
const getUserByUsername = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findOneAndDelete({_id: id});

    if (!user) {
        return res.status(404).json({
            error: `Could not find the specified user with id ${id}`
        });
    };;

    res.status(200).json(user);
}

// Update user using profile page
const editUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Remove password from request body to prevent re-hashing on profile updates
        const { password, ...updateData } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after', runValidators: true}
        );

        if (!user) {
            return res.status(404).json({ error: `No user found with id ${id}`});
        }

        // Extract token from the authorization header to preserve it in response
        const token = req.headers.authorization.split(' ')[1];

        res.status(200).json({
            _id: user._id,
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            banner: user.banner,
            createdAt: user.createdAt,
            token
        });

    } catch (err) {
        next(err);
    }
}

// Handle event where user sets avatar in their profile
const uploadAvatar = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { avatar: req.file.path },
            { returnDocument: 'after' }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = req.headers.authorization.split(' ')[1];
        const { password: _, ...userObj } = user.toObject();

        res.status(200).json({ ...userObj, token });

    } catch (err) {
        next(err);
    }
};

// Handle event where user sets banner in their profile
const uploadBanner = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { banner: req.file.path },
            { returnDocument: 'after' }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = req.headers.authorization.split(' ')[1];
        const { password: _, ...userObj } = user.toObject();

        res.status(200).json({ ...userObj, token });

    } catch (err) {
        next(err);
    }
};

// Handle event where user removes avatar in their profile
const removeAvatar = async (req, res, next) => {
    try {
        const existing = await User.findById(req.params.id);

        if (existing?.avatar) await deleteFromCloudinary(existing.avatar);

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { avatar: '' },
            { returnDocument: 'after' }
        );

        const token = req.headers.authorization.split(' ')[1];
        const { password: _, ...userObj } = user.toObject();

        res.status(200).json({ ...userObj, token });

    } catch (err) {
        next(err);
    }
};

// Handle event where user removes banner in their profile
const removeBanner = async (req, res, next) => {
    try {
        const existing = await User.findById(req.params.id);

        if (existing?.banner) await deleteFromCloudinary(existing.banner);

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { banner: '' },
            { returnDocument: 'after' }
        );

        const token = req.headers.authorization.split(' ')[1];
        const { password: _, ...userObj } = user.toObject();

        res.status(200).json({ ...userObj, token });

    } catch (err) {
        next(err);
    }
};

module.exports = { 
    signupUser, loginUser, getUsers, 
    getUser, getUserByUsername, 
    deleteUser, editUser, uploadAvatar, 
    uploadBanner, removeAvatar, removeBanner
};  