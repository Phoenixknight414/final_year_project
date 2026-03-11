import cv2 as cv
import numpy as np
import mediapipe as mp
import time

class handDetection:
    def __init__(self,mode = False,max_hands=2,complex=1,detct_con=0.5,track_con=0.5):
       self.mode = mode
       self.max_hands = max_hands
       self.complex = complex
       self.detct_con = detct_con
       self.track_con = track_con

       self.mphands = mp.solutions.hands
       self.mpdraw = mp.solutions.drawing_utils
       self.hands = self.mphands.Hands(self.mode,self.max_hands,self.complex,self.detct_con,self.track_con)

    def findhands(self,img,draw=True):
        imgRGB = cv.cvtColor(img,cv.COLOR_BGR2RGB)
        self.results = self.hands.process(imgRGB)
        if self.results.multi_hand_landmarks:
            for handlms in self.results.multi_hand_landmarks:
                if draw:
                    self.mpdraw.draw_landmarks(img,handlms,self.mphands.HAND_CONNECTIONS)
        return img

    def findposition(self,img,handNo=0,draw=True):
        handData = []
        if self.results.multi_hand_landmarks:
            hand = self.results.multi_hand_landmarks[handNo]
            for id,lm in enumerate(hand.landmark):
                 h, w, c = img.shape
                 cx, cy = int(lm.x * w), int(lm.y * h)
                 handData.append([id,cx,cy])
                 if draw:
                    cv.circle(img, (cx, cy), 10, (255, 0, 0), 2)
        return handData        

def main():
    ptime = 0
    cap = cv.VideoCapture(0)
    detector = handDetection()
    

    while True:
        success,img = cap.read()
        img = detector.findhands(img)
        positions = detector.findposition(img)
        if len(positions) != 0:
            print(positions[4])

        ctime = time.time()
        fps = 1/(ctime-ptime)
        ptime = ctime

        cv.putText(img,str(int(fps)),(10,70),cv.FONT_HERSHEY_PLAIN,3,(255,0,255),3)

        img1 = cv.flip(img,1)
        cv.imshow("Image",img1)
        cv.waitKey(1)

if __name__ == "__main__" :
    main()


      