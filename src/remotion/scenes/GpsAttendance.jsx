import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CinematicBackground } from "../components/CinematicBackground.jsx";
import { GlassCard } from "../components/GlassCard.jsx";
import { fade, fadeOut, tween } from "../lib/motion.js";

export const GpsAttendance = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pinReveal = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 86 } });
  const ring = fade(frame, 38, 92);
  const worker = fade(frame, 68, 118);
  const success = fade(frame, 112, 136);
  const sceneOpacity = fade(frame, 0, 18) * fadeOut(frame, 136, 150);

  return (
    <CinematicBackground variant="gps-bg" intensity={1.15}>
      <div className="scene-fade premium-scene" style={{ opacity: sceneOpacity }}>
        <div className="scene-kicker center" style={{ opacity: fade(frame, 8, 28) }}>GPS Attendance</div>
        <div className="gps-layout">
          <div className="gps-viewport" style={{ transform: `scale(${tween(frame, 0, 150, 1.015, 1)}) translateY(${tween(frame, 0, 150, 18, -8)}px)` }}>
            <div className="map-mesh" style={{ transform: `translate3d(${tween(frame, 0, 150, 28, -22)}px, ${tween(frame, 0, 150, 10, -14)}px, 0)` }} />
            <div className="map-route route-a" />
            <div className="map-route route-b" />
            <div className="map-route route-c" />
            <div className="site-footprint one" />
            <div className="site-footprint two" />
            <div className="site-footprint three" />
            <div className="gps-ring ring-one" style={{ opacity: ring * 0.55, transform: `translate(-50%, -50%) scale(${0.52 + ring * 0.92})` }} />
            <div className="gps-ring ring-two" style={{ opacity: ring * 0.32, transform: `translate(-50%, -50%) scale(${0.86 + ring * 1.08})` }} />
            <div className="site-beacon" style={{ opacity: fade(frame, 18, 34), transform: `translate(-50%, -50%) scale(${0.72 + pinReveal * 0.28})` }}>
              <span />
            </div>
            <div
              className="worker-dot"
              style={{
                opacity: fade(frame, 56, 72),
                transform: `translate(${interpolate(worker, [0, 1], [-430, -28])}px, ${interpolate(worker, [0, 1], [210, 18])}px)`,
              }}
            />
            <GlassCard className="gps-status-card" style={{ opacity: success, transform: `translateY(${tween(frame, 112, 136, 18, 0)}px)` }}>
              <span>GPS verified</span>
              <strong>Within site radius</strong>
            </GlassCard>
          </div>
          <div className="scene-copy gps-copy">
            <span>Advanced location controls</span>
            <h2>Attendance tied to the actual site.</h2>
            <p>Connex confirms worker presence inside the approved radius before the check-in is accepted.</p>
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};
