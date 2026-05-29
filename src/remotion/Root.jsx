import { Composition } from "remotion";
import { ConnexPromo } from "./components/ConnexPromo.jsx";
import {
  ConnexPromoHebrew,
  ConnexPromoHebrewMobile,
  ConnexPromoHebrewMobileWithMusic,
  ConnexPromoHebrewWithMusic,
} from "./components/ConnexPromoHebrew.jsx";

export const RemotionRoot = () => (
  <>
    <Composition
      id="ConnexPromo"
      component={ConnexPromo}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="ConnexPromoHebrew"
      component={ConnexPromoHebrew}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="ConnexPromoHebrewWithMusic"
      component={ConnexPromoHebrewWithMusic}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="ConnexPromoHebrewMobile"
      component={ConnexPromoHebrewMobile}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="ConnexPromoHebrewMobileWithMusic"
      component={ConnexPromoHebrewMobileWithMusic}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
