const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chattera/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 800, crop: 'limit' }],
    },
});

const chattStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        
        return {
            folder: 'chattera/chatts',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'],
            transformation: isVideo ? [] : [{ width: 1200, crop: 'limit' }],
        };
    },
});

const uploadProfile = multer({ storage: profileStorage });
const uploadChatt = multer({
    storage: chattStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadProfile, uploadChatt };