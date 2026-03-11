import { validationResult } from 'express-validator';
import User from '../models/User.js';

// @desc    Setup user profile
// @route   POST /api/profile/setup
// @access  Private
export const setupProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { fullName, age, gender, height, weight, targetWeight, fitnessGoal } = req.body;

    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        age,
        gender,
        height,
        weight,
        targetWeight,
        fitnessGoal,
        profileCompleted: true
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile setup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile setup' 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, age, gender, height, weight, targetWeight, goal } = req.body;

    const updateData = {};
    if (name) updateData.fullName = name;
    if (email) updateData.email = email;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (height) updateData.height = height;
    if (weight) updateData.weight = weight;
    if (targetWeight) updateData.targetWeight = targetWeight;
    if (goal) updateData.fitnessGoal = goal;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile update' 
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profile
// @access  Private
export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile deletion' 
    });
  }
};
