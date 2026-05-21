import { AbsoluteFill, Sequence } from "remotion";
import { AdminReports } from "../scenes/AdminReports.jsx";
import { GpsAttendance } from "../scenes/GpsAttendance.jsx";
import { LogoIntro } from "../scenes/LogoIntro.jsx";
import { Outro } from "../scenes/Outro.jsx";
import { WorkerCheckIn } from "../scenes/WorkerCheckIn.jsx";
import "../styles/connex-premium.css";

export const ConnexPromo = () => (
  <AbsoluteFill className="film-root">
    <Sequence from={0} durationInFrames={90}>
      <LogoIntro />
    </Sequence>
    <Sequence from={90} durationInFrames={150}>
      <WorkerCheckIn />
    </Sequence>
    <Sequence from={240} durationInFrames={150}>
      <GpsAttendance />
    </Sequence>
    <Sequence from={390} durationInFrames={150}>
      <AdminReports />
    </Sequence>
    <Sequence from={540} durationInFrames={60}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
