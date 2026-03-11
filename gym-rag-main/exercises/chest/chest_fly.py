import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import cv2 as cv
import mediapipe as mp
import numpy as np
from exercises.poseEstimation import poseModule as pose

cap = cv.VideoCapture(0)
c1 = pose.poseDetect()

# Rep counters & direction
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

    # Get landmark list
    lmList = c1.findPose(img, draw=False)
    if lmList:
        if len(lmList) != 0:

            # ---------------- CHEST FLY TRACKING ---------------- #

            # wrists
            x1, y1 = lmList[15][1], lmList[15][2]
            x2, y2 = lmList[16][1], lmList[16][2]

                # shoulders
            sx1, sy1 = lmList[11][1], lmList[11][2]
            sx2, sy2 = lmList[12][1], lmList[12][2]

            # ---------- Wrist Distance ----------
            wrist_dist = np.hypot(x2 - x1, y2 - y1)

            # Distance calibration (tweak for camera distance)
            min_dist = 60     # hands close
            max_dist = 320    # arms wide

            fly_range = np.interp(wrist_dist, (min_dist, max_dist), (100, 0))

            # ---------- Elbow bend ----------
            right_elbow = c1.findAngle(img, 12, 14, 16)
            left_elbow  = c1.findAngle(img, 11, 13, 15)

            # ---------- Back posture ----------
            back_angle = c1.findAngle(img, 24, 12, 11)

            # ---------- Shoulder level ----------
            shoulder_level = abs(sy1 - sy2)

            # -------- POSTURE CHECK -------- #
            new_msg = ""

                    # -------- POSTURE CHECK -------- #
            new_msg = ""

            # Allow natural standing lean
            if back_angle < 60 or back_angle > 130:
                new_msg = "KEEP YOUR BACK STRAIGHT!"

            # Shoulder height difference (pixels)
            elif shoulder_level > 45:
                new_msg = "LEVEL YOUR SHOULDERS!"

            # Elbows should not be too bent or fully locked
            elif right_elbow < 100 or left_elbow < 100:
                new_msg = "DON'T BEND ELBOWS TOO MUCH!"


            cv.putText(img, f"Back: {int(back_angle)}", (400, 120),
            cv.FONT_HERSHEY_PLAIN, 1.5, (255,255,255), 2)

            cv.putText(img, f"R-Elbow: {int(right_elbow)}", (400, 160),
                    cv.FONT_HERSHEY_PLAIN, 1.5, (255,255,255), 2)

            cv.putText(img, f"L-Elbow: {int(left_elbow)}", (400, 200),
                    cv.FONT_HERSHEY_PLAIN, 1.5, (255,255,255), 2)

            cv.putText(img, f"ShoulderDiff: {int(shoulder_level)}", (400, 240),
                    cv.FONT_HERSHEY_PLAIN, 1.5, (255,255,255), 2)
    


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

            # -------- REP COUNTING -------- #
            if fly_range >= 38 and current_msg == "":
                if dir1 == 0:
                    rcount += 1
                    dir1 = 1

            if fly_range <= 5 and current_msg == "":
                if dir1 == 1:
                    dir1 = 0

        # -------- DISPLAY INFO -------- #
        cv.putText(img, f"Reps: {int(rcount)}", (40, 120),
                   cv.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)

        cv.putText(img, f"Range: {int(fly_range)}%", (40, 160),
                   cv.FONT_HERSHEY_PLAIN, 2, (255, 255, 0), 2)
    

        if current_msg != "":
            cv.putText(img, current_msg, (40, 60),
                       cv.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)

    cv.imshow("Chest Fly AI Trainer", img)

    if cv.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv.destroyAllWindows()
