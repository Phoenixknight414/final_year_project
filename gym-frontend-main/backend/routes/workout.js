import express from 'express';
import WorkoutSession from '../models/WorkoutSession.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Save workout session
router.post('/sessions', protect, async (req, res) => {
  try {
    const { exerciseName, reps, calories, duration } = req.body;

    const session = await WorkoutSession.create({
      userId: req.user._id,
      exerciseName,
      reps,
      calories,
      duration
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error saving workout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save workout session'
    });
  }
});

// Get recent workout sessions (last 4)
router.get('/sessions/recent', protect, async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout sessions'
    });
  }
});

export default router;
