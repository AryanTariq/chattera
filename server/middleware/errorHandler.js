// Log and handle errors
const errorHandler = (err, req, res, next) => {
    console.log(err);

    if (err.name === "ValidationError") {
        const errors = {}

        // Store validation error objects in array
        Object.keys(err.errors).forEach(key => {
            errors[key] = err.errors[key].message;
        }); 

        return res.status(400).json({
            errors
        });
    };

    res.status(500).json({
        error: err.message
    });
}

module.exports = errorHandler;