import React, { useRef, useEffect, useState } from "react";
import PoseDetector from "../module/PoseDetector";

export default function BicepCurlTracker({ onFeedbackChange, onRepCount }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const rcount = useRef(0);
  const lcount = useRef(0);
  const dir1 = useRef(0);
  const dir2 = useRef(0);

  const badFrames = useRef(0);
  const goodFrames = useRef(0);
  const currentMsg = useRef("");
  
  const [feedbackMessage, setFeedbackMessage] = useState("");
  
  // Track previous counts to detect when both arms complete a rep
  const prevRcount = useRef(0);
  const prevLcount = useRef(0);

  const requiredFrames = 7;

  useEffect(() => {
    const pose = new PoseDetector();
    const ctx = canvasRef.current.getContext("2d");
    let stream = null;

    async function startCamera() {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();

      async function detect() {
        await pose.send(videoRef.current);

        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        pose.draw(ctx);

        const lm = pose.getLandmarks();

        if (lm) {
          const right = pose.calculateAngle(lm[16], lm[14], lm[12]);
          const left = pose.calculateAngle(lm[11], lm[13], lm[15]);

          const back = pose.calculateAngle(lm[24], lm[12], lm[11]);

          const shoulderLevel = Math.abs(
            pose.calculateAngle(lm[11], lm[23], lm[24]) -
              pose.calculateAngle(lm[12], lm[24], lm[23])
          );

          const min = 15;
          const max = 170;

          const rightRange =
            ((right - min) * 100) / (max - min);
          const leftRange =
            ((left - min) * 100) / (max - min);

          // -------- POSTURE CHECK --------
          let newMsg = "";

          if (back < 70 || back > 110) {
            newMsg = "KEEP YOUR BACK STRAIGHT!";
          } else if (shoulderLevel > 20) {
            newMsg = "SHOULDERS NOT LEVEL!";
          } else if (right <= 15 && left > 15) {
            newMsg = "Straighten LEFT arm!";
          } else if (left <= 15 && right > 15) {
            newMsg = "Straighten RIGHT arm!";
          } else {
            newMsg = "";
          }

          // -------- Frame Stability Filter --------
          if (newMsg !== "") {
            badFrames.current++;
            goodFrames.current = 0;

            if (badFrames.current >= requiredFrames) {
              currentMsg.current = newMsg;
              setFeedbackMessage(newMsg);
              if (onFeedbackChange) onFeedbackChange(newMsg);
            }
          } else {
            goodFrames.current++;
            badFrames.current = 0;

            if (goodFrames.current >= requiredFrames) {
              currentMsg.current = "";
              setFeedbackMessage("");
              if (onFeedbackChange) onFeedbackChange("");
            }
          }

          // -------- COUNTING --------
          if (rightRange <= 10 && currentMsg.current === "") {
            if (dir1.current === 0) {
              rcount.current += 0.5;
              dir1.current = 1;
            }
          }

          if (rightRange > 90 && currentMsg.current === "") {
            if (dir1.current === 1) {
              rcount.current += 0.5;
              dir1.current = 0;
            }
          }

          if (leftRange <= 10 && currentMsg.current === "") {
            if (dir2.current === 0) {
              lcount.current += 0.5;
              dir2.current = 1;
            }
          }

          if (leftRange > 90 && currentMsg.current === "") {
            if (dir2.current === 1) {
              lcount.current += 0.5;
              dir2.current = 0;
            }
          }

          // Check if both arms completed a rep (both increased by 1)
          const rightCompleted = Math.floor(rcount.current) > Math.floor(prevRcount.current);
          const leftCompleted = Math.floor(lcount.current) > Math.floor(prevLcount.current);
          
          if (rightCompleted && leftCompleted) {
            // Both arms completed a rep, send to parent
            if (onRepCount) onRepCount(1);
            prevRcount.current = Math.floor(rcount.current);
            prevLcount.current = Math.floor(lcount.current);
          } else if (rightCompleted) {
            prevRcount.current = Math.floor(rcount.current);
          } else if (leftCompleted) {
            prevLcount.current = Math.floor(lcount.current);
          }
        }

        // -------- DISPLAY --------
        ctx.fillStyle = "lime";
        ctx.font = "20px Arial";
        ctx.fillText(
          `Right: ${Math.floor(rcount.current)}`,
          20,
          30
        );
        ctx.fillText(
          `Left: ${Math.floor(lcount.current)}`,
          20,
          60
        );

        if (currentMsg.current !== "") {
          ctx.fillStyle = "red";
          ctx.fillText(currentMsg.current, 20, 100);
        }

        requestAnimationFrame(detect);
      }

      detect();
    }

    startCamera();

    return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
}