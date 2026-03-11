import cv2 as cv
import mediapipe as mp
import math

class poseDetect:
    def __init__(self,mode=False,complex=1,landmark=True,enable_segment=False,smooth_segment=True,detect_con=0.5,track_con=0.5):
        self.mode = mode
        self.complex = complex
        self.landmark = landmark
        self.enable_segment = enable_segment
        self.smooth_segment = smooth_segment
        self.detect_con = detect_con
        self.track_con = track_con

        self.mpPose = mp.solutions.pose
        self.mpDraw = mp.solutions.drawing_utils
        self.pose = self.mpPose.Pose(self.mode,self.complex,self.landmark,self.enable_segment,self.smooth_segment,self.detect_con,self.track_con)
    
    def poseDetection(self,img,draw=True):
        imgRGB = cv.cvtColor(img,cv.COLOR_BGR2RGB)
        self.results = self.pose.process(imgRGB)
        if self.results.pose_landmarks:
            if draw:
                self.mpDraw.draw_landmarks(img,self.results.pose_landmarks,self.mpPose.POSE_CONNECTIONS)

    def findPose(self,img,draw=True):
        self.poses = []
        if self.results.pose_landmarks:
            for id,lm in enumerate(self.results.pose_landmarks.landmark):
                    h,w,c = img.shape
                    cx,cy = int(lm.x * w), int(lm.y * h)
                    self.poses.append([id,cx,cy])
                    if draw:
                        cv.circle(img,(cx,cy),10,(255,0,0),2)
        if self.poses:                
            return self.poses

    def findAngle(self,img,p1,p2,p3,draw=True):
        
        if len(self.poses) < max(p1,p2,p3) :
            return None
        
        x1,y1 = self.poses[p1][1:]
        x2,y2 = self.poses[p2][1:]
        x3,y3 = self.poses[p3][1:]

        angle1 = math.atan2(y1 - y2, x1 - x2)   
        angle2 = math.atan2(y3 - y2, x3 - x2)   

        angle = angle2 - angle1
        angle = math.degrees(angle)    

        if angle < 0:
            angle+=360
        if angle > 180:
            angle-=360

        angle = abs(angle)         
        if draw:
            cv.putText(img,f'angle: {int(angle)}%',(x2,y2-10),cv.FONT_HERSHEY_PLAIN,2,(255,0,255),3)     

        return angle    


def main():
    cap = cv.VideoCapture(0)
    c1 = poseDetect()
    while True:
        success,img = cap.read()
        c1.poseDetection(img)
        positions = c1.findPose(img,draw=False)

        if len(positions) != 0:
            print(positions)

        img1 = cv.flip(img,1)
        cv.imshow("Image",img1)
        cv.waitKey(1)


if __name__ == "__main__" :
    main()