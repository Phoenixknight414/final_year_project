import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Camera, 
  Dumbbell, 
  Flame, 
  Calendar,
  Award,
  User,
  Activity,
  Ruler,
  Weight,
  Target
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    goal: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
          setProfileImage(data.data.profileImage || null);
          setEditedData({
            name: data.data.name || '',
            email: data.data.email || '',
            age: data.data.age || '',
            gender: data.data.gender || '',
            height: data.data.height || '',
            weight: data.data.weight || '',
            targetWeight: data.data.targetWeight || '',
            goal: data.data.goal || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [navigate]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Check if any changes were made
      const hasChanges = 
        editedData.name !== (userData?.name || '') ||
        editedData.email !== (userData?.email || '') ||
        editedData.age !== (userData?.age || '') ||
        editedData.gender !== (userData?.gender || '') ||
        editedData.height !== (userData?.height || '') ||
        editedData.weight !== (userData?.weight || '') ||
        editedData.targetWeight !== (userData?.targetWeight || '') ||
        editedData.goal !== (userData?.goal || '') ||
        profileImage !== (userData?.profileImage || null);

      if (hasChanges) {
        // Show confirmation modal if changes were made
        setShowSaveModal(true);
      } else {
        // Just exit editing mode if no changes
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleConfirmSave = () => {
    setShowSaveModal(false);
    handleSaveProfile();
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
    setIsEditing(false);
    // Reset edited data to original
    setEditedData({
      name: userData?.name || '',
      email: userData?.email || '',
      age: userData?.age || '',
      gender: userData?.gender || '',
      height: userData?.height || '',
      weight: userData?.weight || '',
      targetWeight: userData?.targetWeight || '',
      goal: userData?.goal || ''
    });
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      console.log('Saving profile with image:', profileImage ? 'Image present' : 'No image');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editedData,
          profileImage: profileImage
        })
      });
      const data = await response.json();
      console.log('Save response:', data);
      if (data.success) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      // Always exit editing mode after save attempt
      setIsEditing(false);
    }
  };

  const handleDeleteProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('token');
        setShowDeleteModal(false);
        navigate('/');
      } else {
        alert('Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    document.getElementById('profile-image-input').click();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground />

      {/* Main Profile Card - 560px x 530px */}
      <div className="relative z-10 w-[560px] bg-slate-900/90 backdrop-blur-xl rounded-[28px] shadow-2xl border border-slate-700/50 p-6">
        {/* Header with Back and Edit buttons */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg bg-transparent hover:bg-[#2a3142] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <button 
            onClick={handleEditToggle}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isEditing 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-transparent hover:bg-[#2a3142]'
            }`}
          >
            {isEditing ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <Edit2 className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-3 group">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-[90px] h-[90px] rounded-full object-cover shadow-lg border-2 border-slate-700"
              />
            ) : (
              <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-[#5b7cff] to-[#8b5cf6] flex items-center justify-center text-white text-[36px] font-bold shadow-lg">
                {(isEditing ? editedData.name : userData?.name)?.substring(0, 2).toUpperCase() || 'AJ'}
              </div>
            )}
            
            {/* WhatsApp-style overlay - only visible in editing mode */}
            {isEditing && (
              <>
                <input
                  type="file"
                  id="profile-image-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button 
                  onClick={triggerImageUpload}
                  className="absolute inset-0 w-[90px] h-[90px] rounded-full bg-black/0 hover:bg-black/60 flex flex-col items-center justify-center transition-all duration-200 group"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-[10px] font-medium">CHANGE</span>
                    <span className="text-white text-[10px] font-medium">PHOTO</span>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Name */}
          {isEditing ? (
            <input
              type="text"
              value={editedData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="text-[22px] font-bold text-white mb-1 bg-[#252b3d] px-3 py-1 rounded-lg text-center"
            />
          ) : (
            <h1 className="text-[22px] font-bold text-white mb-1">
              {userData?.name || 'Alex Johnson'}
            </h1>
          )}
          
          {/* Email */}
          <div className="flex items-center gap-1.5 text-slate-400 text-[13px] mb-2.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {isEditing ? (
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="text-[13px] text-slate-400 bg-[#252b3d] px-2 py-0.5 rounded"
              />
            ) : (
              <span>{userData?.email || 'alex@gymeye.com'}</span>
            )}
          </div>

          {/* Goal Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800/80 rounded-full border border-blue-500/30">
            <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
            {isEditing ? (
              <select
                value={editedData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className="text-white font-medium text-[13px] bg-transparent outline-none cursor-pointer"
              >
                <option value="Weight Loss" className="bg-slate-800">Weight Loss</option>
                <option value="Weight Gain" className="bg-slate-800">Weight Gain</option>
                <option value="Fat Loss" className="bg-slate-800">Fat Loss</option>
                <option value="Muscle Building" className="bg-slate-800">Muscle Building</option>
                <option value="General Fitness" className="bg-slate-800">General Fitness</option>
              </select>
            ) : (
              <span className="text-white font-medium text-[13px]">
                {userData?.goal || 'Muscle Building'}
              </span>
            )}
          </div>
        </div>

        {/* Stats Row - More vivid */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {/* Workouts */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center border border-blue-500/20">
            <Dumbbell className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-[14px] font-bold text-white mb-0.5 text-center leading-tight">48</div>
            <div className="text-slate-400 text-[10px]">Workouts</div>
          </div>

          {/* Streak */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center border border-blue-500/20">
            <Flame className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-[14px] font-bold text-white mb-0.5 text-center leading-tight">12 days</div>
            <div className="text-slate-400 text-[10px]">Streak</div>
          </div>

          {/* Joined */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center border border-blue-500/20">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-[14px] font-bold text-white mb-0.5 text-center leading-tight">Mar 2025</div>
            <div className="text-slate-400 text-[10px]">Joined</div>
          </div>

          {/* Level */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center border border-blue-500/20">
            <Award className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-[14px] font-bold text-white mb-0.5 text-center leading-tight">Intermediate</div>
            <div className="text-slate-400 text-[10px]">Level</div>
          </div>
        </div>

        {/* Body Details Section */}
        <div className="mb-5">
          <h2 className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-3">
            Body Details
          </h2>
          
          {/* Age & Gender Row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-[10px] uppercase tracking-wide">Age</span>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="text-white text-[18px] font-bold bg-transparent border-b border-slate-600 w-full"
                />
              ) : (
                <div className="text-white text-[18px] font-bold">
                  {userData?.age || '25'} yrs
                </div>
              )}
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-[10px] uppercase tracking-wide">Gender</span>
              </div>
              {isEditing ? (
                <select
                  value={editedData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="text-white text-[18px] font-bold bg-transparent border-b border-slate-600 w-full"
                >
                  <option value="Male" className="bg-[#252b3d]">Male</option>
                  <option value="Female" className="bg-[#252b3d]">Female</option>
                  <option value="Other" className="bg-[#252b3d]">Other</option>
                </select>
              ) : (
                <div className="text-white text-[18px] font-bold">
                  {userData?.gender || 'Male'}
                </div>
              )}
            </div>
          </div>

          {/* Height & Weight Row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-[10px] uppercase tracking-wide">Height</span>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="text-white text-[18px] font-bold bg-transparent border-b border-slate-600 w-full"
                />
              ) : (
                <div className="text-white text-[18px] font-bold">
                  {userData?.height || '178'} cm
                </div>
              )}
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-[10px] uppercase tracking-wide">Weight</span>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="text-white text-[18px] font-bold bg-transparent border-b border-slate-600 w-full"
                />
              ) : (
                <div className="text-white text-[18px] font-bold">
                  {userData?.weight || '75'} kg
                </div>
              )}
            </div>
          </div>

          {/* Target Weight - Full Width */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-[10px] uppercase tracking-wide">Target Weight</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                value={editedData.targetWeight}
                onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                className="text-white text-[18px] font-bold bg-transparent border-b border-slate-600 w-full"
              />
            ) : (
              <div className="text-white text-[18px] font-bold">
                {userData?.targetWeight || '70'} kg
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-[14px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Profile
          </button>
          <button 
            onClick={handleLogout}
            className="py-3 bg-gradient-to-r from-blue-500/90 via-blue-400/90 to-purple-500/90 hover:from-blue-600/90 hover:via-blue-500/90 hover:to-purple-600/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/20 text-[14px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 w-[320px] shadow-2xl">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white text-center">Save Changes</h3>
            </div>
            
            <p className="text-slate-300 mb-6 text-sm text-center">
              Are you sure you want to save these changes to your profile?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelSave}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors text-sm"
              >
                No
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors text-sm"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 w-[300px] shadow-2xl">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white text-center">Delete Profile</h3>
            </div>
            
            <p className="text-slate-300 mb-6 text-sm text-center">
              Are you sure you want to delete your profile?
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors text-sm"
              >
                No
              </button>
              <button
                onClick={handleDeleteProfile}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors text-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
