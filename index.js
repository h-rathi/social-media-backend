const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://thehimanshurathi:hima%401505@cluster0.skfs9.mongodb.net/socialMediaApp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Define User schema
const userSchema = new mongoose.Schema({
    name: String,
    socialHandle: String,
    images: [String], // Array of image file paths
});

// Create User model
const User = mongoose.model('User', userSchema);

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save images to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate unique file name
    }
});
const upload = multer({ storage });

// Route to handle user submissions (name, social handle, images)
app.post('/submit', upload.array('images', 10), async (req, res) => {
    try {
        const { name, socialHandle } = req.body;
        const imagePaths = req.files.map(file => file.path);

        const user = new User({
            name,
            socialHandle,
            images: imagePaths
        });

        await user.save();
        res.status(201).json({ message: 'User submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error submitting user data' });
    }
});

// Admin route to fetch all user submissions
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
