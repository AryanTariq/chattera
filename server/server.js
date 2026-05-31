require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
// Import routes
const chattRoutes = require('./routes/chattRoutes');
const userRoutes = require("./routes/userRoutes");
const authRoutes = require('./routes/authRoutes');
// Import middleware
const errorHandler = require("./middleware/errorHandler")

const app = express();

// Middleware
app.use(cors({ 
    origin: "http://localhost:5173"
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatts', chattRoutes);

app.use(errorHandler)

// Connect to MongoDB then start app
connectDB(app);
