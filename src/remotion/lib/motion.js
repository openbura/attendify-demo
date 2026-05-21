import { Easing, interpolate } from "remotion";

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const slowEase = Easing.bezier(0.45, 0, 0.2, 1);

export const fade = (frame, start, end) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: slowEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const fadeOut = (frame, start, end) =>
  interpolate(frame, [start, end], [1, 0], {
    easing: slowEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const tween = (frame, start, end, from, to) =>
  interpolate(frame, [start, end], [from, to], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const numberAt = (frame, start, end, from, to) =>
  interpolate(frame, [start, end], [from, to], {
    easing: slowEase,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
