import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default class PoseDetector {
  constructor() {
    this.pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    this.pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.results = null;

    this.pose.onResults((results) => {
      if (results.poseLandmarks) {
        this.results = results;
      }
    });
  }

  async send(image) {
    await this.pose.send({ image });
  }

  getLandmarks() {
    return this.results?.poseLandmarks || null;
  }

  draw(ctx) {
    if (!this.results?.poseLandmarks) return;

    drawConnectors(ctx, this.results.poseLandmarks, POSE_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 4,
    });

    drawLandmarks(ctx, this.results.poseLandmarks, {
      color: "#FF0000",
      lineWidth: 2,
    });
  }

  calculateAngle(a, b, c) {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);

    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  }
}
