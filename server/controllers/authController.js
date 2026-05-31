const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getAuthUrl, getUserInfo } = require('../config/googleOAuth');

// Redirect user to Google login page
const googleAuth = (req, res) => {
    const url = getAuthUrl();
    res.redirect(url);
};

// Google redirects here after user authenticates
const googleCallback = async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange code for Google user info
        const googleUser = await getUserInfo(code);
        const { id: googleId, email, name, picture } = googleUser;

        // Generate a username from their name or email
        const baseUsername = (name || email.split('@')[0])
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')   // replace invalid chars with underscore
            .replace(/_+/g, '_')             // collapse multiple underscores
            .slice(0, 20);                   // enforce max length

        // Try to find existing user by googleId or email
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            // User exists, link googleId if they previously signed up with email
            if (!user.googleId) {
                user.googleId = googleId;
                // Update avatar only if they don't have one yet
                if (!user.avatar && picture) user.avatar = picture;
                await user.save();
            }
        } else {
            // New user, create account from Google info
            // Ensure username is unique by appending numbers if needed
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter++}`;
            }

            user = await User.create({
                googleId,
                username,
                displayName: name || username,
                email,
                avatar: picture || '',
                password: null  // no password for Google users
            });
        }

        // Issue own JWT like regular login
        const token = generateToken(user._id);

        // Build the user payload
        const userPayload = {
            _id: user._id,
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            banner: user.banner,
            createdAt: user.createdAt,
            token
        };

        // Redirect to frontend with token in query string
        // Frontend reads it and stores in localStorage
        const params = new URLSearchParams({ token: JSON.stringify(userPayload) });
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params}`);

    } catch (err) {
        console.error('Google OAuth error:', err);
        res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
};

module.exports = { googleAuth, googleCallback };