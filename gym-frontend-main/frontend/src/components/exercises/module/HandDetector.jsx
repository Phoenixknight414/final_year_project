import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default class HandDetector {
  constructor() {
    this.hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.results = null;

    this.hands.onResults((results) => {
      this.results = results;
    });
  }

  async send(image) {
    await this.hands.send({ image });
  }

  getLandmarks() {
    return this.results?.multiHandLandmarks || null;
  }

  draw(ctx) {
    if (!this.results?.multiHandLandmarks) return;

    for (const landmarks of this.results.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
        color: "#00FFFF",
        lineWidth: 3,
      });

      drawLandmarks(ctx, landmarks, {
        color: "#FFFF00",
        lineWidth: 2,
      });
    }
  }

  isHandRotatedWrong() {
  const landmarks = this.getLandmarks();

  if (!landmarks || landmarks.length === 0) {
    return false;
  }

  for (let lm of landmarks) {
    if (!lm || lm.length < 21) continue;

    const dx = Math.abs(lm[8].x - lm[20].x);
    const dy = Math.abs(lm[8].y - lm[20].y);

    if (dx > dy) {
      return true; // if ANY hand is wrong → block counting
    }
  }

  return false; // all hands are correct
}
}