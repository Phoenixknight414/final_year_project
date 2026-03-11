import cv2 as cv
import mediapipe as mp
import poseModule as py

cap = cv.VideoCapture(0)
c1 = py.poseDetect()
while True:
    success,img = cap.read()
    c1.poseDetection(img)
    positions = c1.findPose(img,draw=True)

    if len(positions) != 0:
        print(positions)

    img1 = cv.flip(img,1)
    cv.imshow("Image",img1)
    cv.waitKey(1)