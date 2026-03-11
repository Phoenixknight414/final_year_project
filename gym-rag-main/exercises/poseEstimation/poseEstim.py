import cv2 as cv
import mediapipe as mp

cap = cv.VideoCapture(0)

mpPose = mp.solutions.pose
mpDraw = mp.solutions.drawing_utils
pose = mpPose.Pose()

while True:
    success,img = cap.read()
    imgRGB = cv.cvtColor(img,cv.COLOR_BGR2RGB)
    results = pose.process(imgRGB)
    poses = []
    if results.pose_landmarks:
        mpDraw.draw_landmarks(img,results.pose_landmarks,mpPose.POSE_CONNECTIONS)
        for id,lm in enumerate(results.pose_landmarks.landmark):
            h,w,c = img.shape
            cx,cy = int(lm.x * w), int(lm.y * h)
            poses.append([id,cx,cy])
        print(poses)    

    img1 = cv.flip(img,1)
    cv.imshow("Image",img1)
    cv.waitKey(1)