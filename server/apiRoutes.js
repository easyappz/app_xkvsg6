const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// JWT Secret Key (hardcoded as per instructions)
const JWT_SECRET = 'mysecretkey123';

// Multer storage configuration for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Mongoose Schemas and Models

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null }
});

const User = mongoose.model('User', UserSchema);

// Photo Schema
const PhotoSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  genderFilter: { type: String, enum: ['male', 'female', 'other', 'any'], default: 'any' },
  ageFilter: { type: String, enum: ['18-25', '26-35', '36-50', '50+', 'any'], default: 'any' },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    age: { type: String, enum: ['18-25', '26-35', '36-50', '50+'], default: '18-25' },
    score: { type: Number, required: true }
  }]
});

const Photo = mongoose.model('Photo', PhotoSchema);

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// API Endpoints

// POST /api/register - User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, points: 0 });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// POST /api/login - User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: `Login failed: ${error.message}` });
  }
});

// POST /api/forgot-password - Request Password Reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = Math.random().toString(36).slice(2);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // In a real app, send email with reset link. Here, just return token for simplicity.
    res.json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ error: `Password reset request failed: ${error.message}` });
  }
});

// POST /api/reset-password - Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: `Password reset failed: ${error.message}` });
  }
});

// POST /api/upload-photo - Upload Photo
router.post('/upload-photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const { genderFilter, ageFilter } = req.body;
    const photo = new Photo({
      owner: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      genderFilter: genderFilter || 'any',
      ageFilter: ageFilter || 'any',
      isActive: true
    });

    await photo.save();
    res.status(201).json({ message: 'Photo uploaded successfully', photoId: photo._id });
  } catch (error) {
    res.status(500).json({ error: `Photo upload failed: ${error.message}` });
  }
});

// GET /api/photos-to-rate - Get Photos to Rate
router.get('/photos-to-rate', authenticateToken, async (req, res) => {
  try {
    const { gender, age } = req.query;
    const userId = req.user.id;

    const filter = {
      isActive: true,
      owner: { $ne: userId },
      ratings: { $not: { $elemMatch: { userId } } }
    };

    if (gender && gender !== 'any') {
      filter.genderFilter = { $in: [gender, 'any'] };
    }
    if (age && age !== 'any') {
      filter.ageFilter = { $in: [age, 'any'] };
    }

    const photos = await Photo.find(filter).limit(10);
    res.json({ photos });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch photos: ${error.message}` });
  }
});

// POST /api/rate-photo/:id - Rate a Photo
router.post('/rate-photo/:id', authenticateToken, async (req, res) => {
  try {
    const { score, gender, age } = req.body;
    const photoId = req.params.id;
    const userId = req.user.id;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Invalid score. Must be between 1 and 5' });
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.owner.toString() === userId) {
      return res.status(400).json({ error: 'Cannot rate your own photo' });
    }

    const alreadyRated = photo.ratings.some(rating => rating.userId.toString() === userId);
    if (alreadyRated) {
      return res.status(400).json({ error: 'Photo already rated by this user' });
    }

    photo.ratings.push({
      userId,
      gender: gender || 'other',
      age: age || '18-25',
      score
    });
    await photo.save();

    // Update points: +1 for rater, -1 for owner
    await User.findByIdAndUpdate(userId, { $inc: { points: 1 } });
    await User.findByIdAndUpdate(photo.owner, { $inc: { points: -1 } });

    res.json({ message: 'Photo rated successfully' });
  } catch (error) {
    res.status(500).json({ error: `Rating failed: ${error.message}` });
  }
});

// GET /api/my-photos - Get User's Photos with Statistics
router.get('/my-photos', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const photos = await Photo.find({ owner: userId });

    const photosWithStats = photos.map(photo => {
      const ratings = photo.ratings;
      const totalRatings = ratings.length;
      const averageScore = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings 
        : 0;

      const genderStats = {
        male: ratings.filter(r => r.gender === 'male').length,
        female: ratings.filter(r => r.gender === 'female').length,
        other: ratings.filter(r => r.gender === 'other').length
      };

      const ageStats = {
        '18-25': ratings.filter(r => r.age === '18-25').length,
        '26-35': ratings.filter(r => r.age === '26-35').length,
        '36-50': ratings.filter(r => r.age === '36-50').length,
        '50+': ratings.filter(r => r.age === '50+').length
      };

      return {
        id: photo._id,
        imageUrl: photo.imageUrl,
        isActive: photo.isActive,
        totalRatings,
        averageScore: Number(averageScore.toFixed(2)),
        genderStats,
        ageStats
      };
    });

    res.json({ photos: photosWithStats });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch user photos: ${error.message}` });
  }
});

// PATCH /api/photo/:id/toggle-active - Toggle Photo Active Status
router.patch('/photo/:id/toggle-active', authenticateToken, async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (user.points < 1) {
      return res.status(400).json({ error: 'Insufficient points to toggle photo status' });
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this photo' });
    }

    photo.isActive = !photo.isActive;
    await photo.save();

    await User.findByIdAndUpdate(userId, { $inc: { points: -1 } });

    res.json({ message: `Photo status updated to ${photo.isActive ? 'active' : 'inactive'}`, isActive: photo.isActive });
  } catch (error) {
    res.status(500).json({ error: `Failed to toggle photo status: ${error.message}` });
  }
});

// GET /api/user-profile - Get User Profile
router.get('/user-profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('email points');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch user profile: ${error.message}` });
  }
});

module.exports = router;
