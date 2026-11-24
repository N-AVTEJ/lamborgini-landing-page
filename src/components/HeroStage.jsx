import React, { useState, useEffect } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';

const heroSlides = [
  {
    id: 'defender-octa',
    eyebrow: 'MASTER OF EXTREMES',
    title: 'DEFENDER OCTA',
    subtitle: 'THE MOST POWERFUL & CAPABLE DEFENDER EVER BUILT — 635 PS TWIN-TURBO V8',
    image: '/images/defender-octa-yellow-spotlight.jpg',
    actionText: 'EXPLORE DEFENDER OCTA',
    targetSection: '#showroom-spotlight'
  },
  {
    id: 'defender-110',
    eyebrow: 'UNSTOPPABLE BY DESIGN',
    title: 'DEFENDER 110',
    subtitle: 'PURPOSEFUL GEOMETRY, 525 PS SUPERCHARGED V8 AND WORLD-CONQUERING 4X4',
    image: '/images/defender-110-hero-night.jpg',
    actionText: 'DISCOVER DEFENDER 110',
    targetSection: '#models'
  }
];

export default function HeroStage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = heroSlides[currentSlide];

  return (
    <section
      aria-label="Hero Stage"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--color-carbony-black)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingTop: '64px' // navbar offset
      }}
    >
      {/* Background Cinematic Imagery with 0px radius & subtle Ken Burns drift */}
      {heroSlides.map((item, index) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentSlide ? 1 : 0,
            transform: index === currentSlide ? 'scale(1.035)' : 'scale(1.0)',
            transition: 'opacity 0.8s ease-in-out, transform 6s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 1
          }}
        >
          {/* Subtle dark vignette to maximize contrast for typography */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(24, 24, 24, 0.88) 0%, rgba(24, 24, 24, 0.42) 48%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(to top, rgba(24, 24, 24, 0.96) 0%, transparent 40%)'
            }}
          />
        </div>
      ))}

      {/* Main Content Stage: Left-aligned column, max 50% width */}
      <div
        className="defender-container lambo-container"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          paddingBottom: '80px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            flexWrap: 'wrap',
            gap: '32px'
          }}
        >
          {/* Content Column: Max 50% viewport width with sleek reveal */}
          <div key={slide.id} className="animate-monolithic-reveal" style={{ maxWidth: '640px', width: '100%' }}>
            {/* Eyebrow Label: 12-16px Defender Condensed UPPERCASE */}
            <div
              style={{
                fontSize: '14px',
                letterSpacing: '0.0230em',
                lineHeight: '1.5',
                color: 'var(--color-pearl-white)',
                marginBottom: '16px',
                textTransform: 'uppercase'
              }}
            >
              {slide.eyebrow}
            </div>

            {/* Monolithic Display Headline: 80-120px UPPERCASE, line-height 0.92 */}
            <h1
              style={{
                fontSize: 'clamp(80px, 8.5vw, 120px)',
                lineHeight: 0.92,
                letterSpacing: '0.0230em',
                color: 'var(--color-pearl-white)',
                marginBottom: '20px',
                textTransform: 'uppercase'
              }}
            >
              {slide.title}
            </h1>

            {/* Subtitle / Spec statement */}
            <p
              style={{
                fontSize: 'clamp(14px, 2vw, 18px)',
                lineHeight: 1.35,
                letterSpacing: '0.0230em',
                color: 'var(--color-pearl-white)',
                marginBottom: '32px',
                textTransform: 'uppercase'
              }}
            >
              {slide.subtitle}
            </p>

            {/* Giallo Action Button — Sole vivid yellow element on this screen */}
            <div>
              <a
                href={slide.targetSection}
                className="btn-giallo"
                style={{
                  fontSize: '14px',
                  padding: '16px 24px',
                  color: 'var(--color-pearl-white)'
                }}
              >
                <span>{slide.actionText}</span>
                <ArrowRight size={16} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Carousel Navigation Pips & Hexagonal Pause Button anchored bottom-right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              paddingBottom: '8px'
            }}
          >
            {/* Horizontal short lines with hairline precision */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    position: 'relative',
                    width: '40px',
                    height: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: idx === currentSlide ? '100%' : '0%',
                      backgroundColor: 'var(--color-pearl-white)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Hexagonal Pause Button outlined in #ffffff */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume Carousel" : "Pause Carousel"}
              aria-label={isPaused ? "Play slide carousel" : "Pause slide carousel"}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {/* Hexagon outline SVG */}
              <svg width="36" height="36" viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }}>
                <polygon
                  points="20,2 36,11 36,29 20,38 4,29 4,11"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  fill="transparent"
                />
              </svg>
              <span style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
                {isPaused ? <Play size={14} fill="#ffffff" /> : <Pause size={14} fill="#ffffff" />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
