import React, { useRef, useEffect } from "react";
import PoseDetector from "../module/PoseDetector";

export default function LungesTracker() {
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

        if (!lm) {
          ctx.fillStyle = "red";
          ctx.font = "22px Arial";
          ctx.fillText("NO PERSON DETECTED", 40, 60);
          requestAnimationFrame(detect);
          return;
        }

        // ---------------- LEG ANGLES ----------------

        const leftKnee = pose.calculateAngle(
          lm[23],
          lm[25],
          lm[27]
        );

        const rightKnee = pose.calculateAngle(
          lm[24],
          lm[26],
          lm[28]
        );

        const backAngle = pose.calculateAngle(
          lm[24],
          lm[12],
          lm[11]
        );

        if (
          leftKnee === null ||
          rightKnee === null ||
          backAngle === null
        ) {
          ctx.fillStyle = "red";
          ctx.font = "22px Arial";
          ctx.fillText(
            "BODY NOT FULLY DETECTED",
            40,
            60
          );
          requestAnimationFrame(detect);
          return;
        }

        // ---------------- RANGE MAPPING ----------------

        const minAngle = 70;
        const maxAngle = 170;

        const leftRange =
          ((leftKnee - minAngle) * (0 - 100)) /
            (maxAngle - minAngle) +
          100;

        const rightRange =
          ((rightKnee - minAngle) * (0 - 100)) /
            (maxAngle - minAngle) +
          100;

        const lRange = Math.max(
          0,
          Math.min(100, leftRange)
        );
        const rRange = Math.max(
          0,
          Math.min(100, rightRange)
        );

        const avgRange = (lRange + rRange) / 2;

        // ---------------- POSTURE CHECK ----------------

        let newMsg = "";

        if (backAngle < 65 || backAngle > 135) {
          newMsg = "KEEP YOUR BACK STRAIGHT!";
        } else if (
          Math.abs(lRange - rRange) > 50
        ) {
          newMsg = "BEND BOTH LEGS!";
        } else if (
          leftKnee > 155 &&
          rightKnee > 155
        ) {
          newMsg = "GO LOWER!";
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

        // ---------------- REP COUNT ----------------

        // Down
        if (
          avgRange >= 85 &&
          currentMsg.current === ""
        ) {
          if (dir1.current === 0) {
            rcount.current += 0.5;
            dir1.current = 1;
          }
        }

        // Up
        if (
          avgRange <= 10 &&
          currentMsg.current === ""
        ) {
          if (dir1.current === 1) {
            rcount.current += 0.5;
            dir1.current = 0;
          }
        }

        // ---------------- DISPLAY ----------------

        ctx.fillStyle = "red";
        ctx.font = "22px Arial";
        ctx.fillText(
          `Lunges: ${Math.floor(rcount.current)}`,
          40,
          120
        );

        ctx.fillStyle = "yellow";
        ctx.fillText(
          `Depth: ${Math.floor(avgRange)}%`,
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