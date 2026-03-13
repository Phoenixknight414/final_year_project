import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lazy } from "react";
import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Target,
  Flame,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
  ChevronDown,
} from "lucide-react";

const HammerCurlTracker = lazy(
  () => import("../components/exercises/bicep/Hammer"),
);
const BicepCurlTracker = lazy(
  () => import("../components/exercises/bicep/BicepCurl"),
);

const PushupTracker = lazy(
  () => import("../components/exercises/chest/pushup"),
);

const ChestFlyTracker = lazy(
  () => import("../components/exercises/chest/chestfly"),
);

const LateralRaiseTracker = lazy(
  () => import("../components/exercises/shoulder/sidelateral"),
);

const FrontRaiseTracker = lazy(
  () => import("../components/exercises/shoulder/front_raises"),
);

const SquatTracker = lazy(() => import("../components/exercises/leg/squats"));

const LungeTracker = lazy(() => import("../components/exercises/leg/lunges"));

const LiveWorkoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const workoutStartedRef = useRef(false); // Use ref to avoid closure issues

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(location.state?.exercise ?? "Lunges");
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [Exercisefile, setExerciseFile] = useState(SquatTracker);

  // Workout stats
  const [reps, setReps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [time, setTime] = useState(0);
  const [sets, setSets] = useState(1);
  const [formScore, setFormScore] = useState(100);
  const [feedback, setFeedback] = useState("");
  const [landmarks, setLandmarks] = useState([]);
  const timerIntervalRef = useRef(null);
  const formScoreIntervalRef = useRef(null);
  const lastRepCountRef = useRef(0); // Track last rep count for set detection
  
  // Error severity mapping - each error has a specific form score
  const getFormScoreForError = (errorMessage) => {
    const errorMap = {
      // Critical errors (0-30%)
      "Rotate your hand so that thumb is on top": 0,
      "KEEP YOUR BACK STRAIGHT!": 40,
      
      // Major errors (40-60%)
      "DON'T MOVE LEFT ELBOW!": 50,
      "DON'T MOVE RIGHT ELBOW!": 50,
      "LEVEL YOUR SHOULDERS!": 50,
      "SHOULDERS NOT LEVEL!": 50,
      "DON'T BEND ELBOWS TOO MUCH!": 55,
      "DON'T GO ABOVE SHOULDERS!": 60,
      "RAISE ARMS FORWARD!": 60,
      "MOVE BOTH HANDS SIDEWAYS!": 60,
      
      // Moderate errors (65-75%)
      "Left arm bending too much": 70,
      "Right arm bending too much": 70,
      "BEND BOTH KNEES EQUALLY!": 70,
      "BEND BOTH LEGS!": 70,
      "GO LOWER!": 75,
      
      // Minor errors (80-85%)
      "Straighten LEFT arm!": 80,
      "Straighten RIGHT arm!": 80,
      "Lower your body": 85,
      "Push up!": 85,
      "Keep body straight": 80,
    };
    
    return errorMap[errorMessage] ?? 60; // Default to 60 if error not mapped
  };
  
  // Update form score based on feedback with smooth transitions
  useEffect(() => {
    if (!workoutStarted) return;
    
    // Clear any existing interval
    if (formScoreIntervalRef.current) {
      clearInterval(formScoreIntervalRef.current);
      formScoreIntervalRef.current = null;
    }
    
    const targetScore = feedback === "" ? 100 : getFormScoreForError(feedback);
    
    // Smoothly transition to target score
    formScoreIntervalRef.current = setInterval(() => {
      setFormScore((prev) => {
        if (prev === targetScore) {
          clearInterval(formScoreIntervalRef.current);
          formScoreIntervalRef.current = null;
          return targetScore;
        }
        
        // Move towards target score
        if (prev < targetScore) {
          return Math.min(targetScore, prev + 2); // Increase by 2
        } else {
          return Math.max(targetScore, prev - 3); // Decrease by 3 (faster drop)
        }
      });
    }, 100); // Update every 100ms
    
    return () => {
      if (formScoreIntervalRef.current) {
        clearInterval(formScoreIntervalRef.current);
      }
    };
  }, [feedback, workoutStarted]);

  const exercises = [
    { name: "Squats", icon: "🏋️", reps: 15, file: SquatTracker },
    { name: "Lunges", icon: "🦵", reps: 12, file: LungeTracker },
    { name: "Bicep Curl", icon: "💪", reps: 15, file: BicepCurlTracker },
    { name: "Hammer Curl", icon: "🔨", reps: 15, file: HammerCurlTracker },
    { name: "Push-ups", icon: "🤸", reps: 20, file: PushupTracker },
    { name: "Chest Fly", icon: "🦅", reps: 12, file: ChestFlyTracker },
    { name: "Lateral Raises", icon: "🙆", reps: 15, file: LateralRaiseTracker },
    { name: "Front Raises", icon: "🙋", reps: 15, file: FrontRaiseTracker },
  ];

  useEffect(() => {
    console.log("Location state:", location.state?.exercise);
    console.log("Current Exercise:", currentExercise);
    const selectedExercise = exercises.find(
      (ex) => ex.name === currentExercise,
    );
    if (selectedExercise) {
      console.log("Selected exercise file:", selectedExercise);
      setExerciseFile(selectedExercise.file);
    }
  }, [currentExercise]);

  const handleTurnOnCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 }, // 🔥 Reduced from 1920
          height: { ideal: 480 }, // 🔥 Reduced from 1080
          facingMode: "user",
          frameRate: { ideal: 24 }, // 🔥 Reduced from 30
        },
      });

      setCameraEnabled(true);
      setCameraError(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);

      window.workoutStream = stream;
    } catch (error) {
      console.error("Camera access denied:", error);
      setCameraError(true);
      setCameraEnabled(false);
    }
  };

  const handleTurnOffCamera = () => {
    if (window.workoutStream) {
      window.workoutStream.getTracks().forEach((track) => track.stop());
      window.workoutStream = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  const handleToggleCamera = () => {
    if (cameraEnabled) {
      handleTurnOffCamera();
    } else {
      handleTurnOnCamera();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.workoutStream) {
        window.workoutStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartWorkout = () => {
    if (!cameraEnabled) {
      alert("Please turn on camera first!");
      return;
    }

    if (window.workoutStream) {
      window.workoutStream.getTracks().forEach((track) => track.stop());
      window.workoutStream = null;
    }

    setWorkoutStarted(true);
    setReps(0);
    setCalories(0);
    setTime(0);
    setSets(1);
    setFormScore(100);
    setFeedback("");

    // Start timer (increment every second)
    timerIntervalRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  const handleRepCount = (increment) => {
    setReps((prev) => {
      const newReps = prev + increment;
      // Calculate calories: approximately 0.5 calories per rep (adjust as needed)
      setCalories(Math.round(newReps * 0.5));
      return newReps;
    });
  };

  const handleStopWorkout = async () => {
    setWorkoutStarted(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (formScoreIntervalRef.current) {
      clearInterval(formScoreIntervalRef.current);
      formScoreIntervalRef.current = null;
    }

    // Save workout session to database
    try {
      const token = localStorage.getItem('token');
      if (token && time > 0) { // Only save if there was actual workout time
        const response = await fetch('http://localhost:5000/api/workout/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            exerciseName: currentExercise,
            reps: reps,
            calories: calories,
            duration: time
          })
        });

        if (response.ok) {
          console.log('Workout session saved successfully');
        } else {
          console.error('Failed to save workout session');
        }
      }
    } catch (error) {
      console.error('Error saving workout session:', error);
    }

    // 🔥 Restart preview camera
    handleTurnOnCamera();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden">
      {/* Left Side - Camera View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-4">
            {/* Camera Toggle Button */}
            <button
              onClick={handleToggleCamera}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                cameraEnabled
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                  : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30"
              }`}
              title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold">
              <span className="text-blue-400">Live</span>
              <span className="text-white"> Workout</span>
            </h1>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Camera Area */}
        <div className="flex-1 flex items-center justify-center px-6 pb-6 min-h-0">
          <div className="relative w-full max-w-2xl h-full max-h-full flex items-center justify-center">
            {/* Camera Placeholder */}
            <div
              className="w-full aspect-[4/3] max-h-full bg-slate-900/50 backdrop-blur-sm rounded-3xl border-2 border-slate-700 overflow-hidden relative
             flex items-center justify-center"
            >
              {!cameraEnabled ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  {/* Camera Icon */}
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center mb-6 animate-pulse">
                    <Camera className="w-12 h-12 text-slate-600" />
                  </div>

                  {/* Instructions */}
                  <h2 className="text-xl font-bold text-white mb-2">
                    Position your camera
                  </h2>
                  <p className="text-slate-400 text-center max-w-md mb-6 text-sm">
                    Place your phone so your full body is visible. The AI will
                    track your movements in real-time.
                  </p>

                  {/* Error Message */}
                  {cameraError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 mb-4 flex items-center gap-3 max-w-md">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">
                        Camera access denied. Please allow camera permissions.
                      </p>
                    </div>
                  )}

                  {/* Label */}
                  <p className="text-slate-500 text-sm">
                    Click the blue camera button above to turn on camera
                  </p>
                </div>
              ) : workoutStarted ? (
                <Suspense fallback={<div>Loading...</div>}>
                  <Exercisefile onFeedbackChange={setFeedback} onRepCount={handleRepCount} />
                </Suspense>
              ) : (
                <div className="absolute inset-0 bg-black">
                  {/* Always show live video feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)",
                    }}
                    className="block"
                  />

                  {/* Overlay Status */}
                  <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 z-10">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-semibold">
                      Live
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Workout Info */}
      <div className="w-[380px] bg-slate-900/50 backdrop-blur-sm border-l border-slate-800 flex flex-col overflow-hidden">
        {/* Exercise Selector */}
        <div className="p-4 border-b border-slate-800 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowExerciseDropdown(!showExerciseDropdown)}
              disabled={workoutStarted}
              className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between transition-colors ${
                workoutStarted
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-xl">
                  🏋️
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">{currentExercise}</div>
                  <div className="text-slate-400 text-sm">Target: 15 reps</div>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform ${showExerciseDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {showExerciseDropdown && !workoutStarted && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-xl">
                {exercises.map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentExercise(exercise.name);
                      setShowExerciseDropdown(false);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-slate-700 transition-colors text-left"
                  >
                    <span className="text-2xl">{exercise.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">
                        {exercise.name}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {exercise.reps
                          ? `${exercise.reps} reps`
                          : exercise.time}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4 grid grid-cols-2 gap-3 flex-shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{reps}</div>
            <div className="text-slate-400 text-xs uppercase tracking-wide">
              Reps
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{calories}</div>
            <div className="text-slate-400 text-xs uppercase tracking-wide">
              Calories
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
            </div>
            <div className="text-slate-400 text-xs uppercase tracking-wide">
              Time
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{sets}</div>
            <div className="text-slate-400 text-xs uppercase tracking-wide">
              Sets
            </div>
          </div>
        </div>

        {/* Form Score */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm font-medium uppercase tracking-wide">
                  Form Score
                </span>
              </div>
              <span className="text-2xl font-bold text-green-400">
                {formScore}%
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${formScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Live Feedback */}
        <div className="px-4 pb-4 flex-1 min-h-0 overflow-hidden">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm font-medium uppercase tracking-wide">
                Live Feedback
              </span>
            </div>
            <div className="flex items-center justify-center flex-1">
              {!workoutStarted ? (
                <p className="text-slate-400 text-base text-center">
                  Feedback will appear here during workout
                </p>
              ) : feedback ? (
                <p className="text-red-400 text-xl text-center font-bold leading-relaxed">
                  ⚠️ {feedback}
                </p>
              ) : (
                <p className="text-green-400 text-lg text-center font-semibold">
                  ✓ Correct form! Keep going!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Start/Stop Workout Button */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          {!workoutStarted ? (
            <button
              onClick={handleStartWorkout}
              disabled={!cameraEnabled}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Start Workout
            </button>
          ) : (
            <button
              onClick={handleStopWorkout}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveWorkoutPage;
