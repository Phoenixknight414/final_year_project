# GYMeye - AI-Powered Fitness Trainer

An AI-powered fitness application that uses computer vision to track your workouts in real-time, count reps, and provide form feedback.

## Features

✅ User authentication (signup/signin with JWT)
✅ Profile setup with fitness goals
✅ Real-time workout tracking with AI
✅ Pose detection and skeleton overlay
✅ Rep counting and form feedback
✅ Live workout stats (reps, calories, time, sets)
✅ Bicep curl exercise with advanced form analysis

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Socket.IO Client
**Backend:** Node.js, Express, MongoDB, JWT
**AI Server:** Python, Flask, Socket.IO, MediaPipe, OpenCV

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://www.python.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Phoenixknight414/gymeye.git
cd gymeye
```

### 2. Install Node.js Dependencies
```bash
npm run install-all
```

This will install dependencies for:
- Root project
- Backend (Node.js server)
- Frontend (React app)

### 3. Setup Python Environment
```bash
cd backend/ai-gym-trainer
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
cd ../..
```

### 4. Configure Environment Variables

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/gymeye
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
```

Create `backend/ai-gym-trainer/.env`:
```env
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5001
```

**Important:** Use the same `JWT_SECRET` in both files!

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod
```

## Running the Application

You need to run TWO servers:

### Terminal 1: Node.js Backend + React Frontend
```bash
npm run dev
```

This starts:
- Node.js backend on `http://localhost:5000`
- React frontend on `http://localhost:5174`

### Terminal 2: Python AI Server
```bash
cd backend/ai-gym-trainer
.venv\Scripts\activate
python workout_server.py
```

This starts:
- Python AI server on `http://localhost:5001`

### Access the App
Open your browser to: `http://localhost:5174`

## Project Structure

```
gymeye/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # API utilities
│   │   └── App.jsx          # Main app component
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── config/              # Database config
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── server.js            # Express server
│   └── package.json
│
├── backend/ai-gym-trainer/  # Python AI server
│   ├── workout_tracker/     # Exercise analyzers
│   │   ├── bicep/          # Bicep curl analyzer
│   │   ├── leg/            # Leg exercise analyzers
│   │   ├── chest/          # Chest exercise analyzers
│   │   ├── shoulder/       # Shoulder exercise analyzers
│   │   └── poseEstimation/ # MediaPipe pose detection
│   ├── middleware/          # JWT auth for Python
│   ├── workout_server.py    # Flask Socket.IO server
│   ├── workout_analyzer.py  # Exercise analysis logic
│   └── requirements.txt     # Python dependencies
│
└── package.json             # Root package.json
```

## Available Scripts

### Root Level
- `npm run dev` - Start Node.js backend + React frontend (concurrently)
- `npm run server` - Start Node.js backend only
- `npm run client` - Start React frontend only
- `npm run install-all` - Install all Node.js dependencies

### Backend
- `cd backend && npm run dev` - Start Node.js server with nodemon

### Frontend
- `cd frontend && npm run dev` - Start React dev server
- `cd frontend && npm run build` - Build for production

### Python AI Server
- `cd backend/ai-gym-trainer && python workout_server.py` - Start AI server

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Login user

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update profile

### WebSocket (Python AI Server)
- `connect` - Connect to AI server
- `start_workout` - Start workout session
- `video_frame` - Send video frame for analysis
- `stop_workout` - Stop workout session
- `workout_feedback` - Receive rep count and form feedback

## Supported Exercises

Currently implemented:
- ✅ Bicep Curl (with advanced form analysis)

Coming soon:
- Squats
- Push-ups
- Lunges
- Lateral Raises
- And more...

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check connection string in `backend/.env`

### Python Server Won't Start
- Activate virtual environment: `.venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.10+)

### Camera Not Working
- Allow camera permissions in your browser
- Ensure no other application is using the camera
- Try refreshing the page

### Skeleton Not Showing
- Ensure Python AI server is running on port 5001
- Check browser console for connection errors
- Verify JWT_SECRET matches in both .env files

## Development

### Adding New Exercises

1. Create analyzer in `backend/ai-gym-trainer/workout_tracker/[category]/[exercise].py`
2. Follow the pattern from `bicep_curl.py`
3. Import and add to `workout_analyzer.py`
4. Add to exercise dropdown in `frontend/src/pages/LiveWorkoutPage.jsx`

## License

MIT

## Contributors

- Phoenixknight414

## Acknowledgments

- MediaPipe for pose detection
- OpenCV for computer vision
- Socket.IO for real-time communication
