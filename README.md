# XKRO Referral System

A full referral system for XKRO app with MongoDB.

## Features

- Unique referral code generation
- Referral link sharing
- Referral tracking
- Wallet balance (₹10 per referral)
- Leaderboard
- Share via WhatsApp & native share

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB:
```bash
mongod
```

3. Run server:
```bash
npm start
```

4. Open http://localhost:3000

## API Endpoints

- POST `/api/signup` - User signup with referral
- POST `/api/login` - User login
- GET `/api/user/:code` - Get user by referral code
- GET `/api/my-referrals/:code` - Get user's referrals
- GET `/api/leaderboard` - Top referrers