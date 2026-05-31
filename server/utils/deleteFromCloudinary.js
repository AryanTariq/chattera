const { cloudinary } = require('../config/cloudinary');

const getPublicId = (url) => {
    // Extract public_id from Cloudinary URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v123/chattera/chatts/abc.jpg
    // chattera/chatts/abc
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    const pathParts = parts.slice(uploadIndex + 2); // skip version
    const filename = pathParts.join('/');
    return filename.replace(/\.[^/.]+$/, ''); // remove extension
};

const deleteFromCloudinary = async (url, resourceType = 'image') => {
    try {
        const publicId = getPublicId(url);
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.error('Cloudinary delete error:', err);
    }
};

module.exports = deleteFromCloudinary;