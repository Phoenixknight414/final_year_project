import React, { useRef, useEffect } from "react";
import PoseDetector from "../module/PoseDetector";

export default function PushUpTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const counter = useRef(0);
  const stage = useRef("up");

  useEffect(() => {
    const pose = new PoseDetector();
    const ctx = canvasRef.current.getContext("2d");
    let stream = null;

    function calculateBodyAngle(shoulder, hip, ankle) {
      const radians =
        Math.atan2(ankle.y - hip.y, ankle.x - hip.x) -
        Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x);

      let angle = Math.abs((radians * 180) / Math.PI);
      if (angle > 180) angle = 360 - angle;
      return angle;
    }

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

        let feedback = "";
        let posture = "";

        if (lm) {
          // LEFT ARM
          const shoulder = lm[11];
          const elbow = lm[13];
          const wrist = lm[15];

          const angle = pose.calculateAngle(
            shoulder,
            elbow,
            wrist
          );

          // BODY POSTURE
          const hip = lm[23];
          const ankle = lm[27];

          const bodyAngle = calculateBodyAngle(
            shoulder,
            hip,
            ankle
          );

          // Convert elbow position to pixel coords
          const elbowX = elbow.x * 640;
          const elbowY = elbow.y * 480;

          // Display elbow angle
          ctx.fillStyle = "white";
          ctx.font = "20px Arial";
          ctx.fillText(
            `${Math.floor(angle)}`,
            elbowX,
            elbowY
          );

          const UP_THRESHOLD = 165;
          const DOWN_THRESHOLD = 85;
          const BODY_THRESHOLD = 160;

          if (bodyAngle > BODY_THRESHOLD) {
            if (stage.current === "up" && angle < DOWN_THRESHOLD) {
              stage.current = "down";
            } else if (
              stage.current === "down" &&
              angle > UP_THRESHOLD
            ) {
              stage.current = "up";
              counter.current += 1;
            }
          } else {
            feedback = "Keep body straight";
          }

          // Feedback
          if (angle > 160) {
            feedback = "Lower your body";
          } else if (angle < 90) {
            feedback = "Push up!";
          }

          if (bodyAngle > 160) {
            posture = "Perfect";
          } else if (bodyAngle > 140) {
            posture = "Slight bend";
          } else {
            posture = "Bad posture";
          }

          // Counter box
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, 270, 100);

          ctx.fillStyle = "lime";
          ctx.font = "28px Arial";
          ctx.fillText(
            `Reps: ${counter.current}`,
            10,
            60
          );

          ctx.fillStyle = "yellow";
          ctx.font = "18px Arial";
          ctx.fillText(feedback, 280, 60);

          ctx.fillStyle = "cyan";
          ctx.fillText(posture, 280, 90);
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