const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/xkro';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, ref } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let referredByCode = null;
    if (ref) {
      const referrer = await User.findOne({ referralCode: ref });
      if (referrer) {
        referredByCode = ref;
      }
    }

    const newUser = new User({
      name,
      email,
      password,
      referredBy: referredByCode
    });

    await newUser.save();

    let newWalletBalance = 0;
    
    if (referredByCode) {
      await User.findOneAndUpdate(
        { referralCode: referredByCode },
        { $inc: { referralCount: 1, walletBalance: 10 } }
      );
      newWalletBalance = 10;
    }

    await User.findByIdAndUpdate(newUser._id, { walletBalance: newWalletBalance });

    res.json({ 
      message: 'Signup successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        referralCount: newUser.referralCount,
        walletBalance: newWalletBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/user/:code', async (req, res) => {
  try {
    const user = await User.findOne({ referralCode: req.params.code });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      name: user.name,
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/my-referrals/:code', async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.params.code });
    res.json(referrals.map(r => ({
      name: r.name,
      email: r.email,
      referralCount: r.referralCount,
      createdAt: r.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaders = await User.find()
      .sort({ referralCount: -1 })
      .limit(10)
      .select('name referralCount walletBalance');
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`XKRO Server running on http://localhost:${PORT}`);
});