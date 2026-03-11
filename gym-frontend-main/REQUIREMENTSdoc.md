# GYMeye - System Requirements

## Software Requirements

### Required Software

1. **Node.js** (v16.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (v3.10.0 or higher)
   - Download: https://www.python.org/
   - Verify: `python --version`

3. **MongoDB** (v5.0.0 or higher)
   - Download: https://www.mongodb.com/try/download/community
   - Verify: `mongod --version`

4. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

### Optional Software

- **MongoDB Compass** - GUI for MongoDB (recommended for beginners)
- **Postman** - API testing tool

## Hardware Requirements

### Minimum Requirements
- **CPU:** Dual-core processor (2.0 GHz or higher)
- **RAM:** 4 GB
- **Storage:** 2 GB free space
- **Camera:** Webcam or built-in camera (720p minimum)
- **Internet:** Stable connection for package installation

### Recommended Requirements
- **CPU:** Quad-core processor (2.5 GHz or higher)
- **RAM:** 8 GB or more
- **Storage:** 5 GB free space
- **Camera:** HD webcam (1080p)
- **Internet:** High-speed connection

## Browser Requirements

### Supported Browsers
- **Chrome** (v90+) - Recommended
- **Edge** (v90+)
- **Firefox** (v88+)
- **Safari** (v14+)

### Required Browser Features
- WebRTC support (for camera access)
- WebSocket support
- ES6+ JavaScript support
- LocalStorage enabled

## Operating System

### Supported OS
- **Windows** 10/11
- **macOS** 10.15 (Catalina) or higher
- **Linux** (Ubuntu 20.04+, Debian 10+, Fedora 33+)

## Node.js Dependencies

### Backend (Node.js)
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "nodemon": "^2.0.22"
}
```

### Frontend (React)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.10.0",
  "socket.io-client": "^4.6.1",
  "lucide-react": "^0.263.1",
  "tailwindcss": "^3.3.0",
  "vite": "^4.3.0"
}
```

## Python Dependencies

### AI Server (Python)
```
flask==3.0.0
flask-socketio==5.3.5
flask-cors==4.0.0
python-socketio==5.10.0
opencv-python==4.8.1.78
mediapipe==0.10.8
numpy==1.24.3
pyjwt==2.8.0
python-dotenv==1.0.0
```

## Port Requirements

The application uses the following ports:

- **5000** - Node.js Backend API
- **5174** - React Frontend Dev Server
- **5001** - Python AI Server (WebSocket)
- **27017** - MongoDB Database (default)

Make sure these ports are not in use by other applications.

## Camera Permissions

The application requires camera access for workout tracking:

### Windows
1. Go to Settings > Privacy > Camera
2. Enable "Allow apps to access your camera"
3. Enable for your browser

### macOS
1. Go to System Preferences > Security & Privacy > Camera
2. Check the box next to your browser

### Linux
- Camera access is usually enabled by default
- If issues occur, check browser permissions

## Network Requirements

### Firewall Settings
Allow the following through your firewall:
- Node.js (port 5000)
- Python (port 5001)
- MongoDB (port 27017)

### CORS
The application is configured to allow cross-origin requests between:
- Frontend (localhost:5174)
- Backend (localhost:5000)
- AI Server (localhost:5001)

## Development Environment

### Recommended IDE/Editors
- **VS Code** (with extensions: ESLint, Prettier, Python)
- **WebStorm**
- **PyCharm**

### Recommended VS Code Extensions
- ESLint
- Prettier
- Python
- Tailwind CSS IntelliSense
- MongoDB for VS Code

## Installation Size

Approximate disk space required:

- **Node.js dependencies:** ~500 MB
- **Python dependencies:** ~1.5 GB (includes MediaPipe, OpenCV)
- **Application code:** ~50 MB
- **MongoDB data:** Variable (starts at ~100 MB)

**Total:** ~2.5 GB minimum

## Performance Considerations

### For Smooth Operation
- Close unnecessary applications
- Ensure good lighting for camera
- Use wired internet connection if possible
- Keep browser updated
- Clear browser cache regularly

### For AI Processing
- Python AI server benefits from:
  - Multi-core CPU
  - Dedicated GPU (optional, for faster processing)
  - 8GB+ RAM

## Security Requirements

### Environment Variables
Never commit `.env` files to version control. Required secrets:
- `JWT_SECRET` - Must be the same in both backend and AI server
- `MONGODB_URI` - MongoDB connection string

### HTTPS (Production)
For production deployment:
- Use HTTPS for all endpoints
- Secure WebSocket connections (WSS)
- Use environment-specific secrets

## Troubleshooting Requirements

If you encounter issues, ensure:
1. All required software is installed and up to date
2. All ports are available
3. MongoDB is running
4. Camera permissions are granted
5. Firewall allows required ports
6. `.env` files are properly configured
7. Virtual environment is activated for Python

## Support

For issues or questions:
- Check the main README.md
- Review error messages in console
- Ensure all requirements are met
- Check GitHub issues: https://github.com/Phoenixknight414/gymeye/issues
