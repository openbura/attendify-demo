import { interpolate, useCurrentFrame } from "remotion";
import { CinematicBackground } from "../components/CinematicBackground.jsx";
import { GlassCard } from "../components/GlassCard.jsx";
import { fade, fadeOut, numberAt, tween } from "../lib/motion.js";

const Counter = ({ value, suffix = "", delay = 30 }) => {
  const frame = useCurrentFrame();
  return <>{Math.round(numberAt(frame, delay, delay + 58, 0, value))}{suffix}</>;
};

const MetricCard = ({ label, value, suffix, tone, delay }) => {
  const frame = useCurrentFrame();
  return (
    <GlassCard className={`dashboard-metric ${tone}`} style={{ opacity: fade(frame, delay, delay + 20), transform: `translateY(${tween(frame, delay, delay + 24, 22, 0)}px)` }}>
      <span>{label}</span>
      <strong><Counter value={value} suffix={suffix} delay={delay + 12} /></strong>
    </GlassCard>
  );
};

export const AdminReports = () => {
  const frame = useCurrentFrame();
  const sceneOpacity = fade(frame, 0, 18) * fadeOut(frame, 136, 150);
  const bars = [54, 68, 48, 82, 73, 92, 78];
  const linePoints = bars.map((height, index) => `${index * 98 + 12},${150 - height}`).join(" ");

  return (
    <CinematicBackground variant="reports-bg" intensity={1}>
      <div className="scene-fade premium-scene" style={{ opacity: sceneOpacity }}>
        <div className="reports-layout">
          <div className="scene-copy reports-copy">
            <span>Real-time operations</span>
            <h2>Every site, visible in seconds.</h2>
            <p>Present workers, missing arrivals, hours, and attendance rate update in a dashboard built for action.</p>
          </div>
          <div className="desktop-stage" style={{ transform: `perspective(1400px) rotateX(${tween(frame, 0, 52, 5, 0)}deg) rotateY(${tween(frame, 0, 150, -5, -1.5)}deg) translateY(${tween(frame, 0, 150, 28, -10)}px)` }}>
            <div className="desktop-shell">
              <div className="desktop-chrome"><span /><span /><span /><strong>Connex Admin</strong></div>
              <div className="dashboard-body">
                <aside className="dashboard-sidebar">
                  <strong>Connex</strong>
                  <i />
                  <i />
                  <i />
                </aside>
                <main className="dashboard-main">
                  <div className="dashboard-topline">
                    <div><span>Live operations</span><strong>Construction workforce overview</strong></div>
                    <div className="live-indicator">Live sync</div>
                  </div>
                  <div className="dashboard-grid">
                    <MetricCard label="Present workers" value={91} tone="green" delay={30} />
                    <MetricCard label="Missing today" value={6} tone="amber" delay={38} />
                    <MetricCard label="Total hours" value={687} suffix="h" tone="blue" delay={46} />
                    <MetricCard label="Attendance rate" value={94} suffix="%" tone="cyan" delay={54} />
                  </div>
                  <GlassCard className="chart-card" style={{ opacity: fade(frame, 64, 86) }}>
                    <div className="chart-header"><span>Site activity</span><strong>Today</strong></div>
                    <div className="chart-area">
                      {bars.map((height, index) => (
                        <span
                          className="chart-bar"
                          key={height + index}
                          style={{
                            height: `${height}%`,
                            opacity: fade(frame, 70 + index * 4, 90 + index * 4),
                            transform: `scaleY(${interpolate(frame, [70 + index * 4, 100 + index * 4], [0.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                          }}
                        />
                      ))}
                      <svg className="chart-line" viewBox="0 0 620 170" aria-hidden="true">
                        <polyline points={linePoints} />
                      </svg>
                    </div>
                  </GlassCard>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CinematicBackground>
  );
};
