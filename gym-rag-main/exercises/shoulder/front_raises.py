import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import cv2 as cv
import mediapipe as mp
import numpy as np
from exercises.poseEstimation import poseModule as pose

cap = cv.VideoCapture(0)
c1 = pose.poseDetect()

# rep counter
dir1 = 0
rcount = 0

# posture stability
bad_posture_frames = 0
good_posture_frames = 0
current_msg = ""
required_frames = 7


# distance helper
def distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


# calibration values (you may fine-tune)
MIN_RATIO = 1.2   # arms down
MAX_RATIO = 2.2   # arms raised


while True:

    success, img = cap.read()
    if not success or img is None:
        continue

    c1.poseDetection(img)
    c1.findPose(img, draw=False)

    if not hasattr(c1, "poses") or len(c1.poses) == 0:
        cv.putText(img, "NO PERSON DETECTED",
                   (40,60), cv.FONT_HERSHEY_PLAIN, 2, (0,0,255), 2)
        cv.imshow("Front Raise Trainer", img)
        cv.waitKey(1)
        continue

    lmList = c1.poses

    # ---------------- POSTURE ANGLE ---------------- #

    back_angle = c1.findAngle(img, 24, 12, 11, draw=False)

    if back_angle is None:
        continue


    # ---------------- FRONT RAISE HEIGHT USING WRIST-HIP DISTANCE ---------------- #

    # Left side
    hip_L_y = lmList[23][2]
    wrist_L_y = lmList[15][2]

    # Right side
    hip_R_y = lmList[24][2]
    wrist_R_y = lmList[16][2]

    # vertical distances (positive when arm down)
    dist_L = wrist_L_y - hip_L_y
    dist_R = wrist_R_y - hip_R_y

    avg_dist = (dist_L + dist_R) / 2

    # calibration values (you may adjust slightly)
    min_dist = -150   # arms fully raised
    max_dist = 100    # arms down

    dist_c = np.clip(avg_dist, min_dist, max_dist)

    avg_range = np.interp(dist_c, (min_dist, max_dist), (100, 0))


    # ---------------- ELBOW BEND CHECK ---------------- #

    sx, sy = lmList[11][1], lmList[11][2]
    ex, ey = lmList[13][1], lmList[13][2]
    wx, wy = lmList[15][1], lmList[15][2]

    upper_arm_L = distance((sx,sy),(ex,ey))
    forearm_L   = distance((ex,ey),(wx,wy))
    full_arm_L  = distance((sx,sy),(wx,wy))

    ratio_L = full_arm_L/(upper_arm_L+forearm_L)


    sx, sy = lmList[12][1], lmList[12][2]
    ex, ey = lmList[14][1], lmList[14][2]
    wx, wy = lmList[16][1], lmList[16][2]

    upper_arm_R = distance((sx,sy),(ex,ey))
    forearm_R   = distance((ex,ey),(wx,wy))
    full_arm_R  = distance((sx,sy),(wx,wy))

    ratio_R = full_arm_R/(upper_arm_R+forearm_R)


    # ---------------- POSTURE CHECK ---------------- #

    dx_left = abs(lmList[15][1] - lmList[11][1])
    dx_right = abs(lmList[16][1] - lmList[12][1])

    dy_left = abs(lmList[15][2] - lmList[11][2])
    dy_right = abs(lmList[16][2] - lmList[12][2])

    new_msg = ""

    if back_angle < 65 or back_angle > 135:
        new_msg = "KEEP YOUR BACK STRAIGHT!"

    elif dx_left > dy_left or dx_right > dy_right:
        new_msg = "RAISE ARMS FORWARD!"

    elif ratio_L < 0.48:
        new_msg = "Left arm bending too much"

    elif ratio_R < 0.48:
        new_msg = "Right arm bending too much"

    else:
        new_msg = ""


    # ---------------- STABILITY FILTER ---------------- #

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

    # arms raised
    if avg_range > 89 and new_msg == "":
        if dir1 == 0:
            rcount += 0.5
            dir1 = 1


    # arms down
    if avg_range < 45 and new_msg == "":
        if dir1 == 1:
            rcount += 0.5
            dir1 = 0


    # ---------------- DISPLAY ---------------- #

    cv.putText(img, f"Front Raises: {int(rcount)}",
               (40,120), cv.FONT_HERSHEY_PLAIN, 2, (0,255,0), 2)

    cv.putText(img, f"Range: {int(avg_range)}",
               (40,160), cv.FONT_HERSHEY_PLAIN, 2, (0,255,0), 2)

    # cv.putText(img, f"Norm Ratio: {norm_ratio:.2f}",
    #            (40,200), cv.FONT_HERSHEY_PLAIN, 1.5, (255,255,0), 2)

    cv.putText(img, f"L ratio: {ratio_L:.2f}",
               (400,200), cv.FONT_HERSHEY_PLAIN, 1.3, (255,0,0), 2)

    cv.putText(img, f"R ratio: {ratio_R:.2f}",
               (400,230), cv.FONT_HERSHEY_PLAIN, 1.3, (255,0,0), 2)


    if current_msg != "":
        cv.putText(img, current_msg,
                   (40,60), cv.FONT_HERSHEY_PLAIN, 2, (0,0,255), 2)


    cv.imshow("Front Raise Trainer", img)

    if cv.waitKey(1) & 0xFF == ord('q'):
        break


cap.release()
cv.destroyAllWindows()
