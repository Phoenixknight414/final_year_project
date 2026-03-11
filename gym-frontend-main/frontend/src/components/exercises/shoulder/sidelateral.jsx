import React, { useRef, useEffect } from "react";
import PoseDetector from "../module/PoseDetector";

export default function LateralRaiseTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const rcount = useRef(0);
  const dir1 = useRef(0);

  const badFrames = useRef(0);
  const goodFrames = useRef(0);
  const currentMsg = useRef("");

  const requiredFrames = 7;

  function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

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

        // ---------------- ARM ANGLES ----------------

        const leftElbow = pose.calculateAngle(
          lm[11],
          lm[13],
          lm[15]
        );

        const rightElbow = pose.calculateAngle(
          lm[12],
          lm[14],
          lm[16]
        );

        const rightArm = pose.calculateAngle(
          lm[24],
          lm[12],
          lm[14]
        );

        const leftArm = pose.calculateAngle(
          lm[23],
          lm[11],
          lm[13]
        );

        const backAngle = pose.calculateAngle(
          lm[24],
          lm[12],
          lm[11]
        );

        if (
          leftArm === null ||
          rightArm === null ||
          backAngle === null
        ) {
          ctx.fillStyle = "red";
          ctx.fillText("BODY NOT FULLY DETECTED", 40, 60);
          requestAnimationFrame(detect);
          return;
        }

        // ---------------- RANGE MAPPING ----------------

        const minAngle = 30;
        const maxAngle = 87;

        const leftArmC = Math.max(
          minAngle,
          Math.min(maxAngle, leftArm)
        );

        const rightArmC = Math.max(
          minAngle,
          Math.min(maxAngle, rightArm)
        );

        const leftRange =
          ((leftArmC - minAngle) * (0 - 100)) /
            (maxAngle - minAngle) +
          100;

        const rightRange =
          ((rightArmC - minAngle) * (0 - 100)) /
            (maxAngle - minAngle) +
          100;

        const avgRange = (leftRange + rightRange) / 2;

        // ---------------- ELBOW BEND CHECK ----------------

        const upperArmL = distance(lm[11], lm[13]);
        const forearmL = distance(lm[13], lm[15]);
        const fullArmL = distance(lm[11], lm[15]);
        const ratioL = fullArmL / (upperArmL + forearmL);

        const upperArmR = distance(lm[12], lm[14]);
        const forearmR = distance(lm[14], lm[16]);
        const fullArmR = distance(lm[12], lm[16]);
        const ratioR = fullArmR / (upperArmR + forearmR);

        // ---------------- SIDEWAYS CHECK ----------------

        const dxLeft = Math.abs(lm[15].x - lm[11].x);
        const dyLeft = Math.abs(lm[15].y - lm[11].y);

        const dxRight = Math.abs(lm[16].x - lm[12].x);
        const dyRight = Math.abs(lm[16].y - lm[12].y);

        // ---------------- POSTURE CHECK ----------------

        let newMsg = "";

        if (backAngle < 65 || backAngle > 135) {
          newMsg = "KEEP YOUR BACK STRAIGHT!";
        } else if (dxLeft < dyLeft && dxRight < dyRight) {
          newMsg = "MOVE BOTH HANDS SIDEWAYS!";
        } else if (leftArm > 100 || rightArm > 100) {
          newMsg = "DON'T GO ABOVE SHOULDERS!";
        } else if (ratioL < 0.95) {
          newMsg = "Left arm bending too much";
        } else if (ratioR < 0.95) {
          newMsg = "Right arm bending too much";
        }

        // ---------------- STABILITY FILTER ----------------

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

        if (avgRange < 10 && currentMsg.current === "") {
          if (dir1.current === 0) {
            rcount.current += 0.5;
            dir1.current = 1;
          }
        }

        if (avgRange > 90 && currentMsg.current === "") {
          if (dir1.current === 1) {
            rcount.current += 0.5;
            dir1.current = 0;
          }
        }

        // ---------------- DISPLAY ----------------

        ctx.fillStyle = "lime";
        ctx.font = "22px Arial";
        ctx.fillText(
          `Lateral Raises: ${Math.floor(rcount.current)}`,
          40,
          120
        );

        ctx.fillText(
          `avg_range: ${Math.floor(avgRange)}`,
          40,
          150
        );

        ctx.fillText(
          `right arm: ${Math.floor(rightArm)}`,
          40,
          180
        );

        ctx.fillStyle = "blue";
        ctx.fillText(
          `L ratio: ${ratioL.toFixed(2)}`,
          400,
          200
        );

        ctx.fillText(
          `R ratio: ${ratioR.toFixed(2)}`,
          400,
          230
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