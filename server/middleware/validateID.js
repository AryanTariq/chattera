const mongoose = require("mongoose");

const validateID = (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({
            error: `Invalid ID`
        });
    };

    next();
}

module.exports = validateID;