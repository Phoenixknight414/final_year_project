import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import cv2 as cv
import mediapipe as mp
import numpy as np
from exercises.poseEstimation import poseModule as pose

cap = cv.VideoCapture(0)
c1 = pose.poseDetect()

dir1 = 0
dir2 = 0
rcount = 0
lcount = 0

# Stability variables (NEW)
bad_posture_frames = 0
good_posture_frames = 0
current_msg = ""
required_frames = 7  # Higher = smoother, Lower = faster response

while True:
    success,img = cap.read()
    if not success or img is None:
        continue
    
    c1.poseDetection(img)
    h,w,c = img.shape
    pose = c1.findPose(img)

    # Hand angles
    right = c1.findAngle(img,16,14,12)   # wrist-elbow-shoulder
    left  = c1.findAngle(img,11,13,15)   # shoulder-elbow-wrist

    # Body posture angles
    back_angle = c1.findAngle(img,24,12,11)  
    shoulder_level = abs(c1.findAngle(img,11,23,24) - c1.findAngle(img,12,24,23))

    min_angle = 15
    max_angle = 170

    right_range = np.interp(right,(min_angle,max_angle),(0,100))
    left_range  = np.interp(left,(min_angle,max_angle),(0,100))

    # --------- POSTURE CHECK WITHOUT FLICKER ----------
    new_msg = ""

    if back_angle < 70 or back_angle > 110:
        new_msg = "KEEP YOUR BACK STRAIGHT!"
    elif shoulder_level > 20:
        new_msg = "SHOULDERS NOT LEVEL!"
    elif right <= 15 and left > 15:
        new_msg = "Straighten LEFT arm!"
    elif left <= 15 and right > 15:
        new_msg = "Straighten RIGHT arm!"
    else:
        new_msg = "" # good posture

    # Apply frame consistency filter
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

    # --------- COUNTING WITH POSTURE ENFORCEMENT ----------
    if right_range <= 10 and current_msg == "":
        if dir1 == 0:
            rcount += 0.5
            dir1 = 1
    if right_range > 90 and current_msg == "":
        if dir1 == 1:
            rcount += 0.5
            dir1 = 0

    if left_range <= 10 and current_msg == "":
        if dir2 == 0:
            lcount += 0.5
            dir2 = 1
    if left_range > 90 and current_msg == "":
        if dir2 == 1:
            lcount += 0.5
            dir2 = 0

    # --------- DISPLAY TEXT ----------
    cv.putText(img,f'Right: {int(rcount)}',(50,100),cv.FONT_HERSHEY_PLAIN,2,(0,255,0),2)
    cv.putText(img,f'Left: {int(lcount)}',(50,150),cv.FONT_HERSHEY_PLAIN,2,(0,255,0),2)

    if current_msg != "":
        cv.putText(img,current_msg,(50,50),cv.FONT_HERSHEY_PLAIN,2,(0,0,255),2)

    cv.imshow("Image",img)
    cv.waitKey(1)
