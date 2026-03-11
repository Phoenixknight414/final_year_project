import express from 'express';
import { body } from 'express-validator';
import { setupProfile, getProfile, updateProfile, deleteProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const profileValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('height').isFloat({ min: 1 }).withMessage('Height must be a positive number'),
  body('weight').isFloat({ min: 1 }).withMessage('Weight must be a positive number'),
  body('targetWeight').optional().isFloat({ min: 1 }).withMessage('Target weight must be a positive number'),
  body('fitnessGoal').isIn(['Weight Loss', 'Weight Gain', 'Fat Loss', 'Muscle Building', 'General Fitness']).withMessage('Invalid fitness goal')
];

// Routes
router.post('/setup', protect, profileValidation, setupProfile);
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.delete('/', protect, deleteProfile);

export default router;
