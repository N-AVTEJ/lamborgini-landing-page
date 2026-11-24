import React from 'react';
import Navbar from './components/Navbar';
import HeroStage from './components/HeroStage';
import ModelLineupSection from './components/ModelLineupSection';
import ShowroomSpotlightStage from './components/ShowroomSpotlightStage';
import StoryGridSection from './components/StoryGridSection';
import FullBleedEditorialImage from './components/FullBleedEditorialImage';
import EventBannerSection from './components/EventBannerSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="lambo-app defender-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Primary Site Navigation Bar (Fixed 64px, Carbony Black #202020) */}
      <Navbar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 2. Hero Stage: Full-bleed cinematic opener, dark canvas #202020 */}
        <HeroStage />

        {/* 3. Light Editorial Band: #ffffff Page Canvas with Models Grid */}
        <ModelLineupSection />

        {/* 4. Flagship Dark Product Showcase: "Showroom black with one yellow car under spotlights" */}
        <ShowroomSpotlightStage />

        {/* 5. Light Editorial Section: Canvas White #ffffff Three-Column Story Grid */}
        <StoryGridSection />

        {/* 6. Full-Bleed Editorial Image: 100% width, 0px radius, no caption overlay */}
        <FullBleedEditorialImage
          image="/images/defender-rally-expedition.jpg"
          alt="Land Rover Defender OCTA rally raid conquering extreme desert sand dunes at high speed"
        />

        {/* 7. Event Banner Band: Lighter photographic background, white headline, Giallo CTA button, 40px padding */}
        <EventBannerSection />
      </main>

      {/* 8. Full-width Dark Footer: Carbon Deep #181818 */}
      <Footer />
    </div>
  );
}
