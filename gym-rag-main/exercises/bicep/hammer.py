import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import cv2 as cv
import numpy as np
from exercises.poseEstimation import poseModule as pose
from exercises.poseEstimation import handmodule as hm

cap = cv.VideoCapture(0)
c1 = pose.poseDetect()
detector = hm.handDetection()

dir1 = 0
dir2 = 0
rcount = 0
lcount = 0

# Stability variables (NEW)
bad_posture_frames = 0
good_posture_frames = 0
current_msg = ""
hand_msg = ""
required_frames = 7
hand_wrong = False
allow_counting = True

while True:
    success, img = cap.read()
    img1 = detector.findhands(img)
    if not success or img is None:
        continue
    positions = detector.findposition(img1)
    if len(positions) != 0:
        id,xi,yi = positions[8]
        id,xp,yp = positions[20]
        print(f"x-position {abs(xi-xp)}")
        print(f"y-position {abs(yi-yp)}")

        hand_wrong = (abs(xi-xp) > abs(yi-yp))
        if hand_wrong:
            hand_msg= "Rotate your hand so that thumb is on top"
            allow_counting = False
        else:
            hand_msg="" 
            allow_counting = True

        # Pose detection pipeline (ORDER MATTERS)
    c1.poseDetection(img)
    h,w,c = img.shape
    pose = c1.findPose(img)

    right = c1.findAngle(img,16,14,12)   # wrist-elbow-shoulder
    left  = c1.findAngle(img,11,13,15)   # shoulder-elbow-wrist
    # Hand angles

    back_angle = c1.findAngle(img,24,12,11)  

    # Body posture angles
    max_angle = 170

    a1 = c1.findAngle(img,11,23,24)
    a2 = c1.findAngle(img,12,24,23)

    if a1 is None or a2 is None:
        shoulder_level = 0
    else:    
        shoulder_level = abs(a1 - a2)

    min_angle = 15
    left_range  = np.interp(left,(min_angle,max_angle),(0,100))

    right_range = np.interp(right,(min_angle,max_angle),(0,100))

    if not hasattr(c1, "poses") or len(c1.poses) < 15:
        continue

    # left shoulder (11)
    xi, yi = c1.poses[11][1], c1.poses[11][2]

    # right shoulder (12)
    xj, yj = c1.poses[12][1], c1.poses[12][2]

    # left elbow (13)
    xk, yk = c1.poses[13][1], c1.poses[13][2]

    # right elbow (14)
    xm, ym = c1.poses[14][1], c1.poses[14][2]

    # calculate distances
    shoulder_width = abs(xj - xi)

    elbow_dx_L = abs(xk - xi)
    elbow_dx_R = abs(xm - xj)
    # --------- POSTURE CHECK WITHOUT FLICKER ----------
    new_msg = ""

    if back_angle != None and shoulder_level != None and right != None and left != None:
        if hand_wrong:
            new_msg = hand_msg
        elif back_angle < 70 or back_angle > 110:
            new_msg = "KEEP YOUR BACK STRAIGHT!"
        elif shoulder_level > 20:
            new_msg = "SHOULDERS NOT LEVEL!"
        elif elbow_dx_L > shoulder_width * 0.4:
            new_msg = "DON'T MOVE LEFT ELBOW!"

        elif elbow_dx_R > shoulder_width * 0.4:
            new_msg = "DON'T MOVE RIGHT ELBOW!"    
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
    if right_range <= 10 and current_msg == "" and allow_counting:
        if dir1 == 0:
            rcount += 0.5
            dir1 = 1
    if right_range > 90 and current_msg == "" and allow_counting:
        if dir1 == 1:
            rcount += 0.5
            dir1 = 0

    if left_range <= 10 and current_msg == "" and allow_counting:
        if dir2 == 0:
            lcount += 0.5
            dir2 = 1
    if left_range > 90 and current_msg == "" and allow_counting:
        if dir2 == 1:
            lcount += 0.5
            dir2 = 0

            # --------- DISPLAY TEXT ----------
    cv.putText(img,f'Right: {int(rcount)}',(50,100),cv.FONT_HERSHEY_PLAIN,2,(0,255,0),2)
    cv.putText(img,f'Left: {int(lcount)}',(50,150),cv.FONT_HERSHEY_PLAIN,2,(0,255,0),2)
    cv.putText(img,f'elbow_dx_L: {int(elbow_dx_L)}',(50,200),cv.FONT_HERSHEY_PLAIN,2,(0,255,0),2)
    cv.putText(img,f'elbow_dx_R: {int(elbow_dx_R)}',(50,250),cv.FONT_HERSHEY_PLAIN,2,(0,255,0),2)
    cv.putText(img,f'shoulder_width * 0.4: {int(shoulder_width * 0.4)}',(50,300),cv.FONT_HERSHEY_PLAIN,2,(0,255,0),2)

    if current_msg != "":
        cv.putText(img,current_msg,(50,50),cv.FONT_HERSHEY_PLAIN,2,(0,0,255),2)
    # if hand_msg != "":
    #     cv.putText(img,hand_msg,(50,50),cv.FONT_HERSHEY_PLAIN,2,(0,0,255),2)
    cv.imshow("Hammer Curl Tracker", img)
    cv.waitKey(1)
