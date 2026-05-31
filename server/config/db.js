const mongoose = require("mongoose");

const connectDB = async (app) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        // Start app and listen to requests
        app.listen(process.env.PORT, () => {
            console.log(`Connected to DB and server running on port ${process.env.PORT}`);
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;