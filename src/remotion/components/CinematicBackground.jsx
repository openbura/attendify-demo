import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const CinematicBackground = ({ children, variant = "default", intensity = 1 }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
  });

  return (
    <AbsoluteFill className={`cinematic-bg ${variant}`}>
      <div
        className="blueprint-layer blueprint-back"
        style={{ transform: `translate3d(${-34 * drift}px, ${18 * drift}px, 0) scale(${1.02 + drift * 0.015})` }}
      >
        <span className="bp-line h one" />
        <span className="bp-line h two" />
        <span className="bp-line h three" />
        <span className="bp-line v one" />
        <span className="bp-line v two" />
        <span className="bp-line angle one" />
        <span className="bp-line angle two" />
        <span className="bp-node a" />
        <span className="bp-node b" />
        <span className="bp-node c" />
      </div>
      <div
        className="grid-depth"
        style={{
          opacity: 0.35 + intensity * 0.08,
          transform: `perspective(900px) rotateX(62deg) translateY(${28 * drift}px) translateX(${-14 * drift}px)`,
        }}
      />
      <div className="atmosphere-lines" style={{ transform: `translateX(${-42 * drift}px)` }} />
      <div className="film-vignette" />
      {children}
    </AbsoluteFill>
  );
};
