import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import cv2 as cv
import mediapipe as mp
import numpy as np
from exercises.poseEstimation import poseModule as pose

cap = cv.VideoCapture(0)
c1 = pose.poseDetect()

# Direction & counters
dir1 = 0
rcount = 0

# Stability variables
bad_posture_frames = 0
good_posture_frames = 0
current_msg = ""
required_frames = 7

while True:

    success, img = cap.read()
    if not success or img is None:
        continue

    c1.poseDetection(img)
    c1.findPose(img, draw=False)

    if not hasattr(c1, "poses") or len(c1.poses) == 0:
        cv.putText(img, "NO PERSON DETECTED",
                   (40, 60), cv.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)
        cv.imshow("Stationary Lunge Trainer", img)
        cv.waitKey(1)
        continue

    lmList = c1.poses

    # ------------------- LEG ANGLES ------------------- #

    # Left leg: hip-knee-ankle
    left_knee = c1.findAngle(img, 23, 25, 27)

    # Right leg
    right_knee = c1.findAngle(img, 24, 26, 28)

    # Back / torso
    back_angle = c1.findAngle(img, 24, 12, 11)

    if left_knee is None or right_knee is None or back_angle is None:
        cv.putText(img, "BODY NOT FULLY DETECTED",
                   (40, 60), cv.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)
        cv.imshow("Stationary Lunge Trainer", img)
        cv.waitKey(1)
        continue

    # ---------------- RANGE MAPPING ---------------- #

    min_angle = 70     # bottom lunge
    max_angle = 170    # standing

    left_range  = np.interp(left_knee,  (min_angle, max_angle), (100, 0))
    right_range = np.interp(right_knee, (min_angle, max_angle), (100, 0))

    avg_range = (left_range + right_range) / 2

    # ---------------- POSTURE CHECK ---------------- #

    new_msg = ""

    if back_angle < 65 or back_angle > 135:
        new_msg = "KEEP YOUR BACK STRAIGHT!"

    elif abs(left_range - right_range) > 50:
        new_msg = "BEND BOTH LEGS!"

    elif left_knee > 155 and right_knee > 155:
        new_msg = "GO LOWER!"

    else:
        new_msg = ""

    # -------- Stability Filter -------- #

    if new_msg != "":
        bad_posture_frames += 1
        good_posture_frames = 0

        if bad_posture_frames >= required_frames:
            current_msg = new_msg

    else:
        good_posture_frames += 1
        bad_posture_frames = 0

        if good_posture_frames >= required_frames:
            current_msg = ""

    # ---------------- REP COUNT ---------------- #

    # Down position
    if avg_range >= 85 and current_msg == "":
        if dir1 == 0:
            rcount += 0.5
            dir1 = 1

    # Up position
    if avg_range <= 10 and current_msg == "":
        if dir1 == 1:
            rcount += 0.5
            dir1 = 0

    # ---------------- DISPLAY ---------------- #

    cv.putText(img, f"Lunges: {int(rcount)}", (40, 120),
               cv.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)

    cv.putText(img, f"Depth: {int(avg_range)}%", (40, 160),
               cv.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 0), 2)

    if current_msg != "":
        cv.putText(img, current_msg, (40, 60),
                   cv.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)

    cv.imshow("Stationary Lunge Trainer", img)

    if cv.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv.destroyAllWindows()
