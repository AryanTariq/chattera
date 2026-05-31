const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware to protect routes
const requireAuth = async (req, res, next) => {
    // Check if authorization header exists and starts with "Bearer"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authorized - couldn't find token"});
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    try { 
        // Verify the token and decode the payload
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user to the request (besides password)
        req.user = await User.findOne({ _id }).select("_id");

        if (!req.user) {
            return res.status(401).json({ error: "Not authorized - user not found"});
        }

        next();
    } catch (err) {
        return res.status(401).json({ error: "Not authorized - invalid token"});
    }
}

module.exports = requireAuth;