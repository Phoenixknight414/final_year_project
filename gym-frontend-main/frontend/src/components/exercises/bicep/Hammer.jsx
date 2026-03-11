import React, { useRef, useEffect } from "react";
import PoseDetector from "../module/PoseDetector";
import HandDetector from "../module/HandDetector";

export default function HammerCurlTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const rcount = useRef(0);
  const lcount = useRef(0);
  const dir1 = useRef(0);
  const dir2 = useRef(0);

  const badFrames = useRef(0);
  const goodFrames = useRef(0);
  const currentMsg = useRef("");

  const allowCounting = useRef(true);
  const handMsg = useRef("");

  const requiredFrames = 7;

  useEffect(() => {
    const pose = new PoseDetector();
    const hands = new HandDetector();
    const ctx = canvasRef.current.getContext("2d");
    let stream = null;
    
    async function startCamera() {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();

      let frameCount = 0;

      async function detect() {
        frameCount++;

        await pose.send(videoRef.current);

        if (frameCount % 2 === 0) {
          await hands.send(videoRef.current);
        }

        ctx.drawImage(videoRef.current, 0, 0, 640, 480);

        pose.draw(ctx);
        hands.draw(ctx);

        const lm = pose.getLandmarks();
        const handWrong = hands.isHandRotatedWrong();

        allowCounting.current = !handWrong;
        handMsg.current = handWrong
          ? "Rotate your hand so that thumb is on top"
          : "";

        if (lm) {
          const right = pose.calculateAngle(lm[16], lm[14], lm[12]);
          const left = pose.calculateAngle(lm[11], lm[13], lm[15]);
          const back = pose.calculateAngle(lm[24], lm[12], lm[11]);

          const a1 = pose.calculateAngle(lm[11], lm[23], lm[24]);
          const a2 = pose.calculateAngle(lm[12], lm[24], lm[23]);

          const shoulderLevel = Math.abs(a1 - a2);

          const min = 15;
          const max = 170;

          const rightRange = ((right - min) * 100) / (max - min);
          const leftRange = ((left - min) * 100) / (max - min);

          const shoulderWidth = Math.abs(lm[12].x - lm[11].x);
          const elbowL = Math.abs(lm[13].x - lm[11].x);
          const elbowR = Math.abs(lm[14].x - lm[12].x);

          let newMsg = "";

          if (handMsg.current !== "") {
            newMsg = handMsg.current;
          } else if (back < 70 || back > 110) {
            newMsg = "KEEP YOUR BACK STRAIGHT!";
          } else if (shoulderLevel > 20) {
            newMsg = "SHOULDERS NOT LEVEL!";
          } else if (elbowL > shoulderWidth * 0.4) {
            newMsg = "DON'T MOVE LEFT ELBOW!";
          } else if (elbowR > shoulderWidth * 0.4) {
            newMsg = "DON'T MOVE RIGHT ELBOW!";
          }

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

          if (
            rightRange <= 10 &&
            currentMsg.current === "" &&
            allowCounting.current
          ) {
            if (dir1.current === 0) {
              rcount.current += 0.5;
              dir1.current = 1;
            }
          }

          if (
            rightRange > 90 &&
            currentMsg.current === "" &&
            allowCounting.current
          ) {
            if (dir1.current === 1) {
              rcount.current += 0.5;
              dir1.current = 0;
            }
          }

          if (
            leftRange <= 10 &&
            currentMsg.current === "" &&
            allowCounting.current
          ) {
            if (dir2.current === 0) {
              lcount.current += 0.5;
              dir2.current = 1;
            }
          }

          if (
            leftRange > 90 &&
            currentMsg.current === "" &&
            allowCounting.current
          ) {
            if (dir2.current === 1) {
              lcount.current += 0.5;
              dir2.current = 0;
            }
          }
        }

        ctx.fillStyle = "lime";
        ctx.font = "20px Arial";
        ctx.fillText(`Right: ${Math.floor(rcount.current)}`, 20, 30);
        ctx.fillText(`Left: ${Math.floor(lcount.current)}`, 20, 60);

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