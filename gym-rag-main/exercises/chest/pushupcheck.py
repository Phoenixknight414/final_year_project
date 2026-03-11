import cv2 as cv
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Pose
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Function to calculate angle between three points
def calculate_angle(a, b, c):
    a = np.array(a)  # shoulder
    b = np.array(b)  # elbow
    c = np.array(c)  # wrist

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle

#perfect body posture check
def calculate_body_angle(shoulder, hip, ankle):

    shoulder = np.array(shoulder)
    hip = np.array(hip)
    ankle = np.array(ankle)

    radians = np.arctan2(ankle[1]-hip[1], ankle[0]-hip[0]) - \
              np.arctan2(shoulder[1]-hip[1], shoulder[0]-hip[0])

    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180:
        angle = 360 - angle

    return angle



# Start webcam feed (0 = default webcam)
cap = cv.VideoCapture(0)

# Variables for counting reps
counter = 0
stage = 'up'  # 'up' or 'down'

# Initialize Pose model
with mp_pose.Pose(min_detection_confidence=0.5,
                  min_tracking_confidence=0.5) as pose:

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("⚠️ Failed to grab frame")
            break

        # Convert the frame from BGR (OpenCV) to RGB (MediaPipe)
        image = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
        image.flags.writeable = False

        # Process the frame to detect the pose
        results = pose.process(image)

        # Convert back to BGR for OpenCV display
        image.flags.writeable = True
        image = cv.cvtColor(image, cv.COLOR_RGB2BGR)

        try:
            # Extract landmarks
            landmarks = results.pose_landmarks.landmark

            # Left arm keypoints
            shoulder = [landmarks[11].x, landmarks[11].y]
            elbow = [landmarks[13].x, landmarks[13].y]
            wrist = [landmarks[15].x, landmarks[15].y]

            # Calculate the elbow angle
            angle = calculate_angle(shoulder, elbow, wrist)

            #body posture angles
            shoulder = [landmarks[11].x, landmarks[11].y]
            hip = [landmarks[23].x, landmarks[23].y]
            ankle = [landmarks[27].x, landmarks[27].y]
            body_angle = calculate_body_angle(shoulder, hip, ankle)


            # Convert normalized coords to pixels for displaying text
            h, w, _ = image.shape
            elbow_coords = tuple(np.multiply(elbow, [w, h]).astype(int))

            # Show angle value on screen
            cv.putText(image, str(int(angle)), elbow_coords,
                       cv.FONT_HERSHEY_PLAIN, 2, (255, 255, 255), 2)

            UP_THRESHOLD = 165
            DOWN_THRESHOLD = 85
            BODY_THRESHOLD = 160

            if body_angle > BODY_THRESHOLD:

                if stage == "up" and angle < DOWN_THRESHOLD:
                    stage = "down"

                elif stage == "down" and angle > UP_THRESHOLD:
                    stage = "up"
                    counter += 1

            else:
                feedback = "Keep body straight"

            # Feedback text
            if angle > 160:
                feedback = "Lower your body"
            elif angle < 90:
                feedback = "Push up!"

            if body_angle > 160:
                posture = "Perfect"
            elif body_angle > 140:
                posture = "Slight bend"
            else:
                posture = "Bad posture"


            # Draw counter and feedback box
            cv.rectangle(image, (0, 0), (270, 100), (0, 0, 0), -1)
            cv.putText(image, f'Reps: {counter}', (10, 60),
                       cv.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 2)
            cv.putText(image, feedback, (280, 60),
                       cv.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)

        except Exception as e:
            # if no person detected
            pass

        # Draw the full-body landmarks
        mp_drawing.draw_landmarks(
            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=3),
            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
        )

        # Show the live webcam feed
        cv.imshow('🏋️ AI Push-Up Trainer (Press Q to Quit)', image)

        # Exit on 'q'
        if cv.waitKey(10) & 0xFF == ord('q'):
            break

# Release webcam and close window
cap.release()
cv.destroyAllWindows()
