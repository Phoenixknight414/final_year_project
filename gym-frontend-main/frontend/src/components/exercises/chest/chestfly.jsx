import React, { useRef, useEffect } from "react";
import PoseDetector from "../module/PoseDetector";

export default function ChestFlyTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const rcount = useRef(0);
  const dir1 = useRef(0);

  const badFrames = useRef(0);
  const goodFrames = useRef(0);
  const currentMsg = useRef("");

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

        let flyRange = 0;

        if (lm) {
          // ---------------- WRISTS ----------------
          const x1 = lm[15].x * 640;
          const y1 = lm[15].y * 480;

          const x2 = lm[16].x * 640;
          const y2 = lm[16].y * 480;

          // ---------------- SHOULDERS ----------------
          const sx1 = lm[11].x * 640;
          const sy1 = lm[11].y * 480;

          const sx2 = lm[12].x * 640;
          const sy2 = lm[12].y * 480;

          // ---------- Wrist Distance ----------
          const wristDist = Math.hypot(x2 - x1, y2 - y1);

          const minDist = 60;
          const maxDist = 320;

          flyRange =
            ((wristDist - minDist) * (0 - 100)) /
              (maxDist - minDist) +
            100;

          // Clamp
          flyRange = Math.max(0, Math.min(100, flyRange));

          // ---------- Elbow Bend ----------
          const rightElbow = pose.calculateAngle(
            lm[12],
            lm[14],
            lm[16]
          );

          const leftElbow = pose.calculateAngle(
            lm[11],
            lm[13],
            lm[15]
          );

          // ---------- Back ----------
          const backAngle = pose.calculateAngle(
            lm[24],
            lm[12],
            lm[11]
          );

          // ---------- Shoulder Level ----------
          const shoulderLevel = Math.abs(sy1 - sy2);

          // -------- POSTURE CHECK --------
          let newMsg = "";

          if (backAngle < 60 || backAngle > 130) {
            newMsg = "KEEP YOUR BACK STRAIGHT!";
          } else if (shoulderLevel > 45) {
            newMsg = "LEVEL YOUR SHOULDERS!";
          } else if (
            rightElbow < 100 ||
            leftElbow < 100
          ) {
            newMsg = "DON'T BEND ELBOWS TOO MUCH!";
          }

          // -------- Stability Filter --------
          if (newMsg !== "") {
            badFrames.current++;
            goodFrames.current = 0;

            if (badFrames.current >= requiredFrames)
              currentMsg.current = newMsg;
          } else {
            goodFrames.current++;
            badFrames.current = 0;

            if (goodFrames.current >= requiredFrames)
              currentMsg.current = "";
          }

          // -------- REP COUNTING --------
          if (
            flyRange >= 38 &&
            currentMsg.current === ""
          ) {
            if (dir1.current === 0) {
              rcount.current += 1;
              dir1.current = 1;
            }
          }

          if (
            flyRange <= 5 &&
            currentMsg.current === ""
          ) {
            if (dir1.current === 1) {
              dir1.current = 0;
            }
          }

          // Debug Info (like Python)
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";

          ctx.fillText(
            `Back: ${Math.floor(backAngle)}`,
            400,
            120
          );

          ctx.fillText(
            `R-Elbow: ${Math.floor(rightElbow)}`,
            400,
            160
          );

          ctx.fillText(
            `L-Elbow: ${Math.floor(leftElbow)}`,
            400,
            200
          );

          ctx.fillText(
            `ShoulderDiff: ${Math.floor(shoulderLevel)}`,
            400,
            240
          );
        }

        // -------- DISPLAY --------
        ctx.fillStyle = "lime";
        ctx.font = "20px Arial";

        ctx.fillText(
          `Reps: ${Math.floor(rcount.current)}`,
          40,
          120
        );

        ctx.fillText(
          `Range: ${Math.floor(flyRange)}%`,
          40,
          160
        );

        if (currentMsg.current !== "") {
          ctx.fillStyle = "red";
          ctx.fillText(
            currentMsg.current,
            40,
            60
          );
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