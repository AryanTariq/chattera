const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    
    googleId: {
        type: String,
        default: null
    },
    displayName: {
        type: String,
        trim: true,
        maxLength: [32, "Display name cannot exceed 32 characters"],
        default: function() {
            return this.username
        }
    },

    username: {
        type: String,
        lowercase: true,
        required: [true, "Username is required"],
        unique: [true, "Username already exists"],
        trim: true,
        minLength: [3, "Username cannot be shorter than 8 characters"],
        maxLength: [20, "Username cannot exceed 20 characters"],
        validate: {
            // Validate function to check for proper username format using regex
            validator: (v) => /^[a-zA-Z0-9_]+$/.test(v),
            message: "Username can only contain letters, numbers, and underscores"
        }
    },

    password: {
        type: String,
        trim: true,
        default: null
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "User with this email already exists"],
        validate: {
            // Validate email format: something@something.something
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: "Please enter a valid email address"
        }
    },

    bio: {
        type: String,
        default: "",
        maxLength: [250, "Bio cannot exceed 250 characters"]
    },

    avatar: {
        type: String,
        default: ""
    },

    banner: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Pre-save hook to hash user password for security before saving to database
userSchema.pre('save', async function () {
    // Skip hashing if there's no password (Google users) or password unchanged
    if (!this.password || !this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(8);
        this.password = await bcrypt.hash(this.password, salt);

    } catch (err) {
        throw err;
    }
});

// Login
userSchema.statics.login = async function(nameOrEmail, password) {
    // Find matching user document with either username or email
    const user = await this.findOne({
        $or: [
            { username: nameOrEmail.trim() },
            { email: nameOrEmail.trim() }
        ]
    })

    if (!user) {
        throw new Error("Incorrect username, email, or password");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error('Incorrect username, email, or password');
    }

    return user
}

module.exports = mongoose.model("User", userSchema);